import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const productionOrderSchema = Joi.object({
  salesOrderId: Joi.string().allow(null),
  priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').default('NORMAL'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      materialId: Joi.string().allow(null),
      productId: Joi.string().allow(null),
      quantity: Joi.number().min(1).required(),
      unitCost: Joi.number().min(0).default(0)
    })
  ).min(1).required()
});

const updateProductionStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  completedDate: Joi.date().optional()
});

// GET /api/production - Listar órdenes de producción
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, status, priority, startDate, endDate } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  const [productions, total] = await Promise.all([
    prisma.productionOrder.findMany({
      where,
      include: {
        salesOrder: {
          include: {
            customer: true
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            material: {
              include: {
                category: true
              }
            },
            product: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.productionOrder.count({ where })
  ]);

  res.json({
    productions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/production/:id - Obtener orden de producción por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const production = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      salesOrder: {
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      },
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          },
          product: true
        }
      }
    }
  });

  if (!production) {
    throw createError('Orden de producción no encontrada', 404);
  }

  res.json(production);
}));

// POST /api/production - Crear orden de producción
router.post('/', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = productionOrderSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { salesOrderId, priority, startDate, endDate, notes, items } = value;
  const userId = req.user!.id;

  // Verificar que la orden de venta existe (si se proporciona)
  if (salesOrderId) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId }
    });

    if (!salesOrder) {
      throw createError('Orden de venta no encontrada', 404);
    }
  }

  // Verificar stock de materiales necesarios
  for (const item of items) {
    if (item.materialId && !item.isOutput) {
      const material = await prisma.material.findUnique({
        where: { id: item.materialId }
      });

      if (!material) {
        throw createError(`Material ${item.materialId} no encontrado`, 404);
      }

      if (material.currentStock < item.quantity) {
        throw createError(`Stock insuficiente para el material ${material.name}. Disponible: ${material.currentStock}`, 400);
      }
    }
  }

  // Generar número de orden
  const orderCount = await prisma.productionOrder.count();
  const orderNumber = `OP-${String(orderCount + 1).padStart(6, '0')}`;

  // Crear orden de producción con items
  const production = await prisma.productionOrder.create({
    data: {
      orderNumber,
      salesOrderId,
      userId,
      priority,
      startDate,
      endDate,
      notes,
      items: {
        create: items.map(item => ({
          materialId: item.materialId,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          isOutput: !!item.productId
        }))
      }
    },
    include: {
      salesOrder: {
        include: {
          customer: true
        }
      },
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          },
          product: true
        }
      }
    }
  });

  res.status(201).json({
    message: 'Orden de producción creada exitosamente',
    production
  });
}));

// PUT /api/production/:id/status - Actualizar estado de orden de producción
router.put('/:id/status', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = updateProductionStatusSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { status, startDate, endDate, completedDate } = value;

  // Verificar que la orden existe
  const existingProduction = await prisma.productionOrder.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!existingProduction) {
    throw createError('Orden de producción no encontrada', 404);
  }

  // Si se marca como completada, actualizar inventarios
  if (status === 'COMPLETED' && existingProduction.status !== 'COMPLETED') {
    // Reducir stock de materiales de entrada
    for (const item of existingProduction.items) {
      if (item.materialId && !item.isOutput) {
        await prisma.material.update({
          where: { id: item.materialId },
          data: {
            currentStock: {
              decrement: item.quantity
            }
          }
        });

        // Crear movimiento de inventario
        await prisma.inventoryMovement.create({
          data: {
            materialId: item.materialId,
            type: 'OUT',
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
            reference: existingProduction.orderNumber,
            notes: `Consumo para producción ${existingProduction.orderNumber}`
          }
        });
      }

      // Aumentar stock de productos de salida
      if (item.productId && item.isOutput) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity
            }
          }
        });
      }
    }
  }

  const production = await prisma.productionOrder.update({
    where: { id },
    data: {
      status,
      startDate: status === 'IN_PROGRESS' ? (startDate || new Date()) : existingProduction.startDate,
      endDate: status === 'COMPLETED' ? (endDate || new Date()) : existingProduction.endDate,
      completedDate: status === 'COMPLETED' ? (completedDate || new Date()) : null
    },
    include: {
      salesOrder: {
        include: {
          customer: true
        }
      },
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          },
          product: true
        }
      }
    }
  });

  res.json({
    message: 'Estado de orden de producción actualizado exitosamente',
    production
  });
}));

// PUT /api/production/:id - Actualizar orden de producción
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'PRODUCTION']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = productionOrderSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que la orden existe y no está completada
  const existingProduction = await prisma.productionOrder.findUnique({
    where: { id }
  });

  if (!existingProduction) {
    throw createError('Orden de producción no encontrada', 404);
  }

  if (existingProduction.status === 'COMPLETED') {
    throw createError('No se puede modificar una orden ya completada', 400);
  }

  const { salesOrderId, priority, startDate, endDate, notes, items } = value;

  // Actualizar orden (eliminar items existentes y crear nuevos)
  const production = await prisma.$transaction(async (tx) => {
    // Eliminar items existentes
    await tx.productionItem.deleteMany({
      where: { productionOrderId: id }
    });

    // Actualizar orden
    const updatedProduction = await tx.productionOrder.update({
      where: { id },
      data: {
        salesOrderId,
        priority,
        startDate,
        endDate,
        notes,
        items: {
          create: items.map(item => ({
            materialId: item.materialId,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            isOutput: !!item.productId
          }))
        }
      },
      include: {
        salesOrder: {
          include: {
            customer: true
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            material: {
              include: {
                category: true
              }
            },
            product: true
          }
        }
      }
    });

    return updatedProduction;
  });

  res.json({
    message: 'Orden de producción actualizada exitosamente',
    production
  });
}));

// DELETE /api/production/:id - Eliminar orden de producción
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const production = await prisma.productionOrder.findUnique({
    where: { id }
  });

  if (!production) {
    throw createError('Orden de producción no encontrada', 404);
  }

  if (production.status === 'COMPLETED') {
    throw createError('No se puede eliminar una orden ya completada', 400);
  }

  await prisma.productionOrder.delete({
    where: { id }
  });

  res.json({ message: 'Orden de producción eliminada exitosamente' });
}));

// GET /api/production/stats/summary - Estadísticas de producción
router.get('/stats/summary', asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = req.query;

  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  const [
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    ordersByStatus,
    ordersByPriority
  ] = await Promise.all([
    prisma.productionOrder.count({ where }),
    prisma.productionOrder.count({ where: { ...where, status: 'PENDING' } }),
    prisma.productionOrder.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.productionOrder.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.productionOrder.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.productionOrder.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true }
    })
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    ordersByStatus,
    ordersByPriority
  });
}));

export default router;

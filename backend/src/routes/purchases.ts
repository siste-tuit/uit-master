import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const purchaseOrderSchema = Joi.object({
  supplierId: Joi.string().required(),
  expectedDate: Joi.date().optional(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      materialId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const updatePurchaseStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED').required(),
  receivedDate: Joi.date().optional()
});

// GET /api/purchases - Listar órdenes de compra
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, status, supplierId, startDate, endDate } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  if (startDate || endDate) {
    where.orderDate = {};
    if (startDate) where.orderDate.gte = new Date(startDate as string);
    if (endDate) where.orderDate.lte = new Date(endDate as string);
  }

  const [purchases, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            material: {
              include: {
                category: true
              }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { orderDate: 'desc' }
    }),
    prisma.purchaseOrder.count({ where })
  ]);

  res.json({
    purchases,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/purchases/:id - Obtener orden de compra por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const purchase = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  if (!purchase) {
    throw createError('Orden de compra no encontrada', 404);
  }

  res.json(purchase);
}));

// POST /api/purchases - Crear orden de compra
router.post('/', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = purchaseOrderSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { supplierId, expectedDate, notes, items } = value;
  const userId = req.user!.id;

  // Verificar que el proveedor existe
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId }
  });

  if (!supplier) {
    throw createError('Proveedor no encontrado', 404);
  }

  // Generar número de orden
  const orderCount = await prisma.purchaseOrder.count();
  const orderNumber = `OC-${String(orderCount + 1).padStart(6, '0')}`;

  // Calcular total
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Crear orden de compra con items
  const purchase = await prisma.purchaseOrder.create({
    data: {
      orderNumber,
      supplierId,
      userId,
      expectedDate,
      notes,
      totalAmount,
      items: {
        create: items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }))
      }
    },
    include: {
      supplier: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  res.status(201).json({
    message: 'Orden de compra creada exitosamente',
    purchase
  });
}));

// PUT /api/purchases/:id/status - Actualizar estado de orden de compra
router.put('/:id/status', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = updatePurchaseStatusSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { status, receivedDate } = value;

  // Verificar que la orden existe
  const existingPurchase = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!existingPurchase) {
    throw createError('Orden de compra no encontrada', 404);
  }

  // Si se marca como recibida, actualizar inventario
  if (status === 'RECEIVED' && existingPurchase.status !== 'RECEIVED') {
    // Actualizar stock de materiales
    for (const item of existingPurchase.items) {
      await prisma.material.update({
        where: { id: item.materialId },
        data: {
          currentStock: {
            increment: item.quantity
          }
        }
      });

      // Crear movimiento de inventario
      await prisma.inventoryMovement.create({
        data: {
          materialId: item.materialId,
          type: 'IN',
          quantity: item.quantity,
          unitCost: item.unitPrice,
          totalCost: item.totalPrice,
          reference: existingPurchase.orderNumber,
          notes: `Recepción de orden de compra ${existingPurchase.orderNumber}`
        }
      });
    }
  }

  const purchase = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status,
      receivedDate: status === 'RECEIVED' ? (receivedDate || new Date()) : null
    },
    include: {
      supplier: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          material: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  res.json({
    message: 'Estado de orden de compra actualizado exitosamente',
    purchase
  });
}));

// PUT /api/purchases/:id - Actualizar orden de compra
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = purchaseOrderSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que la orden existe y no está recibida
  const existingPurchase = await prisma.purchaseOrder.findUnique({
    where: { id }
  });

  if (!existingPurchase) {
    throw createError('Orden de compra no encontrada', 404);
  }

  if (existingPurchase.status === 'RECEIVED') {
    throw createError('No se puede modificar una orden ya recibida', 400);
  }

  const { supplierId, expectedDate, notes, items } = value;

  // Calcular nuevo total
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Actualizar orden (eliminar items existentes y crear nuevos)
  const purchase = await prisma.$transaction(async (tx) => {
    // Eliminar items existentes
    await tx.purchaseItem.deleteMany({
      where: { purchaseOrderId: id }
    });

    // Actualizar orden
    const updatedPurchase = await tx.purchaseOrder.update({
      where: { id },
      data: {
        supplierId,
        expectedDate,
        notes,
        totalAmount,
        items: {
          create: items.map(item => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            material: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    return updatedPurchase;
  });

  res.json({
    message: 'Orden de compra actualizada exitosamente',
    purchase
  });
}));

// DELETE /api/purchases/:id - Eliminar orden de compra
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const purchase = await prisma.purchaseOrder.findUnique({
    where: { id }
  });

  if (!purchase) {
    throw createError('Orden de compra no encontrada', 404);
  }

  if (purchase.status === 'RECEIVED') {
    throw createError('No se puede eliminar una orden ya recibida', 400);
  }

  await prisma.purchaseOrder.delete({
    where: { id }
  });

  res.json({ message: 'Orden de compra eliminada exitosamente' });
}));

// GET /api/purchases/stats/summary - Estadísticas de compras
router.get('/stats/summary', asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = req.query;

  const where: any = {};
  if (startDate || endDate) {
    where.orderDate = {};
    if (startDate) where.orderDate.gte = new Date(startDate as string);
    if (endDate) where.orderDate.lte = new Date(endDate as string);
  }

  const [
    totalOrders,
    totalAmount,
    pendingOrders,
    receivedOrders,
    ordersByStatus
  ] = await Promise.all([
    prisma.purchaseOrder.count({ where }),
    prisma.purchaseOrder.aggregate({
      where,
      _sum: { totalAmount: true }
    }),
    prisma.purchaseOrder.count({ where: { ...where, status: 'PENDING' } }),
    prisma.purchaseOrder.count({ where: { ...where, status: 'RECEIVED' } }),
    prisma.purchaseOrder.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { totalAmount: true }
    })
  ]);

  res.json({
    totalOrders,
    totalAmount: totalAmount._sum.totalAmount || 0,
    pendingOrders,
    receivedOrders,
    ordersByStatus
  });
}));

export default router;

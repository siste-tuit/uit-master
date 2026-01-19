import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const salesOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  deliveryDate: Joi.date().optional(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const updateSalesStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED').required()
});

// GET /api/sales - Listar órdenes de venta
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, status, customerId, startDate, endDate } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (startDate || endDate) {
    where.orderDate = {};
    if (startDate) where.orderDate.gte = new Date(startDate as string);
    if (endDate) where.orderDate.lte = new Date(endDate as string);
  }

  const [sales, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { orderDate: 'desc' }
    }),
    prisma.salesOrder.count({ where })
  ]);

  res.json({
    sales,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/sales/:id - Obtener orden de venta por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const sale = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!sale) {
    throw createError('Orden de venta no encontrada', 404);
  }

  res.json(sale);
}));

// POST /api/sales - Crear orden de venta
router.post('/', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = salesOrderSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { customerId, deliveryDate, notes, items } = value;
  const userId = req.user!.id;

  // Verificar que el cliente existe
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Verificar stock disponible para todos los productos
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product) {
      throw createError(`Producto ${item.productId} no encontrado`, 404);
    }

    if (product.currentStock < item.quantity) {
      throw createError(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.currentStock}`, 400);
    }
  }

  // Generar número de orden
  const orderCount = await prisma.salesOrder.count();
  const orderNumber = `OV-${String(orderCount + 1).padStart(6, '0')}`;

  // Calcular total
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Crear orden de venta con items
  const sale = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId,
      userId,
      deliveryDate,
      notes,
      totalAmount,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }))
      }
    },
    include: {
      customer: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  res.status(201).json({
    message: 'Orden de venta creada exitosamente',
    sale
  });
}));

// PUT /api/sales/:id/status - Actualizar estado de orden de venta
router.put('/:id/status', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = updateSalesStatusSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { status } = value;

  // Verificar que la orden existe
  const existingSale = await prisma.salesOrder.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!existingSale) {
    throw createError('Orden de venta no encontrada', 404);
  }

  // Si se marca como entregada, reducir stock
  if (status === 'DELIVERED' && existingSale.status !== 'DELIVERED') {
    // Verificar stock disponible
    for (const item of existingSale.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || product.currentStock < item.quantity) {
        throw createError(`Stock insuficiente para el producto ${product?.name || 'desconocido'}`, 400);
      }
    }

    // Reducir stock de productos
    for (const item of existingSale.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: {
            decrement: item.quantity
          }
        }
      });
    }
  }

  const sale = await prisma.salesOrder.update({
    where: { id },
    data: { status },
    include: {
      customer: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  res.json({
    message: 'Estado de orden de venta actualizado exitosamente',
    sale
  });
}));

// PUT /api/sales/:id - Actualizar orden de venta
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = salesOrderSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que la orden existe y no está entregada
  const existingSale = await prisma.salesOrder.findUnique({
    where: { id }
  });

  if (!existingSale) {
    throw createError('Orden de venta no encontrada', 404);
  }

  if (existingSale.status === 'DELIVERED') {
    throw createError('No se puede modificar una orden ya entregada', 400);
  }

  const { customerId, deliveryDate, notes, items } = value;

  // Verificar stock disponible para todos los productos
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product) {
      throw createError(`Producto ${item.productId} no encontrado`, 404);
    }

    if (product.currentStock < item.quantity) {
      throw createError(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.currentStock}`, 400);
    }
  }

  // Calcular nuevo total
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Actualizar orden (eliminar items existentes y crear nuevos)
  const sale = await prisma.$transaction(async (tx) => {
    // Eliminar items existentes
    await tx.salesItem.deleteMany({
      where: { salesOrderId: id }
    });

    // Actualizar orden
    const updatedSale = await tx.salesOrder.update({
      where: { id },
      data: {
        customerId,
        deliveryDate,
        notes,
        totalAmount,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return updatedSale;
  });

  res.json({
    message: 'Orden de venta actualizada exitosamente',
    sale
  });
}));

// DELETE /api/sales/:id - Eliminar orden de venta
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const sale = await prisma.salesOrder.findUnique({
    where: { id }
  });

  if (!sale) {
    throw createError('Orden de venta no encontrada', 404);
  }

  if (sale.status === 'DELIVERED') {
    throw createError('No se puede eliminar una orden ya entregada', 400);
  }

  await prisma.salesOrder.delete({
    where: { id }
  });

  res.json({ message: 'Orden de venta eliminada exitosamente' });
}));

// GET /api/sales/stats/summary - Estadísticas de ventas
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
    deliveredOrders,
    ordersByStatus
  ] = await Promise.all([
    prisma.salesOrder.count({ where }),
    prisma.salesOrder.aggregate({
      where,
      _sum: { totalAmount: true }
    }),
    prisma.salesOrder.count({ where: { ...where, status: 'PENDING' } }),
    prisma.salesOrder.count({ where: { ...where, status: 'DELIVERED' } }),
    prisma.salesOrder.groupBy({
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
    deliveredOrders,
    ordersByStatus
  });
}));

export default router;

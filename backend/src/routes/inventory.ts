import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const inventoryMovementSchema = Joi.object({
  materialId: Joi.string().required(),
  type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER').required(),
  quantity: Joi.number().min(1).required(),
  unitCost: Joi.number().min(0).required(),
  reference: Joi.string().allow(''),
  notes: Joi.string().allow('')
});

// GET /api/inventory/movements - Listar movimientos de inventario
router.get('/movements', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, materialId, type, startDate, endDate } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};

  if (materialId) {
    where.materialId = materialId;
  }

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  const [movements, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,
      include: {
        material: {
          include: {
            category: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.inventoryMovement.count({ where })
  ]);

  res.json({
    movements,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// POST /api/inventory/movements - Crear movimiento de inventario
router.post('/movements', requireRole(['ADMIN', 'MANAGER', 'PURCHASES', 'PRODUCTION']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = inventoryMovementSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { materialId, type, quantity, unitCost, reference, notes } = value;

  // Verificar que el material existe
  const material = await prisma.material.findUnique({
    where: { id: materialId }
  });

  if (!material) {
    throw createError('Material no encontrado', 404);
  }

  // Verificar stock disponible para movimientos de salida
  if ((type === 'OUT' || type === 'TRANSFER') && material.currentStock < quantity) {
    throw createError(`Stock insuficiente. Disponible: ${material.currentStock}`, 400);
  }

  const totalCost = quantity * unitCost;

  // Crear movimiento y actualizar stock
  const result = await prisma.$transaction(async (tx) => {
    // Crear movimiento
    const movement = await tx.inventoryMovement.create({
      data: {
        materialId,
        type,
        quantity,
        unitCost,
        totalCost,
        reference,
        notes
      },
      include: {
        material: {
          include: {
            category: true
          }
        }
      }
    });

    // Actualizar stock del material
    const stockChange = type === 'IN' ? quantity : -quantity;
    await tx.material.update({
      where: { id: materialId },
      data: {
        currentStock: {
          increment: stockChange
        }
      }
    });

    return movement;
  });

  res.status(201).json({
    message: 'Movimiento de inventario creado exitosamente',
    movement: result
  });
}));

// GET /api/inventory/stock-summary - Resumen de stock
router.get('/stock-summary', asyncHandler(async (req: AuthRequest, res) => {
  const { categoryId } = req.query;

  const where: any = {
    isActive: true
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [
    totalMaterials,
    lowStockMaterials,
    overStockMaterials,
    totalValue,
    materialsByCategory
  ] = await Promise.all([
    prisma.material.count({ where }),
    prisma.material.count({
      where: {
        ...where,
        currentStock: {
          lte: prisma.material.fields.minStock
        }
      }
    }),
    prisma.material.count({
      where: {
        ...where,
        currentStock: {
          gte: prisma.material.fields.maxStock
        }
      }
    }),
    prisma.material.aggregate({
      where,
      _sum: {
        currentStock: true
      }
    }),
    prisma.material.groupBy({
      by: ['categoryId'],
      where,
      _count: { categoryId: true },
      _sum: { currentStock: true }
    })
  ]);

  // Calcular valor total del inventario
  const materials = await prisma.material.findMany({
    where,
    select: {
      currentStock: true,
      costPrice: true
    }
  });

  const inventoryValue = materials.reduce((sum, material) => {
    return sum + (Number(material.currentStock) * Number(material.costPrice));
  }, 0);

  res.json({
    totalMaterials,
    lowStockMaterials,
    overStockMaterials,
    totalValue: inventoryValue,
    materialsByCategory
  });
}));

// GET /api/inventory/reports/consumption - Reporte de consumo
router.get('/reports/consumption', asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate, materialId } = req.query;

  const where: any = {
    type: 'OUT'
  };

  if (materialId) {
    where.materialId = materialId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  const consumption = await prisma.inventoryMovement.groupBy({
    by: ['materialId'],
    where,
    _sum: {
      quantity: true,
      totalCost: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    }
  });

  // Obtener información de materiales
  const materialIds = consumption.map(item => item.materialId);
  const materials = await prisma.material.findMany({
    where: {
      id: { in: materialIds }
    },
    include: {
      category: true
    }
  });

  const consumptionWithMaterials = consumption.map(item => {
    const material = materials.find(m => m.id === item.materialId);
    return {
      material,
      totalQuantity: item._sum.quantity || 0,
      totalCost: item._sum.totalCost || 0
    };
  });

  res.json(consumptionWithMaterials);
}));

// GET /api/inventory/reports/valuation - Reporte de valoración
router.get('/reports/valuation', asyncHandler(async (req: AuthRequest, res) => {
  const { categoryId } = req.query;

  const where: any = {
    isActive: true
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const materials = await prisma.material.findMany({
    where,
    include: {
      category: true
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  });

  const valuation = materials.map(material => ({
    ...material,
    currentValue: Number(material.currentStock) * Number(material.costPrice),
    minValue: Number(material.minStock) * Number(material.costPrice),
    maxValue: Number(material.maxStock) * Number(material.costPrice)
  }));

  const totalValue = valuation.reduce((sum, item) => sum + item.currentValue, 0);

  res.json({
    materials: valuation,
    totalValue,
    summary: {
      totalItems: materials.length,
      totalStock: materials.reduce((sum, m) => sum + Number(m.currentStock), 0),
      totalValue
    }
  });
}));

export default router;

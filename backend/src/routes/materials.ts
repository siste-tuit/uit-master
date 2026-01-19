import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const materialSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow(''),
  sku: Joi.string().required(),
  categoryId: Joi.string().required(),
  supplierId: Joi.string().allow(null),
  unit: Joi.string().required(),
  costPrice: Joi.number().min(0).default(0),
  minStock: Joi.number().min(0).default(0),
  maxStock: Joi.number().min(0).default(0),
  currentStock: Joi.number().min(0).default(0)
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow('')
});

// GET /api/materials - Listar materiales
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, search, categoryId, supplierId } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {
    isActive: true
  };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { sku: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      include: {
        category: true,
        supplier: true
      },
      skip,
      take: Number(limit),
      orderBy: { name: 'asc' }
    }),
    prisma.material.count({ where })
  ]);

  res.json({
    materials,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/materials/:id - Obtener material por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      inventoryMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!material) {
    throw createError('Material no encontrado', 404);
  }

  res.json(material);
}));

// POST /api/materials - Crear material
router.post('/', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = materialSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que el SKU no exista
  const existingMaterial = await prisma.material.findUnique({
    where: { sku: value.sku }
  });

  if (existingMaterial) {
    throw createError('El SKU ya existe', 400);
  }

  const material = await prisma.material.create({
    data: value,
    include: {
      category: true,
      supplier: true
    }
  });

  res.status(201).json({
    message: 'Material creado exitosamente',
    material
  });
}));

// PUT /api/materials/:id - Actualizar material
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = materialSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que el material existe
  const existingMaterial = await prisma.material.findUnique({
    where: { id }
  });

  if (!existingMaterial) {
    throw createError('Material no encontrado', 404);
  }

  // Verificar que el SKU no esté en uso por otro material
  if (value.sku !== existingMaterial.sku) {
    const skuExists = await prisma.material.findUnique({
      where: { sku: value.sku }
    });

    if (skuExists) {
      throw createError('El SKU ya existe', 400);
    }
  }

  const material = await prisma.material.update({
    where: { id },
    data: value,
    include: {
      category: true,
      supplier: true
    }
  });

  res.json({
    message: 'Material actualizado exitosamente',
    material
  });
}));

// DELETE /api/materials/:id - Eliminar material (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const material = await prisma.material.findUnique({
    where: { id }
  });

  if (!material) {
    throw createError('Material no encontrado', 404);
  }

  await prisma.material.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Material eliminado exitosamente' });
}));

// GET /api/materials/categories - Listar categorías
router.get('/categories/list', asyncHandler(async (req: AuthRequest, res) => {
  const categories = await prisma.materialCategory.findMany({
    orderBy: { name: 'asc' }
  });

  res.json(categories);
}));

// POST /api/materials/categories - Crear categoría
router.post('/categories', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = categorySchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que el nombre no exista
  const existingCategory = await prisma.materialCategory.findUnique({
    where: { name: value.name }
  });

  if (existingCategory) {
    throw createError('La categoría ya existe', 400);
  }

  const category = await prisma.materialCategory.create({
    data: value
  });

  res.status(201).json({
    message: 'Categoría creada exitosamente',
    category
  });
}));

// GET /api/materials/low-stock - Materiales con stock bajo
router.get('/alerts/low-stock', asyncHandler(async (req: AuthRequest, res) => {
  const materials = await prisma.material.findMany({
    where: {
      isActive: true,
      currentStock: {
        lte: prisma.material.fields.minStock
      }
    },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { currentStock: 'asc' }
  });

  res.json(materials);
}));

// GET /api/materials/over-stock - Materiales con stock excesivo
router.get('/alerts/over-stock', asyncHandler(async (req: AuthRequest, res) => {
  const materials = await prisma.material.findMany({
    where: {
      isActive: true,
      currentStock: {
        gte: prisma.material.fields.maxStock
      }
    },
    include: {
      category: true,
      supplier: true
    },
    orderBy: { currentStock: 'desc' }
  });

  res.json(materials);
}));

export default router;

import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const productSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow(''),
  sku: Joi.string().required(),
  unit: Joi.string().required(),
  salePrice: Joi.number().min(0).default(0),
  minStock: Joi.number().min(0).default(0),
  maxStock: Joi.number().min(0).default(0),
  currentStock: Joi.number().min(0).default(0)
});

// GET /api/products - Listar productos
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { name: 'asc' }
    }),
    prisma.product.count({ where })
  ]);

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      salesItems: {
        include: {
          salesOrder: {
            include: {
              customer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  res.json(product);
}));

// POST /api/products - Crear producto
router.post('/', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que el SKU no exista
  const existingProduct = await prisma.product.findUnique({
    where: { sku: value.sku }
  });

  if (existingProduct) {
    throw createError('El SKU ya existe', 400);
  }

  const product = await prisma.product.create({
    data: value
  });

  res.status(201).json({
    message: 'Producto creado exitosamente',
    product
  });
}));

// PUT /api/products/:id - Actualizar producto
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = productSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Verificar que el producto existe
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw createError('Producto no encontrado', 404);
  }

  // Verificar que el SKU no esté en uso por otro producto
  if (value.sku !== existingProduct.sku) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: value.sku }
    });

    if (skuExists) {
      throw createError('El SKU ya existe', 400);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: value
  });

  res.json({
    message: 'Producto actualizado exitosamente',
    product
  });
}));

// DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Producto eliminado exitosamente' });
}));

// GET /api/products/alerts/low-stock - Productos con stock bajo
router.get('/alerts/low-stock', asyncHandler(async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      currentStock: {
        lte: prisma.product.fields.minStock
      }
    },
    orderBy: { currentStock: 'asc' }
  });

  res.json(products);
}));

// GET /api/products/alerts/over-stock - Productos con stock excesivo
router.get('/alerts/over-stock', asyncHandler(async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      currentStock: {
        gte: prisma.product.fields.maxStock
      }
    },
    orderBy: { currentStock: 'desc' }
  });

  res.json(products);
}));

export default router;

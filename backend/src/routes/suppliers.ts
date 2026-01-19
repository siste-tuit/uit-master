import express, { Response } from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const supplierSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow(''),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  contactName: Joi.string().allow('')
});

// GET /api/suppliers - Listar proveedores
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {
    isActive: true
  };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { contactName: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { name: 'asc' }
    }),
    prisma.supplier.count({ where })
  ]);

  res.json({
    suppliers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/suppliers/:id - Obtener proveedor por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      materials: {
        where: { isActive: true },
        include: {
          category: true
        }
      },
      purchases: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { orderDate: 'desc' },
        take: 10
      }
    }
  });

  if (!supplier) {
    throw createError('Proveedor no encontrado', 404);
  }

  res.json(supplier);
}));

// POST /api/suppliers - Crear proveedor
router.post('/', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { error, value } = supplierSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const supplier = await prisma.supplier.create({
    data: value
  });

  res.status(201).json({
    message: 'Proveedor creado exitosamente',
    supplier
  });
}));

// PUT /api/suppliers/:id - Actualizar proveedor
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'PURCHASES']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { error, value } = supplierSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });

  if (!supplier) {
    throw createError('Proveedor no encontrado', 404);
  }

  const updatedSupplier = await prisma.supplier.update({
    where: { id },
    data: value
  });

  res.json({
    message: 'Proveedor actualizado exitosamente',
    supplier: updatedSupplier
  });
}));

// DELETE /api/suppliers/:id - Eliminar proveedor (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });

  if (!supplier) {
    throw createError('Proveedor no encontrado', 404);
  }

  await prisma.supplier.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Proveedor eliminado exitosamente' });
}));

export default router;

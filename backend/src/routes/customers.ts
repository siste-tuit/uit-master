import express, { Response } from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const customerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow(''),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  contactName: Joi.string().allow('')
});

// GET /api/customers - Listar clientes
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
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

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { name: 'asc' }
    }),
    prisma.customer.count({ where })
  ]);

  res.json({
    customers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/customers/:id - Obtener cliente por ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: {
          user: {
            select: { id: true, name: true }
          },
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { orderDate: 'desc' },
        take: 10
      }
    }
  });

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  res.json(customer);
}));

// POST /api/customers - Crear cliente
router.post('/', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = customerSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const customer = await prisma.customer.create({
    data: value
  });

  res.status(201).json({
    message: 'Cliente creado exitosamente',
    customer
  });
}));

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'SALES']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = customerSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const customer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: value
  });

  res.json({
    message: 'Cliente actualizado exitosamente',
    customer: updatedCustomer
  });
}));

// DELETE /api/customers/:id - Eliminar cliente (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  await prisma.customer.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Cliente eliminado exitosamente' });
}));

export default router;

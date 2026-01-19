import express, { Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'PRODUCTION', 'SALES', 'PURCHASES', 'USER').required(),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(2),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'PRODUCTION', 'SALES', 'PURCHASES', 'USER'),
  isActive: Joi.boolean()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// GET /api/users - Listar usuarios
router.get('/', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, role } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      skip,
      take: Number(limit),
      orderBy: { name: 'asc' }
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json(user);
}));

// POST /api/users - Crear usuario
router.post('/', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { email, name, role, isActive } = value;

  // Verificar que el email no exista
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('El email ya está en uso', 400);
  }

  // Generar contraseña temporal
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      isActive,
      password: hashedPassword
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  res.status(201).json({
    message: 'Usuario creado exitosamente',
    user,
    tempPassword // En producción, esto debería enviarse por email
  });
}));

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { error, value } = updateUserSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  // Verificar que el email no esté en uso por otro usuario
  if (value.email && value.email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: value.email }
    });

    if (emailExists) {
      throw createError('El email ya está en uso', 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: value,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  res.json({
    message: 'Usuario actualizado exitosamente',
    user: updatedUser
  });
}));

// PUT /api/users/:id/change-password - Cambiar contraseña
router.put('/:id/change-password', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { error, value } = changePasswordSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { newPassword } = value;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Contraseña actualizada exitosamente' });
}));

// PUT /api/users/:id/toggle-status - Activar/desactivar usuario
router.put('/:id/toggle-status', requireRole(['ADMIN', 'MANAGER']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  res.json({
    message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`,
    user: updatedUser
  });
}));

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', requireRole(['ADMIN']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // No permitir eliminar el propio usuario
  if (id === req.user!.id) {
    throw createError('No puedes eliminar tu propio usuario', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  await prisma.user.delete({
    where: { id }
  });

  res.json({ message: 'Usuario eliminado exitosamente' });
}));

// GET /api/users/profile/me - Obtener perfil del usuario actual
router.get('/profile/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json(user);
}));

// PUT /api/users/profile/me - Actualizar perfil del usuario actual
router.put('/profile/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { error, value } = updateUserSchema.validate(req.body);
  
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Solo permitir actualizar nombre y email
  const allowedFields = ['name', 'email'];
  const updateData: any = {};
  
  for (const field of allowedFields) {
    if (value[field] !== undefined) {
      updateData[field] = value[field];
    }
  }

  // Verificar que el email no esté en uso por otro usuario
  if (updateData.email) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (updateData.email !== user?.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw createError('El email ya está en uso', 400);
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  res.json({
    message: 'Perfil actualizado exitosamente',
    user: updatedUser
  });
}));

export default router;

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'PRODUCTION', 'SALES', 'PURCHASES', 'USER').default('USER')
});

// POST /api/auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { email, password } = value;

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    throw createError('Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  // Generar JWT
  const payload = { 
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const options = { expiresIn: 604800 }; // 7 días en segundos
  const token = jwt.sign(payload, secret, options);

  res.json({
    message: 'Login exitoso',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}));

// POST /api/auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { email, password, name, role } = value;

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('El usuario ya existe', 400);
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  res.status(201).json({
    message: 'Usuario creado exitosamente',
    user
  });
}));

// POST /api/auth/verify
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw createError('Token requerido', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw createError('Usuario no válido', 401);
    }

    res.json({
      valid: true,
      user
    });
  } catch (error) {
    throw createError('Token inválido', 401);
  }
}));

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // En un sistema JWT stateless, el logout se maneja en el frontend
  // eliminando el token del almacenamiento local
  res.json({ message: 'Logout exitoso' });
});

export default router;

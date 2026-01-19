import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import supplierRoutes from './routes/suppliers';
import customerRoutes from './routes/customers';
import materialRoutes from './routes/materials';
import productRoutes from './routes/products';
import purchaseRoutes from './routes/purchases';
import salesRoutes from './routes/sales';
import productionRoutes from './routes/production';
import inventoryRoutes from './routes/inventory';
import dashboardRoutes from './routes/dashboard';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Inicializar Prisma
export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});

// Middleware global
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/materials', authMiddleware, materialRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/purchases', authMiddleware, purchaseRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/production', authMiddleware, productionRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Función para inicializar datos por defecto
async function initializeDefaultData() {
  try {
    // Verificar si ya existen usuarios
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('Inicializando datos por defecto...');
      
      // Crear usuarios por defecto
      const bcrypt = require('bcryptjs');
      
      const defaultUsers = [
        {
          email: 'admin@textil.com',
          password: await bcrypt.hash('demo123', 10),
          name: 'Administrador',
          role: 'ADMIN' as const
        },
        {
          email: 'contabilidad@textil.com',
          password: await bcrypt.hash('demo123', 10),
          name: 'Contabilidad',
          role: 'CONTABILIDAD' as const
        },
        {
          email: 'gerencia@textil.com',
          password: await bcrypt.hash('demo123', 10),
          name: 'Gerencia',
          role: 'GERENCIA' as const
        },
        {
          email: 'usuario@textil.com',
          password: await bcrypt.hash('demo123', 10),
          name: 'Usuario',
          role: 'USUARIO' as const
        }
      ];

      for (const user of defaultUsers) {
        await prisma.user.create({ data: user });
      }

      // Crear categorías de materiales por defecto
      const defaultCategories = [
        { name: 'Hilos', description: 'Hilos de diferentes materiales y colores' },
        { name: 'Telas', description: 'Telas base para confección' },
        { name: 'Tintes', description: 'Tintes y colorantes' },
        { name: 'Químicos', description: 'Productos químicos para tratamiento' },
        { name: 'Accesorios', description: 'Botones, cierres, etiquetas' }
      ];

      for (const category of defaultCategories) {
        await prisma.materialCategory.create({ data: category });
      }

      console.log('Datos por defecto creados exitosamente');
    }
  } catch (error) {
    console.error('Error inicializando datos por defecto:', error);
  }
}

// Iniciar servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');

    // Inicializar datos por defecto
    await initializeDefaultData();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/overview - Resumen general del dashboard
router.get('/overview', asyncHandler(async (req: AuthRequest, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Estadísticas generales
  const [
    totalMaterials,
    totalProducts,
    totalSuppliers,
    totalCustomers,
    totalUsers,
    lowStockMaterials,
    lowStockProducts,
    pendingPurchases,
    pendingSales,
    pendingProduction,
    inProgressProduction
  ] = await Promise.all([
    prisma.material.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.material.count({
      where: {
        isActive: true,
        currentStock: { lte: prisma.material.fields.minStock }
      }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        currentStock: { lte: prisma.product.fields.minStock }
      }
    }),
    prisma.purchaseOrder.count({ where: { status: 'PENDING' } }),
    prisma.salesOrder.count({ where: { status: 'PENDING' } }),
    prisma.productionOrder.count({ where: { status: 'PENDING' } }),
    prisma.productionOrder.count({ where: { status: 'IN_PROGRESS' } })
  ]);

  // Ventas del mes
  const monthlySales = await prisma.salesOrder.aggregate({
    where: {
      orderDate: { gte: startOfMonth },
      status: 'DELIVERED'
    },
    _sum: { totalAmount: true },
    _count: { id: true }
  });

  // Compras del mes
  const monthlyPurchases = await prisma.purchaseOrder.aggregate({
    where: {
      orderDate: { gte: startOfMonth },
      status: 'RECEIVED'
    },
    _sum: { totalAmount: true },
    _count: { id: true }
  });

  // Producción completada del mes
  const monthlyProduction = await prisma.productionOrder.count({
    where: {
      completedDate: { gte: startOfMonth },
      status: 'COMPLETED'
    }
  });

  // Valor del inventario
  const materials = await prisma.material.findMany({
    where: { isActive: true },
    select: { currentStock: true, costPrice: true }
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { currentStock: true, salePrice: true }
  });

  const inventoryValue = [
    ...materials.map(m => Number(m.currentStock) * Number(m.costPrice)),
    ...products.map(p => Number(p.currentStock) * Number(p.salePrice))
  ].reduce((sum, value) => sum + value, 0);

  res.json({
    overview: {
      totalMaterials,
      totalProducts,
      totalSuppliers,
      totalCustomers,
      totalUsers,
      lowStockMaterials,
      lowStockProducts,
      pendingPurchases,
      pendingSales,
      pendingProduction,
      inProgressProduction
    },
    monthly: {
      sales: {
        amount: monthlySales._sum.totalAmount || 0,
        orders: monthlySales._count.id || 0
      },
      purchases: {
        amount: monthlyPurchases._sum.totalAmount || 0,
        orders: monthlyPurchases._count.id || 0
      },
      production: {
        completed: monthlyProduction
      }
    },
    inventory: {
      totalValue: inventoryValue
    }
  });
}));

// GET /api/dashboard/charts/sales-trend - Tendencia de ventas
router.get('/charts/sales-trend', asyncHandler(async (req: AuthRequest, res) => {
  const { period = '30' } = req.query;
  const days = Number(period);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const sales = await prisma.salesOrder.findMany({
    where: {
      orderDate: { gte: startDate, lte: endDate },
      status: 'DELIVERED'
    },
    select: {
      orderDate: true,
      totalAmount: true
    },
    orderBy: { orderDate: 'asc' }
  });

  // Agrupar por día
  const salesByDay: { [key: string]: number } = {};
  sales.forEach(sale => {
    const date = sale.orderDate.toISOString().split('T')[0];
    salesByDay[date] = (salesByDay[date] || 0) + Number(sale.totalAmount);
  });

  // Generar array de días
  const trend: { date: string; amount: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      amount: salesByDay[dateStr] || 0
    });
  }

  res.json(trend);
}));

// GET /api/dashboard/charts/production-status - Estado de producción
router.get('/charts/production-status', asyncHandler(async (req: AuthRequest, res) => {
  const productionByStatus = await prisma.productionOrder.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const statusLabels = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada'
  };

  const chartData = productionByStatus.map(item => ({
    status: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    count: item._count.status
  }));

  res.json(chartData);
}));

// GET /api/dashboard/charts/inventory-categories - Inventario por categorías
router.get('/charts/inventory-categories', asyncHandler(async (req: AuthRequest, res) => {
  const materialsByCategory = await prisma.material.groupBy({
    by: ['categoryId'],
    where: { isActive: true },
    _sum: { currentStock: true }
  });

  const categories = await prisma.materialCategory.findMany({
    select: { id: true, name: true }
  });

  const chartData = materialsByCategory.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    return {
      category: category?.name || 'Sin categoría',
      stock: item._sum.currentStock || 0
    };
  });

  res.json(chartData);
}));

// GET /api/dashboard/alerts - Alertas del sistema
router.get('/alerts', asyncHandler(async (req: AuthRequest, res) => {
  const [
    lowStockMaterials,
    lowStockProducts,
    overduePurchases,
    overdueSales,
    urgentProduction
  ] = await Promise.all([
    prisma.material.findMany({
      where: {
        isActive: true,
        currentStock: { lte: prisma.material.fields.minStock }
      },
      include: { category: true },
      take: 10,
      orderBy: { currentStock: 'asc' }
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: { lte: prisma.product.fields.minStock }
      },
      take: 10,
      orderBy: { currentStock: 'asc' }
    }),
    prisma.purchaseOrder.findMany({
      where: {
        status: 'APPROVED',
        expectedDate: { lt: new Date() }
      },
      include: { supplier: true },
      take: 10,
      orderBy: { expectedDate: 'asc' }
    }),
    prisma.salesOrder.findMany({
      where: {
        status: { in: ['CONFIRMED', 'IN_PRODUCTION'] },
        deliveryDate: { lt: new Date() }
      },
      include: { customer: true },
      take: 10,
      orderBy: { deliveryDate: 'asc' }
    }),
    prisma.productionOrder.findMany({
      where: {
        status: 'IN_PROGRESS',
        priority: 'URGENT'
      },
      include: { salesOrder: { include: { customer: true } } },
      take: 10,
      orderBy: { createdAt: 'asc' }
    })
  ]);

  res.json({
    lowStockMaterials,
    lowStockProducts,
    overduePurchases,
    overdueSales,
    urgentProduction
  });
}));

// GET /api/dashboard/recent-activities - Actividades recientes
router.get('/recent-activities', asyncHandler(async (req: AuthRequest, res) => {
  const { limit = 20 } = req.query;

  const [
    recentPurchases,
    recentSales,
    recentProduction,
    recentMovements
  ] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    }),
    prisma.salesOrder.findMany({
      include: {
        customer: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    }),
    prisma.productionOrder.findMany({
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    }),
    prisma.inventoryMovement.findMany({
      include: {
        material: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    })
  ]);

  // Combinar y ordenar actividades
  const activities = [
    ...recentPurchases.map(p => ({
      type: 'purchase',
      id: p.id,
      title: `Orden de compra ${p.orderNumber}`,
      description: `Proveedor: ${p.supplier.name}`,
      amount: p.totalAmount,
      status: p.status,
      user: p.user.name,
      date: p.createdAt
    })),
    ...recentSales.map(s => ({
      type: 'sales',
      id: s.id,
      title: `Orden de venta ${s.orderNumber}`,
      description: `Cliente: ${s.customer.name}`,
      amount: s.totalAmount,
      status: s.status,
      user: s.user.name,
      date: s.createdAt
    })),
    ...recentProduction.map(p => ({
      type: 'production',
      id: p.id,
      title: `Orden de producción ${p.orderNumber}`,
      description: `Prioridad: ${p.priority}`,
      amount: null,
      status: p.status,
      user: p.user.name,
      date: p.createdAt
    })),
    ...recentMovements.map(m => ({
      type: 'inventory',
      id: m.id,
      title: `Movimiento de inventario`,
      description: `${m.material.name} - ${m.type} ${m.quantity}`,
      amount: m.totalCost,
      status: m.type,
      user: null,
      date: m.createdAt
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, Number(limit));

  res.json(activities);
}));

export default router;

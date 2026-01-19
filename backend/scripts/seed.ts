import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios por defecto
  const users = [
    {
      email: 'admin@textil.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Administrador',
      role: 'ADMIN'
    },
    {
      email: 'prod@textil.com',
      password: await bcrypt.hash('prod123', 10),
      name: 'Jefe de Producción',
      role: 'PRODUCTION'
    },
    {
      email: 'ventas@textil.com',
      password: await bcrypt.hash('ventas123', 10),
      name: 'Jefe de Ventas',
      role: 'SALES'
    },
    {
      email: 'compras@textil.com',
      password: await bcrypt.hash('compras123', 10),
      name: 'Jefe de Compras',
      role: 'PURCHASES'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }

  // Crear categorías de materiales
  const categories = [
    { name: 'Hilos', description: 'Hilos de diferentes materiales y colores' },
    { name: 'Telas', description: 'Telas base para confección' },
    { name: 'Tintes', description: 'Tintes y colorantes' },
    { name: 'Químicos', description: 'Productos químicos para tratamiento' },
    { name: 'Accesorios', description: 'Botones, cierres, etiquetas' }
  ];

  for (const category of categories) {
    await prisma.materialCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Crear proveedores de ejemplo
  const suppliers = [
    {
      name: 'Proveedor de Hilos S.A.S',
      email: 'ventas@hilos.com',
      phone: '+57 1 234 5678',
      address: 'Calle 123 #45-67, Bogotá',
      contactName: 'María González'
    },
    {
      name: 'Textiles del Norte',
      email: 'contacto@textilesnorte.com',
      phone: '+57 1 345 6789',
      address: 'Carrera 78 #90-12, Medellín',
      contactName: 'Carlos Rodríguez'
    },
    {
      name: 'Químicos Industriales Ltda',
      email: 'info@quimicosind.com',
      phone: '+57 1 456 7890',
      address: 'Avenida 56 #78-90, Cali',
      contactName: 'Ana Martínez'
    }
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: {},
      create: supplier
    });
  }

  // Crear clientes de ejemplo
  const customers = [
    {
      name: 'Confecciones Modernas S.A.S',
      email: 'compras@confeccionesmodernas.com',
      phone: '+57 1 567 8901',
      address: 'Calle 90 #12-34, Bogotá',
      contactName: 'Roberto Silva'
    },
    {
      name: 'Textiles del Sur',
      email: 'ventas@textilessur.com',
      phone: '+57 1 678 9012',
      address: 'Carrera 12 #34-56, Barranquilla',
      contactName: 'Laura Pérez'
    },
    {
      name: 'Moda Express',
      email: 'pedidos@modaexpress.com',
      phone: '+57 1 789 0123',
      address: 'Avenida 34 #56-78, Bucaramanga',
      contactName: 'Diego Herrera'
    }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { name: customer.name },
      update: {},
      create: customer
    });
  }

  // Obtener categorías y proveedores para crear materiales
  const hilosCategory = await prisma.materialCategory.findUnique({ where: { name: 'Hilos' } });
  const telasCategory = await prisma.materialCategory.findUnique({ where: { name: 'Telas' } });
  const tintesCategory = await prisma.materialCategory.findUnique({ where: { name: 'Tintes' } });
  
  const proveedorHilos = await prisma.supplier.findUnique({ where: { name: 'Proveedor de Hilos S.A.S' } });
  const proveedorTelas = await prisma.supplier.findUnique({ where: { name: 'Textiles del Norte' } });
  const proveedorQuimicos = await prisma.supplier.findUnique({ where: { name: 'Químicos Industriales Ltda' } });

  // Crear materiales de ejemplo
  const materials = [
    {
      name: 'Hilo de Algodón 40/1',
      description: 'Hilo de algodón mercerizado para confección',
      sku: 'HIL-ALG-40-001',
      categoryId: hilosCategory?.id || '',
      supplierId: proveedorHilos?.id,
      unit: 'kg',
      costPrice: 15000,
      minStock: 50,
      maxStock: 500,
      currentStock: 200
    },
    {
      name: 'Hilo de Poliéster 30/1',
      description: 'Hilo de poliéster para costura industrial',
      sku: 'HIL-POL-30-001',
      categoryId: hilosCategory?.id || '',
      supplierId: proveedorHilos?.id,
      unit: 'kg',
      costPrice: 12000,
      minStock: 30,
      maxStock: 300,
      currentStock: 150
    },
    {
      name: 'Tela de Algodón 100%',
      description: 'Tela de algodón cruda para confección',
      sku: 'TEL-ALG-100-001',
      categoryId: telasCategory?.id || '',
      supplierId: proveedorTelas?.id,
      unit: 'metros',
      costPrice: 25000,
      minStock: 100,
      maxStock: 1000,
      currentStock: 500
    },
    {
      name: 'Tinte Azul Marino',
      description: 'Tinte reactivo azul marino para algodón',
      sku: 'TIN-AZU-MAR-001',
      categoryId: tintesCategory?.id || '',
      supplierId: proveedorQuimicos?.id,
      unit: 'litros',
      costPrice: 45000,
      minStock: 10,
      maxStock: 100,
      currentStock: 50
    }
  ];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { sku: material.sku },
      update: {},
      create: material
    });
  }

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Camiseta Básica Hombre',
      description: 'Camiseta de algodón 100% para hombre',
      sku: 'PRO-CAM-HOM-001',
      unit: 'unidades',
      salePrice: 25000,
      minStock: 20,
      maxStock: 200,
      currentStock: 100
    },
    {
      name: 'Pantalón Jean Mujer',
      description: 'Pantalón jean de mezclilla para mujer',
      sku: 'PRO-PAN-MUJ-001',
      unit: 'unidades',
      salePrice: 85000,
      minStock: 15,
      maxStock: 150,
      currentStock: 75
    },
    {
      name: 'Vestido Casual',
      description: 'Vestido casual de algodón para mujer',
      sku: 'PRO-VES-MUJ-001',
      unit: 'unidades',
      salePrice: 65000,
      minStock: 10,
      maxStock: 100,
      currentStock: 50
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    });
  }

  console.log('✅ Seed completado exitosamente!');
  console.log('👥 Usuarios creados:', users.length);
  console.log('📦 Categorías creadas:', categories.length);
  console.log('🏭 Proveedores creados:', suppliers.length);
  console.log('👤 Clientes creados:', customers.length);
  console.log('🧵 Materiales creados:', materials.length);
  console.log('👕 Productos creados:', products.length);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

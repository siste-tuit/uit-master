import { ProductionLine, ProductionRecord, InventoryItem, FinancialRecord, DashboardMetric } from '../types';

// Líneas de producción textil
export const productionLines: ProductionLine[] = [
  {
    id: '1',
    name: 'Línea de Hilado',
    type: 'hilado',
    capacity: 1000,
    currentProduction: 850,
    efficiency: 85,
    status: 'activa',
    assignedUsers: ['6', '7'],
  },
  {
    id: '2',
    name: 'Línea de Tejido',
    type: 'tejido',
    capacity: 800,
    currentProduction: 720,
    efficiency: 90,
    status: 'activa',
    assignedUsers: ['6'],
  },
  {
    id: '3',
    name: 'Línea de Tinturado',
    type: 'tinturado',
    capacity: 600,
    currentProduction: 540,
    efficiency: 90,
    status: 'activa',
    assignedUsers: ['7'],
  },
  {
    id: '4',
    name: 'Línea de Acabado',
    type: 'acabado',
    capacity: 500,
    currentProduction: 450,
    efficiency: 90,
    status: 'mantenimiento',
    assignedUsers: [],
  },
];

// Registros de producción
export const productionRecords: ProductionRecord[] = [
  {
    id: '1',
    userId: '6',
    lineId: '1',
    product: 'Hilo de Algodón 40/1',
    quantity: 150,
    quality: 'excelente',
    notes: 'Producción sin incidencias',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'aprobada',
    feedback: 'Excelente trabajo, mantener la calidad',
    approvedBy: '3',
  },
  {
    id: '2',
    userId: '7',
    lineId: '2',
    product: 'Tela de Algodón 100%',
    quantity: 200,
    quality: 'buena',
    notes: 'Pequeña variación en el grosor',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'pendiente',
  },
  {
    id: '3',
    userId: '6',
    lineId: '3',
    product: 'Tela Teñida Azul',
    quantity: 100,
    quality: 'excelente',
    notes: 'Color uniforme y consistente',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'aprobada',
    feedback: 'Color perfecto, continuar con este proceso',
    approvedBy: '3',
  },
];

// Inventario de materiales textiles
export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Hilo de Algodón 40/1',
    category: 'materia_prima',
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    unit: 'kg',
    cost: 15000,
    supplier: 'Proveedor Hilos S.A.S',
    status: 'disponible',
    lastUpdated: new Date(),
    updatedBy: '2',
  },
  {
    id: '2',
    name: 'Tela de Algodón 100%',
    category: 'materia_prima',
    currentStock: 1200,
    minStock: 800,
    maxStock: 3000,
    unit: 'metros',
    cost: 25000,
    supplier: 'Textiles del Norte',
    status: 'disponible',
    lastUpdated: new Date(),
    updatedBy: '2',
  },
  {
    id: '3',
    name: 'Tinte Azul Marino',
    category: 'insumos',
    currentStock: 50,
    minStock: 100,
    maxStock: 500,
    unit: 'litros',
    cost: 45000,
    supplier: 'Químicos Industriales',
    status: 'bajo_stock',
    lastUpdated: new Date(),
    updatedBy: '3',
  },
  {
    id: '4',
    name: 'Botones de Plástico',
    category: 'insumos',
    currentStock: 0,
    minStock: 1000,
    maxStock: 10000,
    unit: 'unidades',
    cost: 50,
    supplier: 'Accesorios Moda',
    status: 'agotado',
    lastUpdated: new Date(),
    updatedBy: '2',
  },
  {
    id: '5',
    name: 'Camiseta Básica',
    category: 'producto_terminado',
    currentStock: 500,
    minStock: 200,
    maxStock: 2000,
    unit: 'unidades',
    cost: 25000,
    supplier: 'Producción Interna',
    status: 'disponible',
    lastUpdated: new Date(),
    updatedBy: '6',
  },
];

// Registros financieros
export const financialRecords: FinancialRecord[] = [
  {
    id: '1',
    type: 'ingreso',
    category: 'Ventas',
    amount: 15000000,
    description: 'Venta de camisetas - Pedido #1234',
    date: new Date(),
    userId: '5',
    status: 'aprobado',
    approvedBy: '4',
  },
  {
    id: '2',
    type: 'egreso',
    category: 'Compras',
    amount: 5000000,
    description: 'Compra de hilo de algodón',
    date: new Date(),
    userId: '5',
    status: 'aprobado',
    approvedBy: '4',
  },
  {
    id: '3',
    type: 'gasto',
    category: 'Mantenimiento',
    amount: 800000,
    description: 'Mantenimiento línea de acabado',
    date: new Date(),
    userId: '5',
    status: 'pendiente',
  },
];

// Métricas del dashboard por rol
export const getDashboardMetrics = (role: string): DashboardMetric[] => {
  const baseMetrics = [
    {
      id: '1',
      title: 'Producción Diaria',
      value: 1250,
      unit: 'unidades',
      trend: 'up' as const,
      percentage: 12.5,
      color: '#1A5632',
    },
    {
      id: '2',
      title: 'Eficiencia General',
      value: 87.5,
      unit: '%',
      trend: 'up' as const,
      percentage: 3.2,
      color: '#3B82F6',
    },
    {
      id: '3',
      title: 'Calidad',
      value: 94.2,
      unit: '%',
      trend: 'stable' as const,
      percentage: 0.1,
      color: '#10B981',
    },
  ];

  switch (role) {
    case 'administrador':
      return [
        ...baseMetrics,
        {
          id: '4',
          title: 'Usuarios Activos',
          value: 68,
          unit: 'usuarios',
          trend: 'stable' as const,
          percentage: 0,
          color: '#8B5CF6',
        },
        {
          id: '5',
          title: 'Ingresos Mensuales',
          value: 45000000,
          unit: 'PEN',
          trend: 'up' as const,
          percentage: 8.5,
          color: '#F59E0B',
        },
      ];
    
    case 'sistemas':
      return [
        ...baseMetrics,
        {
          id: '4',
          title: 'Sesiones Activas',
          value: 45,
          unit: 'usuarios',
          trend: 'up' as const,
          percentage: 5.2,
          color: '#8B5CF6',
        },
        {
          id: '5',
          title: 'Uptime Sistema',
          value: 99.8,
          unit: '%',
          trend: 'stable' as const,
          percentage: 0.1,
          color: '#10B981',
        },
      ];
    
    case 'ingenieria':
      return [
        ...baseMetrics,
        {
          id: '4',
          title: 'Órdenes Pendientes',
          value: 8,
          unit: 'órdenes',
          trend: 'down' as const,
          percentage: -15.2,
          color: '#EF4444',
        },
        {
          id: '5',
          title: 'Tiempo Promedio',
          value: 4.2,
          unit: 'horas',
          trend: 'down' as const,
          percentage: -8.1,
          color: '#F59E0B',
        },
      ];
    
    case 'gerencia':
      return [
        {
          id: '1',
          title: 'Producción Total',
          value: 37500,
          unit: 'unidades',
          trend: 'up' as const,
          percentage: 12.5,
          color: '#1A5632',
        },
        {
          id: '2',
          title: 'Ingresos Totales',
          value: 45000000,
          unit: 'PEN',
          trend: 'up' as const,
          percentage: 8.5,
          color: '#10B981',
        },
        {
          id: '3',
          title: 'Eficiencia General',
          value: 87.5,
          unit: '%',
          trend: 'up' as const,
          percentage: 3.2,
          color: '#3B82F6',
        },
        {
          id: '4',
          title: 'Costos Operativos',
          value: 28000000,
          unit: 'PEN',
          trend: 'down' as const,
          percentage: -2.1,
          color: '#EF4444',
        },
      ];
    
    case 'contabilidad':
      return [
        {
          id: '1',
          title: 'Ingresos del Mes',
          value: 45000000,
          unit: 'PEN',
          trend: 'up' as const,
          percentage: 8.5,
          color: '#10B981',
        },
        {
          id: '2',
          title: 'Egresos del Mes',
          value: 28000000,
          unit: 'PEN',
          trend: 'down' as const,
          percentage: -2.1,
          color: '#EF4444',
        },
        {
          id: '3',
          title: 'Utilidad Neta',
          value: 17000000,
          unit: 'PEN',
          trend: 'up' as const,
          percentage: 15.3,
          color: '#1A5632',
        },
        {
          id: '4',
          title: 'Facturas Pendientes',
          value: 12,
          unit: 'facturas',
          trend: 'down' as const,
          percentage: -20.0,
          color: '#F59E0B',
        },
      ];
    
    case 'mantenimiento':
      return [
        {
          id: '1',
          title: 'Equipos Operativos',
          value: 12,
          unit: 'equipos',
          trend: 'up' as const,
          percentage: 8.3,
          color: '#10B981',
        },
        {
          id: '2',
          title: 'Órdenes Pendientes',
          value: 8,
          unit: 'órdenes',
          trend: 'down' as const,
          percentage: -15.2,
          color: '#EF4444',
        },
        {
          id: '3',
          title: 'Tiempo Promedio Reparación',
          value: 3.2,
          unit: 'horas',
          trend: 'down' as const,
          percentage: -5.8,
          color: '#3B82F6',
        },
        {
          id: '4',
          title: 'Disponibilidad Equipos',
          value: 94.5,
          unit: '%',
          trend: 'up' as const,
          percentage: 2.1,
          color: '#8B5CF6',
        },
      ];
    
    case 'usuarios':
      return [
        {
          id: '1',
          title: 'Mi Producción',
          value: 150,
          unit: 'unidades',
          trend: 'up' as const,
          percentage: 5.2,
          color: '#1A5632',
        },
        {
          id: '2',
          title: 'Eficiencia Personal',
          value: 92.5,
          unit: '%',
          trend: 'up' as const,
          percentage: 2.1,
          color: '#10B981',
        },
        {
          id: '3',
          title: 'Órdenes Completadas',
          value: 8,
          unit: 'órdenes',
          trend: 'up' as const,
          percentage: 12.5,
          color: '#3B82F6',
        },
      ];
    
    default:
      return baseMetrics;
  }
};

// Datos para gráficos de producción
export const productionChartData = [
  { date: '2024-01-01', hilado: 850, tejido: 720, tinturado: 540, acabado: 450 },
  { date: '2024-01-02', hilado: 920, tejido: 780, tinturado: 580, acabado: 420 },
  { date: '2024-01-03', hilado: 880, tejido: 750, tinturado: 560, acabado: 480 },
  { date: '2024-01-04', hilado: 950, tejido: 820, tinturado: 600, acabado: 520 },
  { date: '2024-01-05', hilado: 900, tejido: 790, tinturado: 570, acabado: 490 },
  { date: '2024-01-06', hilado: 870, tejido: 760, tinturado: 550, acabado: 460 },
  { date: '2024-01-07', hilado: 910, tejido: 800, tinturado: 590, acabado: 510 },
];

// Datos para gráficos de inventario
export const inventoryChartData = [
  { name: 'Hilos', value: 35, color: '#1A5632' },
  { name: 'Telas', value: 25, color: '#3B82F6' },
  { name: 'Tintes', value: 20, color: '#10B981' },
  { name: 'Accesorios', value: 20, color: '#F59E0B' },
];

// Datos para gráficos financieros
export const financialChartData = [
  { month: 'Ene', ingresos: 25000000, egresos: 18000000, utilidad: 7000000 },
  { month: 'Feb', ingresos: 28000000, egresos: 19500000, utilidad: 8500000 },
  { month: 'Mar', ingresos: 32000000, egresos: 22000000, utilidad: 10000000 },
  { month: 'Abr', ingresos: 30000000, egresos: 21000000, utilidad: 9000000 },
  { month: 'May', ingresos: 35000000, egresos: 24000000, utilidad: 11000000 },
  { month: 'Jun', ingresos: 38000000, egresos: 26000000, utilidad: 12000000 },
];

// Módulos por rol
export const roleModules = {
  administrador: [
    { name: 'Dashboard', path: '/administracion/dashboard', icon: '📊' },
    { name: 'Usuarios', path: '/administracion/users', icon: '👥' },
    { name: 'Configuración', path: '/administracion/config', icon: '⚙️' },
    { name: 'Reportes', path: '/administracion/reports', icon: '📈' },
  ],
  sistemas: [
    { name: 'Dashboard', path: '/sistemas/dashboard', icon: '📊' },
    { name: 'Incidencias', path: '/sistemas/incidencias', icon: '🔧' },
    { name: 'Flujos Recibidos', path: '/sistemas/flujos-recibidos', icon: '📥' },
    { name: 'Asistencia', path: '/sistemas/asistencia', icon: '⏰' },
    { name: 'Usuarios', path: '/sistemas/usuarios', icon: '👥' },
    { name: 'Configuración', path: '/sistemas/configuracion', icon: '⚙️' },
    { name: 'Logs', path: '/sistemas/logs', icon: '📋' },
  ],
  ingenieria: [
    { name: 'Dashboard', path: '/ingenieria/dashboard', icon: '📊' },
    { name: 'Producción', path: '/ingenieria/produccion', icon: '🏭' },
    { name: 'Flujo de Ingreso', path: '/ingenieria/ficha-entrega', icon: '📄' },
    { name: 'Flujo de Salida', path: '/ingenieria/ficha-salida', icon: '🚚' },
    { name: 'Reportes', path: '/ingenieria/reportes', icon: '📈' },
    { name: 'Reportes de Usuarios', path: '/ingenieria/reportes-usuarios', icon: '👥' },
    { name: 'Inventario', path: '/ingenieria/inventario', icon: '📦' },
    { name: 'Historial', path: '/ingenieria/historial', icon: '📋' },
  ],
  mantenimiento: [
    { name: 'Dashboard', path: '/mantenimiento/dashboard', icon: '📊' },
    { name: 'Equipos', path: '/mantenimiento/equipos', icon: '🏭' },
    { name: 'Órdenes de Trabajo', path: '/mantenimiento/ordenes', icon: '📋' },
    { name: 'Repuestos', path: '/mantenimiento/repuestos', icon: '🔩' },
    { name: 'Calendario', path: '/mantenimiento/calendario', icon: '📅' },
  ],
  gerencia: [
    { name: 'Producción', path: '/gerencia/production', icon: '🏭' },
    { name: 'Ventas', path: '/gerencia/sales', icon: '💰' },
    { name: 'Inventario', path: '/gerencia/inventory', icon: '📦' },
  ],
  contabilidad: [
    { name: 'Dashboard', path: '/contabilidad/dashboard', icon: '📊' },
    { name: 'Finanzas', path: '/contabilidad/finances', icon: '💳' },
    { name: 'Facturación', path: '/contabilidad/billing', icon: '🧾' },
    { name: 'Reportes', path: '/contabilidad/reports', icon: '📈' },
  ],
  usuarios: [
    { name: 'Dashboard', path: '/produccion/dashboard', icon: '📊' },
    { name: 'Mi Producción', path: '/produccion/mi-produccion', icon: '🏭' },
    { name: 'Trabajadores', path: '/produccion/trabajadores', icon: '👥' },
    { name: 'Asistencia', path: '/produccion/asistencia', icon: '⏰' },
    { name: 'Perfil', path: '/produccion/profile', icon: '👤' },
  ],
};

// Datos de empleados
export const employeesData = [
  {
    id: '1',
    name: 'Juan Pérez',
    role: 'Operario',
    department: 'Producción',
    status: 'activo',
    efficiency: 92.5,
    lastActivity: new Date(),
  },
  {
    id: '2',
    name: 'María García',
    role: 'Supervisora',
    department: 'Calidad',
    status: 'activo',
    efficiency: 95.2,
    lastActivity: new Date(),
  },
  {
    id: '3',
    name: 'Carlos López',
    role: 'Técnico',
    department: 'Mantenimiento',
    status: 'activo',
    efficiency: 88.7,
    lastActivity: new Date(),
  },
  {
    id: '4',
    name: 'Ana Rodríguez',
    role: 'Analista',
    department: 'Contabilidad',
    status: 'activo',
    efficiency: 91.3,
    lastActivity: new Date(),
  },
];

// Métricas de producción
export const productionMetrics = {
  totalProduction: 1250,
  efficiency: 87.5,
  quality: 94.2,
  activeLines: 3,
};

// Datos de producción
export const productionData = [
  { name: 'Hilado', value: 850, color: '#2E7D32' },
  { name: 'Tejido', value: 720, color: '#4CAF50' },
  { name: 'Tinturado', value: 540, color: '#8BC34A' },
  { name: 'Acabado', value: 450, color: '#CDDC39' },
];

// Datos de inventario
export const inventoryData = [
  { id: '1', name: 'Hilos', category: 'Materia Prima', currentStock: 350, minStock: 100, maxStock: 500, unit: 'kg', status: 'ok' as const },
  { id: '2', name: 'Telas', category: 'Materia Prima', currentStock: 250, minStock: 100, maxStock: 400, unit: 'm', status: 'ok' as const },
  { id: '3', name: 'Tintes', category: 'Químicos', currentStock: 200, minStock: 50, maxStock: 300, unit: 'L', status: 'ok' as const },
  { id: '4', name: 'Accesorios', category: 'Suministros', currentStock: 80, minStock: 100, maxStock: 200, unit: 'unidades', status: 'low' as const },
  { id: '5', name: 'Botones', category: 'Suministros', currentStock: 1500, minStock: 500, maxStock: 2000, unit: 'unidades', status: 'ok' as const },
  { id: '6', name: 'Cierres', category: 'Suministros', currentStock: 120, minStock: 100, maxStock: 300, unit: 'unidades', status: 'ok' as const },
];
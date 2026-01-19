// Tipos principales del ERP UIT

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export type UserRole =
  | "administrador"
  | "sistemas"
  | "mantenimiento"
  | "ingenieria"
  | "gerencia"
  | "contabilidad"
  | "usuarios";

export interface ProductionLine {
  id: string;
  name: string;
  type: "hilado" | "tejido" | "tinturado" | "acabado";
  capacity: number;
  currentProduction: number;
  efficiency: number;
  status: "activa" | "mantenimiento" | "parada";
  assignedUsers: string[];
}

export interface ProductionRecord {
  id: string;
  userId: string;
  lineId: string;
  product: string;
  quantity: number;
  quality: "excelente" | "buena" | "regular" | "mala";
  notes?: string;
  timestamp: Date;
  status: "pendiente" | "aprobada" | "rechazada";
  feedback?: string;
  approvedBy?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "materia_prima" | "producto_terminado" | "insumos" | "herramientas";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  supplier: string;
  status: "disponible" | "bajo_stock" | "agotado";
  lastUpdated: Date;
  updatedBy: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: "entrada" | "salida" | "ajuste";
  quantity: number;
  reason: string;
  userId: string;
  timestamp: Date;
  notes?: string;
}

export interface FinancialRecord {
  id: string;
  type: "ingreso" | "egreso" | "gasto";
  category: string;
  amount: number;
  description: string;
  date: Date;
  userId: string;
  status: "pendiente" | "aprobado" | "rechazado";
  approvedBy?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  userId: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  percentage: number;
  color: string;
}

export interface RolePermissions {
  canViewProduction: boolean;
  canEditProduction: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// TYPES
export interface Departamento {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfiguracionEmpresa {
  id: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  moneda: string;
  logo_url?: string;
  zona_horaria: string;
  politica_contrasena: string;
  forzar_2fa: boolean;
  bloqueo_ips: boolean;
  createdAt?: string;
  updatedAt?: string;
}

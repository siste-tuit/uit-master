import { UserRole, RolePermissions } from '../types';

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  administrador: {
    canViewProduction: true,
    canEditProduction: true,
    canViewInventory: true,
    canEditInventory: true,
    canViewFinancial: true,
    canEditFinancial: true,
    canManageUsers: true,
    canViewReports: true,
    canManageSystem: true,
  },
  sistemas: {
    canViewProduction: true,
    canEditProduction: false,
    canViewInventory: true,
    canEditInventory: true, // Puede ingresar stock junto con Ingeniería
    canViewFinancial: false,
    canEditFinancial: false,
    canManageUsers: true,
    canViewReports: true,
    canManageSystem: true,
  },
  mantenimiento: {
    canViewProduction: true,
    canEditProduction: false,
    canViewInventory: true,
    canEditInventory: true,
    canViewFinancial: false,
    canEditFinancial: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
  },
  ingenieria: {
    canViewProduction: true,
    canEditProduction: true, // Supervisa y analiza producción
    canViewInventory: true,
    canEditInventory: true, // Puede ingresar stock
    canViewFinancial: false,
    canEditFinancial: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
  },
  gerencia: {
    canViewProduction: true,
    canEditProduction: false, // Solo visualizar
    canViewInventory: true,
    canEditInventory: false, // Solo visualizar
    canViewFinancial: true,
    canEditFinancial: false, // Solo visualizar
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
  },
  contabilidad: {
    canViewProduction: false,
    canEditProduction: false,
    canViewInventory: true, // Solo consultar stock
    canEditInventory: false,
    canViewFinancial: true,
    canEditFinancial: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
  },
  usuarios: {
    canViewProduction: true,
    canEditProduction: true, // Solo su propia producción
    canViewInventory: true, // Solo stock relacionado a su línea
    canEditInventory: false,
    canViewFinancial: false,
    canEditFinancial: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSystem: false,
  },
};

// Función para verificar permisos
export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[userRole][permission];
};

// Función para obtener el dashboard según el rol
export const getDashboardPath = (role: UserRole): string => {
  const rolePaths: Record<UserRole, string> = {
    administrador: '/administracion',
    sistemas: '/sistemas',
    mantenimiento: '/mantenimiento',
    ingenieria: '/ingenieria',
    gerencia: '/gerencia',
    contabilidad: '/contabilidad',
    usuarios: '/produccion',
  };
  return rolePaths[role];
};

// Función para obtener el nombre del rol en español
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    administrador: 'Administrador',
    sistemas: 'Sistemas',
    mantenimiento: 'Mantenimiento',
    ingenieria: 'Ingeniería',
    gerencia: 'Gerencia',
    contabilidad: 'Contabilidad',
    usuarios: 'Usuarios',
  };
  return roleNames[role];
};

// Función para obtener el icono del rol
export const getRoleIcon = (role: UserRole): string => {
  const roleIcons: Record<UserRole, string> = {
    administrador: '👔',
    sistemas: '⚙️',
    mantenimiento: '🔧',
    ingenieria: '🔧',
    gerencia: '📊',
    contabilidad: '💰',
    usuarios: '👷',
  };
  return roleIcons[role];
};

// Función para obtener el color del rol
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    administrador: 'bg-red-100 text-red-800',
    sistemas: 'bg-blue-100 text-blue-800',
    mantenimiento: 'bg-green-100 text-green-800',
    ingenieria: 'bg-purple-100 text-purple-800',
    gerencia: 'bg-yellow-100 text-yellow-800',
    contabilidad: 'bg-green-100 text-green-800',
    usuarios: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role];
};

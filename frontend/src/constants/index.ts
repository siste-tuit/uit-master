import { UserRole, ProductionLine } from '../types';

// Paleta de colores profesional - Verde predominante
export const colors = {
  primary: '#2E7D32',      // Verde oscuro como principal
  secondary: '#4CAF50',    // Verde profesional
  dark: '#1A1A1A',         // Negro elegante
  darkGray: '#2D2D2D',     // Gris oscuro
  lightGray: '#F8F9FA',    // Gris claro
  white: '#FFFFFF',
  accent: '#66BB6A',       // Verde claro
  success: '#1B5E20',      // Verde muy oscuro
  warning: '#FF6B35',      // Naranja como acento
  text: '#333333',
  textLight: '#666666',
  border: '#E0E0E0'
};

// Definición de Roles del Sistema
export const userRoles: any[] = [
  {
    id: 'manager',
    name: 'Gerente',
    level: 1,
    color: colors.dark,
    description: 'Acceso completo al sistema',
    modules: ['dashboard', 'materials', 'products', 'suppliers', 'customers', 'purchases', 'sales', 'production', 'inventory', 'users', 'reports'],
    icon: '👔'
  },
  {
    id: 'engineer',
    name: 'Ingeniero',
    level: 2,
    color: colors.primary,
    description: 'Supervisión técnica y producción',
    modules: ['dashboard', 'materials', 'products', 'production', 'inventory', 'reports'],
    icon: '🔧'
  },
  {
    id: 'mechanic',
    name: 'Mecánico',
    level: 3,
    color: colors.warning,
    description: 'Mantenimiento y reparaciones',
    modules: ['dashboard', 'production', 'materials', 'reports'],
    icon: '🔨'
  }
];

// Líneas de Producción
export const productionLines: any[] = Array.from({ length: 13 }, (_, i) => ({
  id: `line_${i + 1}`,
  name: `Línea ${i + 1}`,
  type: 'hilado',
  capacity: 1000 + (i * 100),
  currentProduction: Math.floor(Math.random() * 800) + 200,
  status: i < 8 ? 'activa' : i < 10 ? 'mantenimiento' : 'parada',
  efficiency: Math.floor(Math.random() * 30) + 70, // 70-100%
  assignedUsers: [`Operador L${i + 1}`]
}));

// Crear roles para cada línea de producción
export const lineRoles: any[] = productionLines.map(line => ({
  id: line.id,
  name: `Operador ${line.name}`,
  level: 4,
  color: colors.accent,
  description: `Operador de ${line.name} - Producción textil`,
  modules: ['dashboard', 'production', 'reports'],
  icon: '🏭'
}));

// Todos los roles del sistema
export const allRoles = [...userRoles, ...lineRoles];

// Utilidades generales para el ERP UIT

// Formateo de fechas
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formateo de números
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-PE').format(num);
};

export const formatCurrency = (amount: number): string => {
  // Formato por defecto en Soles peruanos; cambia a 'USD' si deseas dólares
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Validaciones
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Mínimo 8 caracteres, al menos una letra y un número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Generación de IDs únicos
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce para búsquedas
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Clasificación de stock
export const getStockStatus = (current: number, min: number, max: number): 'disponible' | 'bajo_stock' | 'agotado' => {
  if (current <= 0) return 'agotado';
  if (current <= min) return 'bajo_stock';
  return 'disponible';
};

// Cálculo de eficiencia
export const calculateEfficiency = (actual: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((actual / target) * 100, 100);
};

// Generación de colores para gráficos
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#1A5632', // Verde UIT
    '#F5F5DC', // Crema UIT
    '#000000', // Negro UIT
    '#3B82F6', // Azul
    '#EF4444', // Rojo
    '#F59E0B', // Amarillo
    '#8B5CF6', // Púrpura
    '#06B6D4', // Cian
  ];
  
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// Truncar texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Obtener iniciales de nombre
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substr(0, 2);
};

// Calcular días entre fechas
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

// Verificar si es fecha de hoy
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

// Obtener fecha relativa (hace X días)
export const getRelativeDate = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInDays = daysBetween(now, targetDate);
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
};

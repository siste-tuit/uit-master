// Utilidad para construir URLs del API
// Usa la configuración centralizada que soporta variables de entorno

import API_BASE_URL_CORE from '../config/api';

/**
 * Obtiene la URL base del API (con soporte para variables de entorno)
 * En desarrollo: http://localhost:5000/api
 * En producción: usa VITE_API_URL de las variables de entorno
 */
export const getApiUrl = (endpoint: string = ''): string => {
  const base = API_BASE_URL_CORE;
  if (!endpoint) return base;
  
  // Si el endpoint ya incluye /api, no duplicar
  if (endpoint.startsWith('/api')) {
    return base.replace('/api', '') + endpoint;
  }
  
  // Si el endpoint empieza con /, añadirlo al base
  if (endpoint.startsWith('/')) {
    return `${base}${endpoint}`;
  }
  
  // Si no, añadir / entre base y endpoint
  return `${base}/${endpoint}`;
};

export default getApiUrl;

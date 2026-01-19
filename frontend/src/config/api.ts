// Configuración centralizada para la URL del API
// En desarrollo usa localhost, en producción usa la variable de entorno

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;

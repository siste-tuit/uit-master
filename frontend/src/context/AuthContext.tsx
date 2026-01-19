import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types'; // Asegúrate de que User y UserRole son correctos
import { hasPermission } from '../utils/roles'; // Se mantiene, pero 'getDashboardPath' se obtiene del backend

// 📌 Constante para la URL base de tu API
// Usa configuración centralizada que soporta variables de entorno
import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/auth`;

// --- Tipos y Contexto (Sin cambios) ---

// Tipos para el contexto de autenticación
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// --- Provider del Contexto (Actualizado) ---

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función de ayuda para guardar los datos de sesión
  const saveSession = (userData: User, token: string) => {
    // Guardamos el usuario (sin el token) para la persistencia
    localStorage.setItem('erp_user', JSON.stringify(userData));
    // Guardamos el token por separado para usarlo en futuras peticiones
    localStorage.setItem('erp_token', token);
    setUser(userData);
  };

  // Función de ayuda para cargar la sesión
  const loadSession = () => {
    const savedUser = localStorage.getItem('erp_user');
    const savedToken = localStorage.getItem('erp_token');

    if (savedUser && savedToken) {
      try {
        // Parseamos el usuario. Se asume que el token es válido hasta que falle una petición.
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al cargar la sesión guardada:', error);
        // Limpiar en caso de error de parseo
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_token');
      }
    }
    setIsLoading(false);
  };

  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    loadSession();
  }, []);


  // Función de login: Ahora llama al backend
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 1. Extraer los datos y el token de la respuesta del backend
        const { token, user: userData, dashboardPath } = data;

        // 2. Adaptar la fecha lastLogin
        // La fecha viene como string del backend, la convertimos a Date si es necesario
        const userToSave: User = {
          ...userData,
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
          createdAt: new Date(userData.createdAt),
          // Asegúrate que el campo 'role' se mapee correctamente
          role: userData.role as UserRole,
        };

        // 3. Guardar la sesión y el token
        saveSession(userToSave, token);

        setIsLoading(false);

        // 4. Redirección inmediata usando la ruta del backend
        window.location.href = dashboardPath;

        return true;
      } else {
        // Manejar error de credenciales inválidas (status 401)
        console.error('Login fallido:', data.message || 'Error de autenticación');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error de red durante el login:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Función de logout: Llama al backend (opcional) y limpia el cliente
  const logout = async () => {
    // Llamada opcional al backend para informar del logout (si usas lista negra de JWT)
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        // Opcional: enviar el token para invalidarlo
        // headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` }
      });
    } catch (error) {
      console.warn('No se pudo contactar al servidor para el logout:', error);
      // Continuar con la limpieza del cliente incluso si falla la llamada al servidor
    }

    setUser(null);
    // Limpiamos tanto el token como los datos del usuario
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');

    window.location.href = '/login'; // Redirigir
  };

  // Función para verificar permisos (sin cambios, usa los datos de usuario cargados)
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    // Asegúrate de que 'hasPermission' sepa manejar 'user.role' del tipo correcto
    return hasPermission(user.role, permission as any);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasPermission: checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
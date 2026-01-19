import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles específicos permitidos, verificar que el usuario tenga uno de esos roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirigir al dashboard del rol del usuario
      const roleDashboard = getRoleDashboard(user.role);
      return <Navigate to={roleDashboard} replace />;
    }
  }

  return <>{children}</>;
};

// Función para obtener el dashboard según el rol
const getRoleDashboard = (role: string): string => {
  switch (role) {
    case 'administrador':
      return '/administracion';
    case 'sistemas':
      return '/sistemas';
    case 'mantenimiento':
      return '/mantenimiento';
    case 'contabilidad':
      return '/contabilidad';
    case 'gerencia':
      return '/gerencia/production';
    case 'usuarios':
      return '/produccion';
    default:
      return '/login';
  }
};

export default ProtectedRoute;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfiguracion } from '../context/ConfigContext';
import { roleModules } from '../data/roleModules';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const { configuracion, isLoading } = useConfiguracion();
  const location = useLocation();

  // Obtener módulos según el rol del usuario
  // Normalizar el rol a minúsculas y manejar casos especiales
  const normalizedRole = user?.role?.toLowerCase().trim();
  
  // Mapeo de roles alternativos a roles válidos
  const roleMapping: Record<string, keyof typeof roleModules> = {
    'produccion': 'usuarios', // El rol 'produccion' mapea a 'usuarios'
    'usuario': 'usuarios', // El rol 'usuario' singular mapea a 'usuarios' plural
  };
  
  const mappedRole = roleMapping[normalizedRole || ''] || normalizedRole;
  const userModules = user && mappedRole ? (roleModules[mappedRole as keyof typeof roleModules] || []) : [];

  // Función auxiliar para verificar si una ruta está activa (incluye subrutas)
  const isRouteActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          !fixed flex flex-col top-0 left-0 h-screen bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-lg lg:z-auto
          w-72 border-r border-gray-200 flex-shrink-0 overflow-y-auto overscroll-contain
        `}
      >
        {/* Header del Sidebar */}
        <div className="p-4 !rounded-t-none gradient-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-14 h-14 overflow-hidden bg-white rounded-xl shrink-0 shadow-md">
                <img
                  src="/assets/images/logos/arriba.png?v=2"
                  alt="Logo UIT"
                  className="object-contain w-full h-full p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl text-gray-600">🏭</span>';
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-white truncate">
                  {isLoading ? 'Cargando...' : configuracion?.nombre || 'ERP Textil'}
                </h1>
                <p className="text-xs text-primary-100 truncate">{configuracion?.email}</p>
              </div>
            </div>

            {/* Botón de cerrar (solo móvil) */}
            <button
              onClick={onToggle}
              className="p-2 transition-colors rounded-lg lg:hidden hover:bg-white/20"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        {user && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 shadow-md bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
                <span className="text-xl text-white">{user.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.department}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1 min-h-0 overflow-y-auto">
          {userModules.map((module) => {
            const active = isRouteActive(module.path);

            return (
              <Link
                key={module.path}
                to={module.path}
                className={`
                  sidebar-item group
                  ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
              >
                <span className="mr-4 text-xl transition-transform duration-200 group-hover:scale-110">
                  {module.icon}
                </span>
                <span className="font-medium">{module.name}</span>

                {active && (
                  <div className="w-2 h-2 ml-auto rounded-full bg-primary-500"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3">
            <img
              src="/assets/images/logos/abajo.png"
              alt="Logo UIT"
              className="object-contain w-full h-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <p className="text-xs font-medium text-gray-500">
            {configuracion?.nombre || 'ERP Textil'}
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Sistema de Gestión
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

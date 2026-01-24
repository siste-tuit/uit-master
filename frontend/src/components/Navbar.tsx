import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);


  // Asegurar que el botón sea visible en todos los casos
  useEffect(() => {
    // No ajustar posición cuando el dropdown está abierto para evitar que desaparezca
    if (isProfileOpen) return;
    
    if (user && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isDesktop = viewportWidth >= 1024;
      
      // En desktop, verificar si está visible
      if (isDesktop) {
        // Verificar si está fuera del viewport o no es visible
        const isOutOfViewport = rect.right < 0 || rect.left > viewportWidth || rect.width === 0 || rect.height === 0;
        
        if (isOutOfViewport || rect.right > viewportWidth - 10) {
          // Si está fuera del viewport o muy cerca del borde, usar posición fixed
          profileRef.current.style.position = 'fixed';
          profileRef.current.style.right = '1.5rem';
          profileRef.current.style.top = '0.5rem';
          profileRef.current.style.zIndex = '99999';
        } else {
          // Usar posición relativa normal
          profileRef.current.style.position = 'relative';
          profileRef.current.style.right = 'auto';
          profileRef.current.style.top = 'auto';
          profileRef.current.style.zIndex = '10000';
        }
      } else {
        // En móvil, usar posición relativa
        profileRef.current.style.position = 'relative';
        profileRef.current.style.right = 'auto';
        profileRef.current.style.top = 'auto';
        profileRef.current.style.zIndex = '10000';
      }
      
      profileRef.current.style.display = 'block';
      profileRef.current.style.visibility = 'visible';
      profileRef.current.style.opacity = '1';
      profileRef.current.style.minWidth = '50px';
      profileRef.current.style.width = 'auto';
    }
  }, [user, isProfileOpen]);

  // Cerrar el dropdown cuando se hace clic fuera - Funciona en móvil y desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isProfileOpen || !profileRef.current) return;
      
      const target = event.target as Node;
      const button = profileRef.current.querySelector('button');
      const dropdown = document.querySelector('[data-dropdown="profile"]');
      
      // No cerrar si el clic fue en el botón (el botón maneja su propio cierre con delay)
      if (button && (button.contains(target) || button === target)) {
        return;
      }
      
      // No cerrar si el clic fue en el contenedor del perfil
      if (profileRef.current.contains(target)) {
        return;
      }
      
      // No cerrar si el clic fue en el dropdown
      if (dropdown && dropdown.contains(target)) {
        return;
      }
      
      // Cerrar solo si el clic fue realmente fuera
      setIsProfileOpen(false);
    };

    if (isProfileOpen) {
      // Delay para evitar que capture el mismo clic que abrió el dropdown
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isProfileOpen]);


  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-50 w-full" style={{ overflow: 'visible', position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '100%', gap: '0.5rem', boxSizing: 'border-box', alignContent: 'center' }}>
      {/* Lado izquierdo - Título y bienvenida */}
      <div className="flex items-center space-x-4 flex-shrink-0 min-w-0" style={{ flexShrink: 1, flexGrow: 1, maxWidth: 'calc(100% - 150px)', minWidth: '200px' }}>
        {/* Botón de menú para móviles */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors group"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Título de la página actual */}
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full hidden sm:block"></div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {getPageTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
              Bienvenido, {user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Perfil - PRIORIDAD MÁXIMA - SIEMPRE VISIBLE */}
      <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0 overflow-visible relative" style={{ minWidth: '120px', flexShrink: 0, flexGrow: 0, width: 'auto', position: 'relative', zIndex: 10000, display: 'flex', maxWidth: 'none' }}>

        {/* Perfil del usuario - SIEMPRE VISIBLE - FORZADO A SER VISIBLE */}
        {user ? (
          <div 
            className="relative overflow-visible" 
            ref={profileRef}
            style={{ 
              position: 'relative', 
              zIndex: 10001,
              display: 'flex',
              visibility: 'visible',
              opacity: 1,
              flexShrink: 0,
              flexGrow: 0,
              minWidth: '50px',
              width: 'auto',
              height: 'auto',
              marginLeft: 'auto',
              pointerEvents: 'auto',
              alignItems: 'center'
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle del estado del dropdown
                setIsProfileOpen(prev => !prev);
              }}
              onMouseDown={(e) => {
                // Prevenir propagación para evitar conflictos
                e.stopPropagation();
              }}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Menú de perfil"
              aria-expanded={isProfileOpen}
              type="button"
              style={{ 
                position: 'relative', 
                zIndex: 99998,
                display: 'flex',
                visibility: 'visible',
                opacity: 1,
                flexShrink: 0,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div 
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0"
                style={{
                  minWidth: '40px',
                  minHeight: '40px',
                  width: '40px',
                  height: '40px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {user.avatar ? (
                  <span className="text-white text-lg">{user.avatar}</span>
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {getUserInitials(user.name || 'Usuario')}
                  </span>
                )}
              </div>
              <div className="hidden xl:block text-left min-w-0 flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">{user.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user.role || ''}</p>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform flex-shrink-0 hidden xl:block ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown del perfil - Usar fixed en desktop para evitar problemas de overflow */}
            {isProfileOpen && (
              <>
                <div 
                  data-dropdown="profile"
                  className="absolute lg:fixed right-0 top-full lg:top-16 mt-2 lg:mt-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[99999]"
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    zIndex: 99999,
                    display: isProfileOpen ? 'block' : 'none',
                    position: 'absolute'
                  }}
                >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user.email || ''}</p>
                  <p className="text-xs text-gray-500">{user.department || ''}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.role || ''}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </button>
                
                <button 
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ayuda
                </button>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center focus:outline-none focus:bg-red-50"
                  type="button"
                >
                  <svg className="w-4 h-4 mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-xs">U</span>
          </div>
        )}
      </div>
    </header>
  );
};

// Función para obtener el título de la página actual
const getPageTitle = (): string => {
  const path = window.location.pathname;
  
  if (path.includes('/admin')) {
    if (path.includes('/production')) return 'Producción';
    if (path.includes('/inventory')) return 'Inventario';
    if (path.includes('/hr')) return 'Recursos Humanos';
    if (path.includes('/reports')) return 'Reportes';
    return 'Dashboard Administrativo';
  }
  
  if (path.includes('/contabilidad')) {
    if (path.includes('/billing')) return 'Facturación';
    if (path.includes('/finances')) return 'Finanzas';
    return 'Dashboard Contabilidad';
  }
  
  if (path.includes('/gerencia')) {
    if (path.includes('/production')) return 'Producción - Vista Gerencial';
    if (path.includes('/inventory')) return 'Inventario - Vista Gerencial';
    return 'Gerencia';
  }

  if (path.includes('/ingenieria')) {
    if (path.includes('/dashboard')) return 'Panel de Ingeniería';
    if (path.includes('/produccion')) return 'Producción - Ingeniería';
    if (path.includes('/ficha-entrega')) return 'Flujo de Ingreso';
    if (path.includes('/ficha-salida')) return 'Flujo de Salida';
    if (path.includes('/reportes-usuarios')) return 'Reportes de Usuarios';
    if (path.includes('/reportes')) return 'Reportes de Ingeniería';
    if (path.includes('/inventario')) return 'Inventario de Ingeniería';
    if (path.includes('/historial')) return 'Historial de Documentos';
    return 'Ingeniería';
  }
  
  if (path.includes('/usuario')) {
    if (path.includes('/production')) return 'Registrar Producción';
    if (path.includes('/stock')) return 'Ver Stock';
    return 'Dashboard Usuario';
  }
  
  return 'ERP Textil';
};

export default Navbar;

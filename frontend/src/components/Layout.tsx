import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isGerencia = user?.role === 'gerencia';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <NotificationProvider userId={user?.id}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden w-full">
        {/* Sidebar (fija en desktop, deslizable en mobile) */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Contenido principal */}
        <div
          className={`
            transition-all duration-300 min-h-screen w-full overflow-x-hidden overflow-y-auto
            ${sidebarOpen ? 'ml-0' : 'ml-0'}
            lg:ml-72  /* <- deja espacio fijo para el sidebar en desktop */
          `}
          style={{ overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}
        >
          {/* Navbar */}
          <div style={{ position: 'relative', zIndex: 100, width: '100%', overflow: 'visible' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
          </div>

          {/* Contenido */}
          <main
            className={`overflow-x-hidden w-full ${
              isGerencia ? 'p-3 sm:p-4 lg:p-3 xl:p-4 text-[15px]' : 'p-4 sm:p-5 lg:p-4 xl:p-6'
            }`}
          >
            <div
              className={`w-full ${
                isGerencia
                  ? 'max-w-[1200px] xl:max-w-[1320px] 2xl:max-w-[1400px] mx-0'
                  : 'max-w-full lg:max-w-[calc(100vw-300px)] xl:max-w-[calc(100vw-320px)] 2xl:max-w-[1400px]'
              }`}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Layout;

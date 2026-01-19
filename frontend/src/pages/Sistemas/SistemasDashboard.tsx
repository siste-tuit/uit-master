import React, { useState } from 'react';
import { MetricCard, InventoryCard, EmployeeCard } from '../../components/Cards';
import { ProductionChart, EfficiencyChart, InventoryDistribution } from '../../components/Charts';
import { getDashboardMetrics, productionData, inventoryData, employeesData } from '../../data/mockData';

const SistemasDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Obtener métricas para el rol de sistemas
  const productionMetrics = getDashboardMetrics('sistemas');
  
  // Datos para el gráfico de distribución de inventario
  const inventoryDistributionData = [
    { name: 'Hilos', value: 35, color: '#2E7D32' },
    { name: 'Telas', value: 25, color: '#4CAF50' },
    { name: 'Tintes', value: 20, color: '#66BB6A' },
    { name: 'Accesorios', value: 20, color: '#81C784' }
  ];

  // Datos de incidencias tecnológicas
  const incidenciasData = [
    {
      id: '1',
      titulo: 'Error en conexión a base de datos',
      descripcion: 'Los usuarios reportan lentitud al cargar datos',
      prioridad: 'alta',
      estado: 'en_progreso',
      fecha: new Date(),
      asignado: 'Ana Rodríguez',
      categoria: 'Base de Datos'
    },
    {
      id: '2',
      titulo: 'Problema con autenticación JWT',
      descripcion: 'Algunos usuarios no pueden iniciar sesión',
      prioridad: 'media',
      estado: 'pendiente',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 2),
      asignado: 'Carlos Mendoza',
      categoria: 'Autenticación'
    },
    {
      id: '3',
      titulo: 'Optimización de consultas SQL',
      descripcion: 'Mejorar rendimiento de reportes',
      prioridad: 'baja',
      estado: 'completada',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 24),
      asignado: 'Ana Rodríguez',
      categoria: 'Performance'
    }
  ];

  // Datos de usuarios del sistema
  const usuariosSistema = [
    {
      id: '1',
      nombre: 'Carlos Mendoza',
      email: 'admin@textil.com',
      rol: 'Administrador',
      ultimoAcceso: new Date(),
      estado: 'activo',
      departamento: 'Administración'
    },
    {
      id: '2',
      nombre: 'Ana Rodríguez',
      email: 'sistemas@textil.com',
      rol: 'Sistemas',
      ultimoAcceso: new Date(),
      estado: 'activo',
      departamento: 'Sistemas'
    },
    {
      id: '3',
      nombre: 'Luis Fernández',
      email: 'ingenieria@textil.com',
      rol: 'Ingeniería',
      ultimoAcceso: new Date(Date.now() - 1000 * 60 * 30),
      estado: 'activo',
      departamento: 'Ingeniería'
    },
    {
      id: '4',
      nombre: 'María González',
      email: 'gerencia@textil.com',
      rol: 'Gerencia',
      ultimoAcceso: new Date(Date.now() - 1000 * 60 * 60 * 2),
      estado: 'activo',
      departamento: 'Gerencia'
    }
  ];

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="gradient-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-3 text-4xl font-bold">Dashboard de Sistemas</h1>
            <p className="text-lg text-primary-100">
              Gestión tecnológica y administración del sistema ERP
            </p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-primary-100">Sistema Estable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-primary-100">45 Sesiones Activas</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl">
              <span className="text-6xl">⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="p-1 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Resumen General', icon: '📊' },
            { id: 'incidencias', label: 'Incidencias', icon: '🔧' },
            { id: 'usuarios', label: 'Gestión de Usuarios', icon: '👥' },
            { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'overview' && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {productionMetrics.map((metric) => (
              <MetricCard 
                key={metric.id} 
                metric={{
                  id: metric.id,
                  title: metric.title,
                  value: metric.value,
                  unit: metric.unit,
                  trend: metric.trend as "up" | "down" | "stable",
                  percentage: metric.percentage,
                  color: metric.color
                }} 
              />
            ))}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductionChart data={productionData as any} />
            <EfficiencyChart data={productionData as any} />
          </div>

          {/* Estado del sistema y usuarios */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Estado del sistema */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Estado del Sistema</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Ver detalles →
                </button>
              </div>
              <div className="space-y-4">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Servidor Principal</h3>
                    <span className="status-badge status-ok">Operativo</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">99.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU:</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memoria:</span>
                      <span className="font-medium">2.1GB / 8GB</span>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Base de Datos</h3>
                    <span className="status-badge status-ok">Conectada</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conexiones:</span>
                      <span className="font-medium">12/50</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tamaño:</span>
                      <span className="font-medium">156MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usuarios activos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Usuarios Activos</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Ver todos →
                </button>
              </div>
              <div className="space-y-4">
                {usuariosSistema.slice(0, 3).map((usuario) => (
                  <div key={usuario.id} className="card">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{usuario.nombre}</h3>
                        <p className="text-sm text-gray-500 truncate">{usuario.rol}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.estado === 'activo' 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {usuario.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'incidencias' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Gestión de Incidencias</h2>
            <button className="btn-primary">
              <span className="mr-2">➕</span>
              Nueva Incidencia
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {incidenciasData.map((incidencia) => (
              <div key={incidencia.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-gray-900">{incidencia.titulo}</h3>
                    <p className="mb-3 text-gray-600">{incidencia.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {incidencia.fecha.toLocaleDateString()}</span>
                      <span>👤 {incidencia.asignado}</span>
                      <span>🏷️ {incidencia.categoria}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`status-badge ${getPrioridadColor(incidencia.prioridad)}`}>
                      {incidencia.prioridad.toUpperCase()}
                    </span>
                    <span className={`status-badge ${getEstadoColor(incidencia.estado)}`}>
                      {incidencia.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-sm btn-outline">Ver detalles</button>
                  <button className="text-sm btn-outline">Editar</button>
                  <button className="text-sm btn-outline">Comentarios</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h2>
            <button className="btn-primary">
              <span className="mr-2">➕</span>
              Crear Usuario
            </button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Último Acceso
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosSistema.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary-100">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {usuario.departamento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {usuario.ultimoAcceso.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">Editar</button>
                          <button className="text-yellow-600 hover:text-yellow-900">Resetear</button>
                          <button className="text-red-600 hover:text-red-900">Desactivar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'configuracion' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Configuración del Sistema</h2>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Configuración de base de datos */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Base de Datos</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">URL de Conexión</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    defaultValue="postgresql://usuario:password@localhost:5432/erp_textil"
                  />
                </div>
                <div>
                  <label className="input-label">Pool de Conexiones</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    defaultValue="50"
                  />
                </div>
                <button className="w-full btn-primary">Guardar Configuración</button>
              </div>
            </div>

            {/* Configuración de autenticación */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Autenticación</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">JWT Secret</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    defaultValue="tu_jwt_secret_muy_seguro_aqui"
                  />
                </div>
                <div>
                  <label className="input-label">Tiempo de Expiración (días)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    defaultValue="7"
                  />
                </div>
                <button className="w-full btn-primary">Actualizar Configuración</button>
              </div>
            </div>

            {/* Configuración de sistema */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Sistema</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    defaultValue="UIT Textil S.A.S"
                  />
                </div>
                <div>
                  <label className="input-label">Zona Horaria</label>
                  <select className="input-field">
                    <option>America/Bogota</option>
                    <option>America/New_York</option>
                    <option>Europe/Madrid</option>
                  </select>
                </div>
                <button className="w-full btn-primary">Guardar Cambios</button>
              </div>
            </div>

            {/* Configuración de notificaciones */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Notificaciones</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email de alertas</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Notificaciones push</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Alertas de sistema</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <button className="w-full btn-primary">Actualizar Preferencias</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución de inventario */}
      <InventoryDistribution data={inventoryDistributionData} />

      {/* Acciones rápidas */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="p-3 transition-colors border rounded-lg bg-primary-50 hover:bg-primary-100 border-primary-200">
            <div className="mb-2 text-xl">👥</div>
            <div className="text-xs font-medium text-primary-700">Crear Usuario</div>
          </button>
          <button className="p-4 transition-colors border rounded-lg bg-secondary-50 hover:bg-secondary-100 border-secondary-200">
            <div className="mb-2 text-2xl">🔧</div>
            <div className="text-sm font-medium text-secondary-700">Nueva Incidencia</div>
          </button>
          <button className="p-4 transition-colors border rounded-lg bg-accent-50 hover:bg-accent-100 border-accent-200">
            <div className="mb-2 text-2xl">📊</div>
            <div className="text-sm font-medium text-accent-700">Ver Logs</div>
          </button>
          <button className="p-4 transition-colors border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100">
            <div className="mb-2 text-2xl">⚙️</div>
            <div className="text-sm font-medium text-gray-700">Configurar</div>
          </button>
        </div>
      </div>

      {/* Alertas del sistema */}
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="text-xl">⚠️</div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-yellow-800">Alertas del Sistema</h3>
            <ul className="space-y-1 text-xs text-yellow-700">
              <li>• 3 incidencias pendientes de resolución</li>
              <li>• Actualización de seguridad disponible</li>
              <li>• Backup programado para esta noche</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemasDashboard;

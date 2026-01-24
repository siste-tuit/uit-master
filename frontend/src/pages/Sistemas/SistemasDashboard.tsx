import React, { useMemo, useState, useEffect } from 'react';
import { MetricCard } from '../../components/Cards';
import { ProductionChart, EfficiencyChart, InventoryDistribution } from '../../components/Charts';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface IncidenciaApi {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  fecha_reporte: string;
  asignado_a_nombre?: string | null;
  departamento_nombre?: string | null;
}

interface UsuarioApi {
  id: string;
  email: string;
  name: string;
  department: string;
  is_active: boolean;
  last_login: string | null;
  role_name: string;
}

interface LogsResumen {
  total: number;
  errores: number;
  advertencias: number;
  informacion: number;
  debug: number;
}

interface ConfiguracionApi {
  nombre: string;
  ruc: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  moneda: string | null;
  zona_horaria: string | null;
}

const SistemasDashboard: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricasProduccion, setMetricasProduccion] = useState({
    produccionDiaria: 0,
    eficienciaGeneral: 0,
    calidad: 0,
    cambioProduccion: 0,
    cambioEficiencia: 0,
    cambioCalidad: 0
  });
  const [produccionPeriodo, setProduccionPeriodo] = useState<any[]>([]);
  const [resumenInventario, setResumenInventario] = useState<any>(null);
  const [incidencias, setIncidencias] = useState<IncidenciaApi[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [logsResumen, setLogsResumen] = useState<LogsResumen | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionApi | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('erp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchJson = async (url: string) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
      return res.json();
    };

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchJson(`${API_BASE_URL_CORE}/produccion/metricas`),
          fetchJson(`${API_BASE_URL_CORE}/produccion/periodo?periodo=mensual`),
          fetchJson(`${API_BASE_URL_CORE}/inventario/resumen-departamentos`),
          fetchJson(`${API_BASE_URL_CORE}/incidencias`),
          fetchJson(`${API_BASE_URL_CORE}/users`),
          fetchJson(`${API_BASE_URL_CORE}/logs/resumen`),
          fetchJson(`${API_BASE_URL_CORE}/configuracion`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setMetricasProduccion(results[0].value);
        if (results[1].status === 'fulfilled') setProduccionPeriodo(results[1].value?.datos || []);
        if (results[2].status === 'fulfilled') setResumenInventario(results[2].value);
        if (results[3].status === 'fulfilled') setIncidencias(results[3].value || []);
        if (results[4].status === 'fulfilled') setUsuarios(results[4].value || []);
        if (results[5].status === 'fulfilled') setLogsResumen(results[5].value);
        if (results[6].status === 'fulfilled') setConfiguracion(results[6].value);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar datos');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, []);

  const metricasDashboard = useMemo(() => {
    const cambioProd = Number(metricasProduccion.cambioProduccion || 0);
    const cambioEfic = Number(metricasProduccion.cambioEficiencia || 0);
    const cambioCal = Number(metricasProduccion.cambioCalidad || 0);
    const errores = logsResumen?.errores || 0;

    return [
      {
        id: 'produccion-diaria',
        title: 'Producción diaria',
        value: metricasProduccion.produccionDiaria || 0,
        unit: 'unidades',
        trend: cambioProd > 0 ? 'up' : cambioProd < 0 ? 'down' : 'stable',
        percentage: Math.abs(cambioProd),
        color: 'text-green-600'
      },
      {
        id: 'eficiencia',
        title: 'Eficiencia',
        value: metricasProduccion.eficienciaGeneral || 0,
        unit: '%',
        trend: cambioEfic > 0 ? 'up' : cambioEfic < 0 ? 'down' : 'stable',
        percentage: Math.abs(cambioEfic),
        color: 'text-blue-600'
      },
      {
        id: 'calidad',
        title: 'Calidad',
        value: metricasProduccion.calidad || 0,
        unit: '%',
        trend: cambioCal > 0 ? 'up' : cambioCal < 0 ? 'down' : 'stable',
        percentage: Math.abs(cambioCal),
        color: 'text-indigo-600'
      },
      {
        id: 'logs-errores',
        title: 'Errores',
        value: errores,
        unit: 'errores',
        trend: 'stable',
        percentage: 0,
        color: 'text-red-600'
      }
    ];
  }, [metricasProduccion, logsResumen]);

  const inventoryDistributionData = useMemo(() => {
    const ingenieria = resumenInventario?.ingenieria;
    const mantenimiento = resumenInventario?.mantenimiento;
    return [
      { name: 'Ingeniería', value: Number(ingenieria?.stockTotal || 0), color: '#2E7D32' },
      { name: 'Mantenimiento', value: Number(mantenimiento?.stockTotal || 0), color: '#4CAF50' }
    ];
  }, [resumenInventario]);

  const usuariosActivos = useMemo(() => {
    return [...usuarios]
      .sort((a, b) => {
        const aTime = a.last_login ? new Date(a.last_login).getTime() : 0;
        const bTime = b.last_login ? new Date(b.last_login).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  }, [usuarios]);

  const totalUsuariosActivos = useMemo(() => usuarios.filter(u => u.is_active).length, [usuarios]);
  const incidenciasPendientes = useMemo(
    () => incidencias.filter(i => i.estado === 'pendiente' || i.estado === 'en_proceso').length,
    [incidencias]
  );

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-200 text-red-900';
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'resuelto': return 'bg-green-100 text-green-800';
      case 'cerrado': return 'bg-gray-100 text-gray-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos de Sistemas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium">❌ Error al cargar datos</p>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

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
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <span className="text-sm text-primary-100">{incidenciasPendientes} incidencias pendientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-primary-100">{totalUsuariosActivos} usuarios activos</span>
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
            {metricasDashboard.map((metric) => (
              <MetricCard key={metric.id} metric={metric as any} />
            ))}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductionChart data={produccionPeriodo as any} />
            <EfficiencyChart data={produccionPeriodo as any} />
          </div>

          {/* Estado del sistema y usuarios */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Estado del sistema */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Estado del Sistema</h2>
              </div>
              <div className="space-y-4">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Logs del sistema</h3>
                    <span className="status-badge status-ok">Total {logsResumen?.total || 0}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Errores:</span>
                      <span className="font-medium">{logsResumen?.errores || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Advertencias:</span>
                      <span className="font-medium">{logsResumen?.advertencias || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Información:</span>
                      <span className="font-medium">{logsResumen?.informacion || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Incidencias</h3>
                    <span className="status-badge status-ok">Total {incidencias.length}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pendientes:</span>
                      <span className="font-medium">{incidenciasPendientes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Resueltas:</span>
                      <span className="font-medium">{incidencias.filter(i => i.estado === 'resuelto' || i.estado === 'cerrado').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usuarios activos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Usuarios Activos</h2>
              </div>
              <div className="space-y-4">
                {usuariosActivos.map((usuario) => (
                  <div key={usuario.id} className="card">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{usuario.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{usuario.role_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.is_active 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {usuario.is_active ? 'activo' : 'inactivo'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Último acceso: {usuario.last_login ? new Date(usuario.last_login).toLocaleString() : 'Sin registro'}
                    </p>
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
            {!isReadOnly && (
              <button className="btn-primary">
                <span className="mr-2">➕</span>
                Nueva Incidencia
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {incidencias.map((incidencia) => (
              <div key={incidencia.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-gray-900">{incidencia.titulo}</h3>
                    <p className="mb-3 text-gray-600">{incidencia.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {new Date(incidencia.fecha_reporte).toLocaleDateString()}</span>
                      <span>👤 {incidencia.asignado_a_nombre || 'Sin asignar'}</span>
                      <span>🏷️ {incidencia.departamento_nombre || 'Sin departamento'}</span>
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
                {!isReadOnly && (
                  <div className="flex items-center space-x-2">
                    <button className="text-sm btn-outline">Ver detalles</button>
                    <button className="text-sm btn-outline">Editar</button>
                    <button className="text-sm btn-outline">Comentarios</button>
                  </div>
                )}
              </div>
            ))}
            {incidencias.length === 0 && (
              <div className="card text-center text-gray-500">No hay incidencias registradas.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h2>
            {!isReadOnly && (
              <button className="btn-primary">
                <span className="mr-2">➕</span>
                Crear Usuario
              </button>
            )}
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
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary-100">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.name}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          {usuario.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {usuario.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {usuario.is_active ? 'activo' : 'inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {usuario.last_login ? new Date(usuario.last_login).toLocaleString() : 'Sin registro'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        {isReadOnly ? (
                          <span className="text-xs text-gray-400">Solo lectura</span>
                        ) : (
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">Editar</button>
                            <button className="text-yellow-600 hover:text-yellow-900">Resetear</button>
                            <button className="text-red-600 hover:text-red-900">Desactivar</button>
                          </div>
                        )}
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
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Empresa</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{configuracion?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RUC:</span>
                  <span className="font-medium">{configuracion?.ruc || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="font-medium">{configuracion?.direccion || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium">{configuracion?.telefono || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{configuracion?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Preferencias</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Moneda:</span>
                  <span className="font-medium">{configuracion?.moneda || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zona horaria:</span>
                  <span className="font-medium">{configuracion?.zona_horaria || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {isReadOnly
              ? 'Solo lectura: la edición se realiza desde Administración.'
              : 'Para editar, usa Administración → Configuración.'}
          </div>
        </div>
      )}

      {/* Distribución de inventario */}
      <InventoryDistribution data={inventoryDistributionData} />

      {/* Resumen rápido */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Resumen Rápido</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="p-3 border rounded-lg bg-primary-50 border-primary-200">
            <div className="mb-2 text-xl">👥</div>
            <div className="text-xs font-medium text-primary-700">{usuarios.length} usuarios</div>
          </div>
          <div className="p-3 border rounded-lg bg-secondary-50 border-secondary-200">
            <div className="mb-2 text-xl">🔧</div>
            <div className="text-xs font-medium text-secondary-700">{incidenciasPendientes} incidencias pendientes</div>
          </div>
          <div className="p-3 border rounded-lg bg-accent-50 border-accent-200">
            <div className="mb-2 text-xl">📊</div>
            <div className="text-xs font-medium text-accent-700">{logsResumen?.errores || 0} errores en logs</div>
          </div>
          <div className="p-3 border rounded-lg bg-gray-50 border-gray-200">
            <div className="mb-2 text-xl">⚙️</div>
            <div className="text-xs font-medium text-gray-700">{configuracion?.moneda || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Alertas del sistema */}
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="text-xl">⚠️</div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-yellow-800">Alertas del Sistema</h3>
            {incidenciasPendientes === 0 && (logsResumen?.errores || 0) === 0 ? (
              <p className="text-xs text-yellow-700">Sin alertas activas.</p>
            ) : (
              <ul className="space-y-1 text-xs text-yellow-700">
                {incidenciasPendientes > 0 && (
                  <li>• {incidenciasPendientes} incidencias pendientes</li>
                )}
                {(logsResumen?.errores || 0) > 0 && (
                  <li>• {logsResumen?.errores || 0} errores en logs</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemasDashboard;

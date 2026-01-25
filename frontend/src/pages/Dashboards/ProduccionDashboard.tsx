import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL_CORE from '../../config/api';
import { formatNumber, formatDateTime } from '../../utils/helpers';

interface ProduccionRegistro {
  id: string;
  fecha?: string;
  timestamp?: string;
  linea_id?: string;
  linea_nombre?: string;
  producto: string;
  cantidad: number;
  cantidad_defectuosa?: number;
  estado: string;
  calidad?: string;
  feedback?: string | null;
}

type Trend = 'up' | 'down' | 'stable';

interface MetricItem {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: Trend;
  percentage: number;
}

interface LineaProduccion {
  id: string;
  nombre: string;
  status?: string;
  usuarios: string[];
}

interface MiProduccionData {
  metricas?: {
    totalProducido: number;
    totalOrdenes: number;
  };
  registros?: ProduccionRegistro[];
}

const ProduccionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MiProduccionData | null>(null);
  const [lineas, setLineas] = useState<LineaProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('erp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchJson = async (url: string) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error ${res.status} al cargar datos`);
      return res.json();
    };

    const cargarDatos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchJson(`${API_BASE_URL_CORE}/produccion/mi-produccion?usuario_id=${user.id}`),
          fetchJson(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setData(results[0].value || null);
        if (results[1].status === 'fulfilled') setLineas(results[1].value?.lineas || []);

        if (results.every(r => r.status === 'rejected')) {
          setError('No se pudieron cargar los datos de producción');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar datos de producción');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const registros = data?.registros || [];
  const metricas = data?.metricas || { totalProducido: 0, totalOrdenes: 0 };

  const assignedLines = useMemo(() => {
    if (!user?.name && !user?.email) return [];
    const nombre = user?.name?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    return lineas.filter(linea =>
      linea.usuarios?.some(u => u.toLowerCase() === nombre || u.toLowerCase() === email)
    );
  }, [lineas, user?.name, user?.email]);

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        id: 'producido',
        title: 'Total producido',
        value: metricas.totalProducido || 0,
        unit: 'unidades',
        trend: 'stable',
        percentage: 0
      },
      {
        id: 'ordenes',
        title: 'Órdenes recibidas',
        value: metricas.totalOrdenes || 0,
        unit: 'ordenes',
        trend: 'stable',
        percentage: 0
      },
      {
        id: 'registros',
        title: 'Registros enviados',
        value: registros.length,
        unit: 'reportes',
        trend: 'stable',
        percentage: 0
      }
    ],
    [metricas.totalProducido, metricas.totalOrdenes, registros.length]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excelente':
        return 'text-green-600';
      case 'buena':
        return 'text-blue-600';
      case 'regular':
        return 'text-yellow-600';
      case 'mala':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="gradient-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Dashboard de Producción</h1>
              <p className="text-uit-green-100 text-lg">
                Registra tu producción diaria y supervisa tu progreso
              </p>
            </div>
          </div>
        </div>
        <div className="uit-card">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando datos de producción...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="gradient-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Dashboard de Producción</h1>
              <p className="text-uit-green-100 text-lg">
                Registra tu producción diaria y supervisa tu progreso
              </p>
            </div>
          </div>
        </div>
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
            <h1 className="text-4xl font-bold mb-3">Dashboard de Producción</h1>
            <p className="text-uit-green-100 text-lg">
              Registra tu producción diaria y supervisa tu progreso
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-uit-green-100">Líneas Activas: {assignedLines.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-uit-green-100">Órdenes Completadas: {metricas.totalOrdenes || 0}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-6xl">👷</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="uit-card group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.title}</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-uit-green-100 transition-colors">
                <span className="text-xl">📊</span>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatNumber(metric.value)}
              </span>
              <span className="text-sm font-medium text-gray-500">{metric.unit}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.percentage > 0 ? '+' : ''}{metric.percentage}%
                </span>
                <span className="text-xs text-gray-500">vs semana anterior</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-500' : 
                metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="uit-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Registro de Producción</h2>
        <p className="text-sm text-gray-600">
          El registro se realiza en el módulo <strong>Mi Producción</strong> para mantener datos 100% reales.
        </p>
      </div>

      {/* Historial de producción */}
      <div className="uit-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mi Historial de Producción</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(record.fecha || record.timestamp || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.producto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.cantidad} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getQualityColor(record.calidad || 'buena')}`}>
                      {(record.calidad || 'buena').charAt(0).toUpperCase() + (record.calidad || 'buena').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.estado)}`}>
                      {record.estado.charAt(0).toUpperCase() + record.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.feedback || '-'}
                  </td>
                </tr>
              ))}
              {registros.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay registros de producción disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de líneas asignadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignedLines.map((line) => (
          <div key={line.id} className="uit-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{line.nombre}</h3>
              <span className={`w-3 h-3 rounded-full ${
                line.status === 'activa' ? 'bg-green-500' : 
                line.status === 'mantenimiento' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuarios:</span>
                <span className="text-sm font-medium">{line.usuarios?.length || 0}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Estado: {(line.status || 'desconocido').charAt(0).toUpperCase() + (line.status || 'desconocido').slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {assignedLines.length === 0 && (
          <div className="uit-card md:col-span-2">
            <p className="text-sm text-gray-500">No hay líneas asignadas registradas para este usuario.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProduccionDashboard;

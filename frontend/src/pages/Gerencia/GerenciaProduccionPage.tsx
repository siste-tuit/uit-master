import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import API_BASE_URL_CORE from '../../config/api';

interface EstadisticasGerencia {
  totales: {
    total_producido: number;
    total_defectuoso: number;
    total_neto: number;
    porcentaje_calidad: number;
    total_reportes: number;
    total_usuarios: number;
  };
  diarios: Array<{
    fecha: string;
    cantidad_producida: number;
    cantidad_defectuosa: number;
    cantidad_neta: number;
    porcentaje_calidad: number;
    total_reportes: number;
  }>;
  semanales: Array<{
    semana: number;
    fecha_inicio: string;
    fecha_fin: string;
    cantidad_producida: number;
    cantidad_defectuosa: number;
    cantidad_neta: number;
    porcentaje_calidad: number;
    total_reportes: number;
    promedio_diario: number;
  }>;
  mensuales: Array<{
    mes: string;
    mes_numero: number;
    año: number;
    cantidad_producida: number;
    cantidad_defectuosa: number;
    cantidad_neta: number;
    porcentaje_calidad: number;
    total_reportes: number;
    promedio_diario: number;
  }>;
  efectividad_por_usuario: Array<{
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    metricas: {
      total_producido: number;
      total_defectuoso: number;
      total_neto: number;
      porcentaje_calidad: number;
      efectividad: number;
      total_reportes: number;
      promedio_diario: number;
    };
  }>;
}

const GerenciaProduccionPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EstadisticasGerencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/estadisticas-gerencia`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las estadísticas');
        }

        const result = await response.json();
        console.log('📊 Estadísticas recibidas para Gerencia:', result);
        setData(result);
      } catch (err: any) {
        console.error('Error al cargar estadísticas:', err);
        setError(err.message || 'No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const getEfectividadColor = (efectividad: number) => {
    if (efectividad >= 90) return 'text-green-600 bg-green-100';
    if (efectividad >= 75) return 'text-blue-600 bg-blue-100';
    if (efectividad >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCalidadColor = (calidad: number) => {
    if (calidad >= 90) return 'text-green-600';
    if (calidad >= 75) return 'text-blue-600';
    if (calidad >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas de producción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium">❌ Error al cargar estadísticas</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">🏭 Producción - Vista Gerencial</h1>
        <p className="text-sm text-gray-600">Reportes diarios, semanales y mensuales de producción proporcionados por el área de Ingeniería</p>
      </div>

      {/* Métricas Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Producido</p>
          <p className="text-2xl font-bold text-green-600">{data.totales.total_producido.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Defectuoso</p>
          <p className="text-2xl font-bold text-red-600">{data.totales.total_defectuoso.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Neto</p>
          <p className="text-2xl font-bold text-blue-600">{data.totales.total_neto.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Porcentaje de Calidad</p>
          <p className={`text-2xl font-bold ${getCalidadColor(data.totales.porcentaje_calidad)}`}>
            {data.totales.porcentaje_calidad}%
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.totales.porcentaje_calidad >= 90 ? 'bg-green-600' :
                data.totales.porcentaje_calidad >= 75 ? 'bg-blue-600' :
                data.totales.porcentaje_calidad >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${data.totales.porcentaje_calidad}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Producción Diaria (Últimos 7 días) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📅 Producción Diaria (Últimos 7 días)</h2>
        {data.diarios.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.diarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={formatFecha}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString('es-PE')}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              />
              <Legend />
              <Bar dataKey="cantidad_neta" fill="#10B981" name="Producción Neta" />
              <Bar dataKey="cantidad_defectuosa" fill="#EF4444" name="Defectuoso" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos de producción diaria disponibles
          </div>
        )}
      </div>

      {/* Producción Semanal (Últimas 4 semanas) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📊 Producción Semanal (Últimas 4 semanas)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.semanales.map((semana, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Semana {semana.semana}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {formatFecha(semana.fecha_inicio)} - {formatFecha(semana.fecha_fin)}
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Neto</p>
                  <p className="text-base font-bold text-blue-600">{semana.cantidad_neta.toLocaleString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Calidad</p>
                  <p className={`text-base font-bold ${getCalidadColor(semana.porcentaje_calidad)}`}>
                    {semana.porcentaje_calidad}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Promedio Diario</p>
                  <p className="text-xs font-semibold text-gray-700">{semana.promedio_diario.toLocaleString('es-PE')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Producción Mensual (Últimos 6 meses) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📆 Producción Mensual (Últimos 6 meses)</h2>
        {data.mensuales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.mensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('es-PE')} />
              <Legend />
              <Line type="monotone" dataKey="cantidad_neta" stroke="#10B981" strokeWidth={2} name="Producción Neta" />
              <Line type="monotone" dataKey="cantidad_defectuosa" stroke="#EF4444" strokeWidth={2} name="Defectuoso" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos de producción mensual disponibles
          </div>
        )}
      </div>

      {/* Efectividad por Usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Efectividad por Usuario de Producción</h2>
        <p className="text-sm text-gray-600 mb-4">
          Rendimiento de cada usuario basado en calidad y producción (datos proporcionados por Ingeniería)
        </p>
        {data.efectividad_por_usuario.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Usuario</th>
                  <th className="py-3 pr-4 font-medium">Total Producido</th>
                  <th className="py-3 pr-4 font-medium">Defectuoso</th>
                  <th className="py-3 pr-4 font-medium">Neto</th>
                  <th className="py-3 pr-4 font-medium">Calidad</th>
                  <th className="py-3 pr-4 font-medium">Efectividad</th>
                  <th className="py-3 pr-4 font-medium">Reportes</th>
                  <th className="py-3 pr-4 font-medium">Promedio Diario</th>
                </tr>
              </thead>
              <tbody>
                {data.efectividad_por_usuario.map((item, index) => (
                  <tr key={item.usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.usuario.nombre}</p>
                        <p className="text-xs text-gray-500">{item.usuario.email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-green-600">
                      {item.metricas.total_producido.toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 pr-4 font-mono text-red-600">
                      {item.metricas.total_defectuoso.toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold text-blue-600">
                      {item.metricas.total_neto.toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfectividadColor(item.metricas.porcentaje_calidad)}`}>
                        {item.metricas.porcentaje_calidad}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfectividadColor(item.metricas.efectividad)}`}>
                          {item.metricas.efectividad}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.metricas.efectividad >= 90 ? 'bg-green-600' :
                              item.metricas.efectividad >= 75 ? 'bg-blue-600' :
                              item.metricas.efectividad >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${item.metricas.efectividad}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{item.metricas.total_reportes}</td>
                    <td className="py-3 pr-4 font-mono text-gray-700">
                      {item.metricas.promedio_diario.toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos de efectividad por usuario disponibles
          </div>
        )}
      </div>

      {/* Gráfico de Efectividad por Usuario */}
      {data.efectividad_por_usuario.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Comparativa de Efectividad por Usuario</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.efectividad_por_usuario.map(item => ({
              nombre: item.usuario.nombre.split(' ')[0], // Solo primer nombre para el gráfico
              efectividad: item.metricas.efectividad,
              calidad: item.metricas.porcentaje_calidad
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="efectividad" fill="#10B981" name="Efectividad %" />
              <Bar dataKey="calidad" fill="#3B82F6" name="Calidad %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GerenciaProduccionPage;

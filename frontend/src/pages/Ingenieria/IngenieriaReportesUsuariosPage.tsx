import React, { useState, useEffect } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface ReporteDiario {
  id: string;
  fecha: string;
  cantidad_producida: number;
  cantidad_defectuosa: number;
  cantidad_neta: number;
  observaciones: string | null;
  incidencias: string | null;
  linea_nombre: string | null;
  usuario_nombre: string;
  usuario_email: string;
}

interface UsuarioReportes {
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
  reportes: ReporteDiario[];
  metricas: {
    totalProducido: number;
    totalDefectuoso: number;
    totalNeto: number;
    totalReportes: number;
    promedioDiario: number;
  };
}

const IngenieriaReportesUsuariosPage: React.FC = () => {
  const [data, setData] = useState<UsuarioReportes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL_CORE}/reportes-produccion/reportes-diarios?`;
      const params = new URLSearchParams();

      if (filtroFechaInicio) {
        params.append('fecha_inicio', filtroFechaInicio);
      }
      if (filtroFechaFin) {
        params.append('fecha_fin', filtroFechaFin);
      }
      if (usuarioSeleccionado) {
        params.append('usuario_id', usuarioSeleccionado);
      }

      url += params.toString();

      const token = localStorage.getItem('erp_token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los reportes');
      }

      const result = await response.json();
      setData(result.usuariosConMetricas || []);
    } catch (err: any) {
      console.error('Error al cargar reportes:', err);
      setError(err.message || 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      cargarReportes();
    } else {
      setLoading(false);
      setError('No hay sesión activa');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFechaInicio, filtroFechaFin, usuarioSeleccionado]);

  const calcularTotalGeneral = () => {
    if (!data || data.length === 0) {
      return { producido: 0, defectuoso: 0, neto: 0, reportes: 0, promedioDiario: 0 };
    }

    const total = data.reduce((acc, usuario) => ({
      producido: acc.producido + (usuario.metricas?.totalProducido || 0),
      defectuoso: acc.defectuoso + (usuario.metricas?.totalDefectuoso || 0),
      neto: acc.neto + (usuario.metricas?.totalNeto || 0),
      reportes: acc.reportes + (usuario.metricas?.totalReportes || 0)
    }), { producido: 0, defectuoso: 0, neto: 0, reportes: 0 });

    return {
      ...total,
      promedioDiario: total.reportes > 0 ? Math.round(total.neto / total.reportes) : 0
    };
  };

  const totalGeneral = calcularTotalGeneral();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
          <button
            onClick={cargarReportes}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Reportes de Usuarios de Producción</h1>
        <p className="text-gray-600">Visualiza el progreso y reportes diarios de todos los usuarios</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario (opcional)
            </label>
            <select
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={data.length === 0}
            >
              <option value="">Todos los usuarios</option>
              {data.length > 0 && data.map((usuario) => (
                <option key={usuario.usuario.id} value={usuario.usuario.id}>
                  {usuario.usuario.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroFechaInicio('');
                setFiltroFechaFin('');
                setUsuarioSeleccionado('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Producido</p>
          <p className="text-2xl font-bold text-green-600">{totalGeneral.producido.toLocaleString('es-PE')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Defectuoso</p>
          <p className="text-2xl font-bold text-red-600">{totalGeneral.defectuoso.toLocaleString('es-PE')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Neto</p>
          <p className="text-2xl font-bold text-blue-600">{totalGeneral.neto.toLocaleString('es-PE')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Promedio Diario</p>
          <p className="text-2xl font-bold text-purple-600">{totalGeneral.promedioDiario.toLocaleString('es-PE')}</p>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-6">
        {data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No hay reportes disponibles para el período seleccionado</p>
          </div>
        ) : (
          data.map((usuarioData) => (
            <div key={usuarioData.usuario.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del Usuario */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{usuarioData.usuario.nombre}</h3>
                    <p className="text-sm text-gray-600">{usuarioData.usuario.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Reportes</p>
                    <p className="text-xl font-bold text-green-600">{usuarioData.metricas.totalReportes}</p>
                  </div>
                </div>

                {/* Métricas del Usuario */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Producido</p>
                    <p className="text-lg font-semibold text-green-700">{usuarioData.metricas.totalProducido.toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Defectuoso</p>
                    <p className="text-lg font-semibold text-red-700">{usuarioData.metricas.totalDefectuoso.toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Neto</p>
                    <p className="text-lg font-semibold text-blue-700">{usuarioData.metricas.totalNeto.toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Promedio Diario</p>
                    <p className="text-lg font-semibold text-purple-700">{usuarioData.metricas.promedioDiario.toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Eficiencia</p>
                    <p className="text-lg font-semibold text-indigo-700">
                      {usuarioData.metricas.totalProducido > 0
                        ? `${Math.round((usuarioData.metricas.totalNeto / usuarioData.metricas.totalProducido) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de Reportes */}
              {usuarioData.reportes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Línea
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producido
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Defectuoso
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Neto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dueño Línea / Pedido
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observaciones
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incidencias
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarioData.reportes.map((reporte) => (
                        <tr key={reporte.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(reporte.fecha).toLocaleDateString('es-PE')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {reporte.linea_nombre || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            {reporte.cantidad_producida.toLocaleString('es-PE')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">
                            {reporte.cantidad_defectuosa.toLocaleString('es-PE')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                            {reporte.cantidad_neta ? reporte.cantidad_neta.toLocaleString('es-PE') : (reporte.cantidad_producida - reporte.cantidad_defectuosa).toLocaleString('es-PE')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                            {(() => {
                              const obs = reporte.observaciones || '';
                              const duenoMatch = obs.match(/Dueño de la línea:\s*([^|]+)/i);
                              const pedidoMatch = obs.match(/Pedido relacionado \(ficha\):\s*([^|]+)/i);
                              
                              if (duenoMatch || pedidoMatch) {
                                return (
                                  <div className="space-y-1">
                                    {duenoMatch && (
                                      <div className="text-blue-700 font-medium">
                                        👤 {duenoMatch[1].trim()}
                                      </div>
                                    )}
                                    {pedidoMatch && (
                                      <div className="text-green-700 font-mono text-xs">
                                        📋 Ficha: {pedidoMatch[1].trim()}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <span className="text-gray-500">-</span>;
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                            {reporte.observaciones ? (
                              <div className="max-w-xs">
                                {(() => {
                                  const obs = reporte.observaciones;
                                  // Remover información de Dueño y Pedido si está presente
                                  let obsClean = obs
                                    .replace(/Dueño de la línea:\s*[^|]+\|?\s*/gi, '')
                                    .replace(/Pedido relacionado \(ficha\):\s*[^|]+\|?\s*/gi, '')
                                    .trim()
                                    .replace(/\|\s*\|/g, '|')
                                    .replace(/^\||\|$/g, '')
                                    .trim();
                                  return obsClean ? (
                                    <span className="text-xs" title={obsClean}>{obsClean.length > 50 ? obsClean.substring(0, 50) + '...' : obsClean}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  );
                                })()}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                            {reporte.incidencias ? (
                              <span className="text-orange-600" title={reporte.incidencias}>
                                ⚠️ {reporte.incidencias.length > 30 ? reporte.incidencias.substring(0, 30) + '...' : reporte.incidencias}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IngenieriaReportesUsuariosPage;


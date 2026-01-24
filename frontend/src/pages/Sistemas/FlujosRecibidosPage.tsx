import React, { useState, useEffect } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface FlujoSalidaRecibido {
  id: string;
  fecha_envio: string;
  enviado_por: string;
  enviado_por_email: string;
  filtros: {
    linea: string;
    anio: string;
    mes: string;
    semana: string;
    dia: string;
  };
  filas: Array<{
    anio: string;
    mes: string;
    semana: string;
    dia: string;
    fecha: string;
    linea: string;
    ficha: string;
    prendasEnviadas: number;
    tStd: string;
    estatus: string;
    observacion: string;
    bajada: string;
  }>;
  total_filas: number;
  fecha_creacion: string;
  estado: 'pendiente' | 'revisado' | 'procesado';
}

const FlujosRecibidosPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [flujos, setFlujos] = useState<FlujoSalidaRecibido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'revisado' | 'procesado'>('todos');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [flujoSeleccionado, setFlujoSeleccionado] = useState<FlujoSalidaRecibido | null>(null);

  useEffect(() => {
    cargarFlujos();
  }, [filtroEstado, filtroFechaInicio, filtroFechaFin]);

  const cargarFlujos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('erp_token');
      
      let url = `${API_BASE_URL_CORE}/flujos-salida/recibidos?`;
      const params = new URLSearchParams();
      
      if (filtroEstado !== 'todos') {
        params.append('estado', filtroEstado);
      }
      if (filtroFechaInicio) {
        params.append('fecha_inicio', filtroFechaInicio);
      }
      if (filtroFechaFin) {
        params.append('fecha_fin', filtroFechaFin);
      }
      
      url += params.toString();

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFlujos(data.flujos || []);
      } else {
        console.error('Error al cargar flujos:', response.status);
        setFlujos([]);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setFlujos([]);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (flujoId: string, nuevoEstado: 'pendiente' | 'revisado' | 'procesado') => {
    if (isReadOnly) {
      return;
    }
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/flujos-salida/${flujoId}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        alert('✅ Estado actualizado correctamente');
        cargarFlujos();
        if (flujoSeleccionado?.id === flujoId) {
          setFlujoSeleccionado(null);
        }
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.message || 'No se pudo actualizar el estado'}`);
      }
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message}`);
    }
  };

  const flujosFiltrados = flujos.filter(flujo => {
    if (filtroEstado !== 'todos' && flujo.estado !== filtroEstado) {
      return false;
    }
    if (filtroFechaInicio) {
      const fechaEnvio = new Date(flujo.fecha_envio);
      const fechaInicio = new Date(filtroFechaInicio);
      if (fechaEnvio < fechaInicio) return false;
    }
    if (filtroFechaFin) {
      const fechaEnvio = new Date(flujo.fecha_envio);
      const fechaFin = new Date(filtroFechaFin);
      fechaFin.setHours(23, 59, 59);
      if (fechaEnvio > fechaFin) return false;
    }
    return true;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'revisado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'procesado':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '⏳ Pendiente';
      case 'revisado':
        return '👁️ Revisado';
      case 'procesado':
        return '✅ Procesado';
      default:
        return estado;
    }
  };

  const totalFlujos = flujos.length;
  const pendientes = flujos.filter(f => f.estado === 'pendiente').length;
  const revisados = flujos.filter(f => f.estado === 'revisado').length;
  const procesados = flujos.filter(f => f.estado === 'procesado').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📥 Flujos Recibidos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona los flujos de salida enviados desde Ingeniería. Revisa, procesa y mantén un registro de todos los flujos recibidos.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Total Flujos</p>
          <p className="text-4xl font-bold">{totalFlujos}</p>
          <p className="text-xs mt-2 opacity-80">flujos recibidos</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Pendientes</p>
          <p className="text-4xl font-bold">{pendientes}</p>
          <p className="text-xs mt-2 opacity-80">requieren revisión</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Revisados</p>
          <p className="text-4xl font-bold">{revisados}</p>
          <p className="text-xs mt-2 opacity-80">en revisión</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Procesados</p>
          <p className="text-4xl font-bold">{procesados}</p>
          <p className="text-xs mt-2 opacity-80">completados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">⏳ Pendiente</option>
              <option value="revisado">👁️ Revisado</option>
              <option value="procesado">✅ Procesado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroEstado('todos');
                setFiltroFechaInicio('');
                setFiltroFechaFin('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Flujos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Cargando flujos...</p>
        </div>
      ) : flujosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay flujos recibidos</h3>
          <p className="text-gray-600">
            Los flujos de salida enviados desde Ingeniería aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flujosFiltrados.map((flujo) => (
            <div
              key={flujo.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header del Flujo */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        Flujo #{flujo.id.substring(0, 8)}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(flujo.estado)}`}>
                        {getEstadoTexto(flujo.estado)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Enviado por:</span>
                        <p className="font-semibold text-gray-900">{flujo.enviado_por}</p>
                        <p className="text-xs text-gray-500">{flujo.enviado_por_email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fecha de envío:</span>
                        <p className="font-semibold text-gray-900">
                          {new Date(flujo.fecha_envio).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total de filas:</span>
                        <p className="font-semibold text-gray-900">{flujo.total_filas}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Línea:</span>
                        <p className="font-semibold text-gray-900">
                          {flujo.filtros.linea || 'Todas'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setFlujoSeleccionado(flujoSeleccionado?.id === flujo.id ? null : flujo)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      {flujoSeleccionado?.id === flujo.id ? '👁️ Ocultar' : '👁️ Ver Detalles'}
                    </button>
                    {!isReadOnly && flujo.estado === 'pendiente' && (
                      <button
                        onClick={() => actualizarEstado(flujo.id, 'revisado')}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        👁️ Marcar Revisado
                      </button>
                    )}
                    {!isReadOnly && flujo.estado === 'revisado' && (
                      <button
                        onClick={() => actualizarEstado(flujo.id, 'procesado')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        ✅ Marcar Procesado
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles del Flujo (Expandible) */}
              {flujoSeleccionado?.id === flujo.id && (
                <div className="p-6 border-t border-gray-200">
                  {/* Filtros Aplicados */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Filtros Aplicados</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Línea:</span>
                        <p className="font-semibold">{flujo.filtros.linea || 'Todas'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Año:</span>
                        <p className="font-semibold">{flujo.filtros.anio}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Mes:</span>
                        <p className="font-semibold">
                          {flujo.filtros.mes ? new Date(2000, parseInt(flujo.filtros.mes) - 1).toLocaleDateString('es-ES', { month: 'long' }) : 'Todos'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Semana:</span>
                        <p className="font-semibold">{flujo.filtros.semana || 'Todas'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Día:</span>
                        <p className="font-semibold">{flujo.filtros.dia || 'Todos'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Filas */}
                  <div className="overflow-x-auto">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Detalle de Filas ({flujo.filas.length})</h4>
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-primary-50">
                        <tr className="text-left text-sm font-semibold text-primary-800">
                          <th className="px-3 py-3 border-b border-gray-200">Fecha</th>
                          <th className="px-3 py-3 border-b border-gray-200">Línea</th>
                          <th className="px-3 py-3 border-b border-gray-200">Ficha</th>
                          <th className="px-3 py-3 border-b border-gray-200">Prendas</th>
                          <th className="px-3 py-3 border-b border-gray-200">T.ST</th>
                          <th className="px-3 py-3 border-b border-gray-200">Estatus</th>
                          <th className="px-3 py-3 border-b border-gray-200">Observaciones</th>
                          <th className="px-3 py-3 border-b border-gray-200">Bajada</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700">
                        {flujo.filas.map((fila, index) => (
                          <tr key={index} className="odd:bg-white even:bg-gray-50">
                            <td className="px-3 py-2 border-b border-gray-200">
                              {new Date(fila.fecha).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">{fila.linea}</td>
                            <td className="px-3 py-2 border-b border-gray-200 font-semibold">{fila.ficha}</td>
                            <td className="px-3 py-2 border-b border-gray-200 text-right font-bold text-green-600">
                              {fila.prendasEnviadas.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">{fila.tStd || '-'}</td>
                            <td className="px-3 py-2 border-b border-gray-200">{fila.estatus || '-'}</td>
                            <td className="px-3 py-2 border-b border-gray-200 max-w-xs">
                              <span className="truncate block" title={fila.observacion || ''}>
                                {fila.observacion || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">{fila.bajada || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlujosRecibidosPage;


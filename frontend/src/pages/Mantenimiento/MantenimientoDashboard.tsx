import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';

const MantenimientoDashboard: React.FC = () => {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          fetchJson(`${API_BASE_URL_CORE}/equipos`),
          fetchJson(`${API_BASE_URL_CORE}/ordenes`),
          fetchJson(`${API_BASE_URL_CORE}/repuestos`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setEquipos(results[0].value || []);
        if (results[1].status === 'fulfilled') setOrdenes(results[1].value || []);
        if (results[2].status === 'fulfilled') setRepuestos(results[2].value || []);

        if (results.every(r => r.status === 'rejected')) {
          setError('No se pudieron cargar los datos de mantenimiento');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar datos de mantenimiento');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, []);

  const equiposOperativos = useMemo(
    () => equipos.filter((e) => e.estado === 'OPERATIVO').length,
    [equipos]
  );
  const equiposMantenimiento = useMemo(
    () => equipos.filter((e) => e.estado === 'MANTENIMIENTO').length,
    [equipos]
  );
  const equiposFueraServicio = useMemo(
    () => equipos.filter((e) => e.estado === 'FUERA_SERVICIO').length,
    [equipos]
  );

  const ordenesActivas = useMemo(
    () => ordenes.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length,
    [ordenes]
  );

  const repuestosBajoStock = useMemo(
    () => repuestos.filter((r) => r.stock_bajo || (r.stock_minimo !== undefined && r.stock <= r.stock_minimo)).length,
    [repuestos]
  );

  const metricas = [
    { title: 'Equipos Operativos', value: equiposOperativos, unit: 'equipos' },
    { title: 'En Mantenimiento', value: equiposMantenimiento, unit: 'equipos' },
    { title: 'Fuera de Servicio', value: equiposFueraServicio, unit: 'equipos' },
    { title: 'Órdenes Activas', value: ordenesActivas, unit: 'OTs' }
  ];

  const estadoLineas = useMemo(() => {
    const map = new Map<string, string>();
    const prioridad = { FUERA_SERVICIO: 3, MANTENIMIENTO: 2, OPERATIVO: 1 } as Record<string, number>;
    equipos.forEach((equipo) => {
      const linea = equipo.linea_produccion || 'Sin línea';
      const actual = map.get(linea);
      const estadoEquipo = equipo.estado || 'OPERATIVO';
      if (!actual || prioridad[estadoEquipo] > prioridad[actual]) {
        map.set(linea, estadoEquipo);
      }
    });
    return Array.from(map.entries());
  }, [equipos]);

  const ordenesPrioritarias = useMemo(() => {
    const prioridad = { URGENTE: 4, ALTA: 3, MEDIA: 2, BAJA: 1 } as Record<string, number>;
    return [...ordenes]
      .sort((a, b) => (prioridad[b.prioridad] || 0) - (prioridad[a.prioridad] || 0))
      .slice(0, 3);
  }, [ordenes]);

  const repuestosCriticos = useMemo(
    () => repuestos.filter((r) => r.stock_bajo || r.is_critico).slice(0, 3),
    [repuestos]
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Cargando mantenimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🔧 Dashboard de Mantenimiento
        </h1>
        <p className="text-gray-600">
          Gestión de equipos y mantenimiento de maquinaria textil
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metric, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                <span className="text-xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">{metric.title}</p>
                <p className="text-lg font-bold text-gray-900">{metric.value} {metric.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado de Equipos */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            🏭 Estado de Equipos por Línea
          </h3>
          <div className="space-y-3">
            {estadoLineas.length === 0 && (
              <div className="text-sm text-gray-500">No hay equipos registrados.</div>
            )}
            {estadoLineas.map(([linea, estado]) => {
              const badge =
                estado === 'OPERATIVO'
                  ? 'bg-green-100 text-green-800'
                  : estado === 'MANTENIMIENTO'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800';
              const row =
                estado === 'OPERATIVO'
                  ? 'bg-green-50'
                  : estado === 'MANTENIMIENTO'
                  ? 'bg-yellow-50'
                  : 'bg-red-50';
              const label =
                estado === 'OPERATIVO'
                  ? 'Operativa'
                  : estado === 'MANTENIMIENTO'
                  ? 'Mantenimiento'
                  : 'Fuera de servicio';
              return (
                <div key={linea} className={`flex items-center justify-between p-3 rounded-lg ${row}`}>
                  <span className="font-medium">{linea}</span>
                  <span className={`px-2 py-1 text-sm rounded-full ${badge}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            📋 Órdenes de Trabajo Activas
          </h3>
          <div className="space-y-3">
            {ordenesPrioritarias.length === 0 && (
              <div className="text-sm text-gray-500">No hay órdenes activas.</div>
            )}
            {ordenesPrioritarias.map((orden) => {
              const color =
                orden.prioridad === 'URGENTE'
                  ? 'border-red-600'
                  : orden.prioridad === 'ALTA'
                  ? 'border-red-500'
                  : orden.prioridad === 'MEDIA'
                  ? 'border-yellow-500'
                  : 'border-green-500';
              return (
                <div key={orden.id} className={`pl-4 border-l-4 ${color}`}>
                  <p className="font-medium text-gray-900">{orden.titulo}</p>
                  <p className="text-sm text-gray-600">
                    Prioridad: {orden.prioridad} - Tiempo estimado: {orden.tiempo_estimado_h || '-'}h
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventario de Repuestos */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          🔩 Inventario de Repuestos Críticos
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {repuestosCriticos.length === 0 && (
            <div className="text-sm text-gray-500">No hay repuestos críticos registrados.</div>
          )}
          {repuestosCriticos.map((repuesto) => {
            const stock = Number(repuesto.stock || 0);
            const minimo = Number(repuesto.stock_minimo || 0);
            const porcentaje = minimo > 0 ? Math.min(100, Math.round((stock / minimo) * 100)) : 0;
            const estado = stock === 0 ? 'Stock Cero' : stock <= minimo ? 'Stock Bajo' : 'Stock Normal';
            const color =
              stock === 0 ? 'text-red-600' : stock <= minimo ? 'text-yellow-600' : 'text-green-600';
            const bar =
              stock === 0 ? 'bg-red-500' : stock <= minimo ? 'bg-yellow-500' : 'bg-green-500';
            return (
              <div key={repuesto.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{repuesto.nombre}</span>
                  <span className={`text-sm ${color}`}>{estado}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className={`h-2 ${bar} rounded-full`} style={{ width: `${porcentaje}%` }}></div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{stock} unidades disponibles</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-4">
        <button className="p-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
          <div className="mb-2 text-2xl">➕</div>
          <div className="font-medium">Nueva Orden</div>
        </button>
        <button className="p-4 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">
          <div className="mb-2 text-2xl">📋</div>
          <div className="font-medium">Ver Equipos</div>
        </button>
        <button className="p-4 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700">
          <div className="mb-2 text-2xl">📦</div>
          <div className="font-medium">Inventario</div>
        </button>
        <button className="p-4 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700">
          <div className="mb-2 text-2xl">📅</div>
          <div className="font-medium">Calendario</div>
        </button>
      </div>
    </div>
  );
};

export default MantenimientoDashboard;

import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
// Nota: cuando integremos gráficos reales, importaremos los componentes de chartjs

const AdminReportsPage: React.FC = () => {
  const [produccionPeriodo, setProduccionPeriodo] = useState<any[]>([]);
  const [registrosFinancieros, setRegistrosFinancieros] = useState<any[]>([]);
  const [inventarioResumen, setInventarioResumen] = useState<any>(null);
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
          fetchJson(`${API_BASE_URL_CORE}/produccion/periodo?periodo=diaria`),
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/registros?limit=200`),
          fetchJson(`${API_BASE_URL_CORE}/inventario/resumen-departamentos`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setProduccionPeriodo(results[0].value?.datos || []);
        if (results[1].status === 'fulfilled') setRegistrosFinancieros(results[1].value || []);
        if (results[2].status === 'fulfilled') setInventarioResumen(results[2].value);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar reportes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, []);

  const productionData = useMemo(() => ({
    labels: produccionPeriodo.map((d) => d.date),
    datasets: [
      {
        label: 'Producción',
        data: produccionPeriodo.map((d) => d.production),
        borderColor: '#1A5632',
        backgroundColor: 'rgba(26, 86, 50, 0.15)',
        tension: 0.3,
      }
    ],
  }), [produccionPeriodo]);

  const financesData = useMemo(() => {
    const buckets: Record<string, { ingresos: number; egresos: number }> = {};
    registrosFinancieros.forEach((r: any) => {
      const fecha = r.fecha;
      if (!fecha) return;
      const key = new Date(fecha).toISOString().slice(0, 7);
      if (!buckets[key]) buckets[key] = { ingresos: 0, egresos: 0 };
      if (r.tipo === 'ingreso') buckets[key].ingresos += Number(r.monto || 0);
      if (r.tipo === 'egreso' || r.tipo === 'gasto') buckets[key].egresos += Number(r.monto || 0);
    });
    const labels = Object.keys(buckets).sort().slice(-6);
    return {
      labels,
      datasets: [
        { label: 'Ingresos', data: labels.map((l) => buckets[l].ingresos), backgroundColor: '#10B981' },
        { label: 'Egresos', data: labels.map((l) => buckets[l].egresos), backgroundColor: '#EF4444' }
      ]
    };
  }, [registrosFinancieros]);

  const inventoryData = useMemo(() => ({
    labels: ['Ingeniería', 'Mantenimiento'],
    datasets: [
      {
        label: 'Distribución',
        data: [
          Number(inventarioResumen?.ingenieria?.stockTotal || 0),
          Number(inventarioResumen?.mantenimiento?.stockTotal || 0)
        ],
        backgroundColor: ['#1A5632', '#3B82F6'],
      },
    ],
  }), [inventarioResumen]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📈 Reportes y Análisis</h1>
        <p className="text-gray-600">KPIs y tendencias para la toma de decisiones.</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-600">Cargando reportes...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Producción por línea</h2>
          <div className="h-64">
            {/* Placeholder para gráfico de línea */}
            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Datos: {JSON.stringify(productionData.labels.slice(0,3))}...</pre>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Ingresos vs Egresos</h2>
          <div className="h-64">
            {/* Placeholder para gráfico de barras */}
            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Meses: {JSON.stringify(financesData.labels)}</pre>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-3">Distribución de Inventario</h2>
          <div className="h-64">
            {/* Placeholder para gráfico de dona */}
            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Categorías: {JSON.stringify(inventoryData.labels)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;



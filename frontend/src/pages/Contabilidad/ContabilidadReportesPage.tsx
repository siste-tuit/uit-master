import React, { useEffect, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface MetricasFinancieras {
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
}

interface IngresosMensuales {
  ingresosMensuales: number;
  cambioPorcentaje: number;
  mesActual: number;
  añoActual: number;
}

const ContabilidadReportesPage: React.FC = () => {
  const [metricas, setMetricas] = useState<MetricasFinancieras>({
    ingresos: 0,
    egresos: 0,
    gastos: 0,
    utilidad: 0
  });
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresosMensuales | null>(null);
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
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/metricas`),
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/ingresos-mensuales`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setMetricas(results[0].value);
        if (results[1].status === 'fulfilled') setIngresosMensuales(results[1].value);
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

  const mesActualLabel = ingresosMensuales
    ? new Date(ingresosMensuales.añoActual, ingresosMensuales.mesActual - 1, 1).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      })
    : 'Mes actual';

  const ingresos = metricas.ingresos || 0;
  const egresos = (metricas.egresos || 0) + (metricas.gastos || 0);
  const utilidad = metricas.utilidad || 0;

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Reportes Financieros</h1>
        <p className="text-gray-600">Indicadores del periodo actual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ingresos acumulados</p>
          <p className="text-2xl font-semibold text-emerald-700">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(ingresos)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Egresos acumulados</p>
          <p className="text-2xl font-semibold text-red-600">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(egresos)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Utilidad acumulada</p>
          <p className="text-2xl font-semibold text-indigo-700">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(utilidad)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-2">Periodo</h2>
        <p className="text-sm text-gray-700">{mesActualLabel}</p>
      </div>
    </div>
  );
};

export default ContabilidadReportesPage;



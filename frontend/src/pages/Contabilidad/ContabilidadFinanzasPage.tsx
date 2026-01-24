import React, { useEffect, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface MetricasFinancieras {
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
}

interface RegistroFinanciero {
  id: string;
  tipo: 'ingreso' | 'egreso' | 'gasto';
  categoria: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
}

const ContabilidadFinanzasPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [metricas, setMetricas] = useState<MetricasFinancieras>({
    ingresos: 0,
    egresos: 0,
    gastos: 0,
    utilidad: 0
  });
  const [registros, setRegistros] = useState<RegistroFinanciero[]>([]);
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
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/registros?limit=20`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setMetricas(results[0].value);
        if (results[1].status === 'fulfilled') setRegistros(results[1].value || []);
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

  const totalIngresos = metricas.ingresos || 0;
  const totalEgresos = (metricas.egresos || 0) + (metricas.gastos || 0);
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
        <h1 className="text-2xl font-bold text-gray-800">💳 Finanzas</h1>
        <p className="text-gray-600">Resumen de ingresos, egresos y utilidad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ingresos</p>
          <p className="text-xs md:text-sm font-extrabold text-emerald-700">{(new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalIngresos))}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Egresos</p>
          <p className="text-xs md:text-sm font-extrabold text-red-600">{(new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalEgresos))}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Utilidad</p>
          <p className="text-xs md:text-sm font-extrabold text-indigo-700">{(new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(utilidad))}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Registros recientes</h2>
          {!isReadOnly && (
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Nuevo registro</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Monto</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4">{new Date(r.fecha).toLocaleDateString()}</td>
                  <td className="py-2 pr-4 capitalize">{r.tipo}</td>
                  <td className="py-2 pr-4">{r.categoria}</td>
                  <td className="py-2 pr-4">{r.descripcion || 'Sin descripción'}</td>
                  <td className="py-2 pr-4 font-mono">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(r.monto)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 text-xs rounded ${r.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {registros.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                    No hay registros financieros recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadFinanzasPage;



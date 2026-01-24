import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface RegistroFinanciero {
  id: string;
  tipo: 'ingreso' | 'egreso' | 'gasto';
  categoria: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
}

const ContabilidadFacturacionPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [registros, setRegistros] = useState<RegistroFinanciero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('erp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchRegistros = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/registros?limit=50`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status} al cargar registros`);
        const data = await res.json();
        if (isMounted) setRegistros(data || []);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error al cargar registros');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRegistros();
    return () => {
      isMounted = false;
    };
  }, []);

  const facturas = useMemo(
    () => registros.filter(r => r.tipo === 'ingreso'),
    [registros]
  );

  const resumen = useMemo(() => {
    const total = facturas.length;
    const pendientes = facturas.filter(f => f.status === 'pendiente').length;
    const aprobadas = facturas.filter(f => f.status === 'aprobado').length;
    const rechazadas = facturas.filter(f => f.status === 'rechazado').length;
    const montoTotal = facturas.reduce((sum, f) => sum + Number(f.monto || 0), 0);
    return { total, pendientes, aprobadas, rechazadas, montoTotal };
  }, [facturas]);

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
        <h1 className="text-2xl font-bold text-gray-800">🧾 Facturación</h1>
        <p className="text-gray-600">Gestione facturas emitidas y pendientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Facturas</h2>
            {!isReadOnly && (
              <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Nueva factura</button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Número</th>
                  <th className="py-2 pr-4">Cliente/Concepto</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-mono">{`F-${f.id.substring(0, 6)}`}</td>
                    <td className="py-2 pr-4">{f.categoria}</td>
                    <td className="py-2 pr-4">{new Date(f.fecha).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 font-mono text-[10px] md:text-xs">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(f.monto)}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 text-xs rounded ${f.status === 'aprobado' ? 'bg-green-100 text-green-700' : f.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span>
                    </td>
                    <td className="py-2 space-x-2">
                      <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Ver</button>
                      <button className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700">PDF</button>
                    </td>
                  </tr>
                ))}
                {facturas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                      No hay facturas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Resumen</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Facturas (ingresos): {resumen.total}</li>
            <li>Aprobadas: {resumen.aprobadas}</li>
            <li>Pendientes: {resumen.pendientes}</li>
            <li>Rechazadas: {resumen.rechazadas}</li>
            <li>Monto total: {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(resumen.montoTotal)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadFacturacionPage;



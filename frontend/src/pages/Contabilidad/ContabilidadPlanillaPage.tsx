import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface TrabajadorPlanilla {
  id: string;
  nombre_completo: string;
  dni: string | null;
  telefono: string | null;
  cargo: string | null;
  fecha_ingreso: string | null;
  is_activo: number | boolean;
  usuario: string | null;
  departamento_usuario: string | null;
}

const ContabilidadPlanillaPage: React.FC = () => {
  const [trabajadores, setTrabajadores] = useState<TrabajadorPlanilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanilla = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('erp_token');
        const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/planilla`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('No se pudo cargar la planilla');
        const data = await res.json();
        setTrabajadores(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar planilla');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanilla();
  }, []);

  const totalActivos = useMemo(
    () => trabajadores.filter(t => Boolean(t.is_activo)).length,
    [trabajadores]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Planilla</h1>
        <p className="text-sm text-gray-500">Listado general de trabajadores y estado.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total trabajadores</p>
          <p className="text-2xl font-bold text-gray-800">{trabajadores.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Inactivos</p>
          <p className="text-2xl font-bold text-red-600">{trabajadores.length - totalActivos}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Trabajadores</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando planilla...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : trabajadores.length === 0 ? (
          <p className="text-sm text-gray-500">No hay trabajadores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">DNI</th>
                  <th className="py-2 pr-4">Cargo</th>
                  <th className="py-2 pr-4">Departamento</th>
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Ingreso</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-800">{t.nombre_completo}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.dni || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.cargo || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.departamento_usuario || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.usuario || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.fecha_ingreso || '-'}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.is_activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.is_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContabilidadPlanillaPage;

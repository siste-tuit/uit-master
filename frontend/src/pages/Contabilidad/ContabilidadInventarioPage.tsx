import React, { useEffect, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface InventarioItem {
  id: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidad: string;
  status: string;
  departamento: string;
}

interface InventarioResponse {
  totalItems: number;
  itemsDisponibles: number;
  itemsBajoStock: number;
  itemsAgotados: number;
  resumenDepartamentos: {
    ingenieria?: { totalItems: number; stockTotal: number; porcentajeStock: number };
    mantenimiento?: { totalItems: number; stockTotal: number; porcentajeStock: number };
  };
  items: InventarioItem[];
}

const ContabilidadInventarioPage: React.FC = () => {
  const [data, setData] = useState<InventarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('erp_token');
        const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/inventario`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('No se pudo cargar inventario');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error al cargar inventario');
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <p className="text-sm text-gray-500">Resumen general por departamentos.</p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando inventario...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total items</p>
              <p className="text-2xl font-bold text-gray-800">{data.totalItems}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{data.itemsDisponibles}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Bajo stock</p>
              <p className="text-2xl font-bold text-yellow-600">{data.itemsBajoStock}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Agotados</p>
              <p className="text-2xl font-bold text-red-600">{data.itemsAgotados}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Ingeniería</h3>
              <p className="text-sm text-gray-500">Items: {data.resumenDepartamentos.ingenieria?.totalItems || 0}</p>
              <p className="text-sm text-gray-500">Stock: {data.resumenDepartamentos.ingenieria?.stockTotal || 0}</p>
              <p className="text-sm text-gray-500">% Stock: {data.resumenDepartamentos.ingenieria?.porcentajeStock || 0}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mantenimiento</h3>
              <p className="text-sm text-gray-500">Items: {data.resumenDepartamentos.mantenimiento?.totalItems || 0}</p>
              <p className="text-sm text-gray-500">Stock: {data.resumenDepartamentos.mantenimiento?.stockTotal || 0}</p>
              <p className="text-sm text-gray-500">% Stock: {data.resumenDepartamentos.mantenimiento?.porcentajeStock || 0}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Inventario</h2>
            {data.items.length === 0 ? (
              <p className="text-sm text-gray-500">No hay items registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-500 border-b">
                    <tr>
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4">Categoría</th>
                      <th className="py-2 pr-4">Departamento</th>
                      <th className="py-2 pr-4">Stock</th>
                      <th className="py-2 pr-4">Mín</th>
                      <th className="py-2 pr-4">Máx</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-gray-800">{item.nombre}</td>
                        <td className="py-2 pr-4 text-gray-600">{item.categoria}</td>
                        <td className="py-2 pr-4 text-gray-600">{item.departamento}</td>
                        <td className="py-2 pr-4 text-gray-600">{item.stockActual} {item.unidad}</td>
                        <td className="py-2 pr-4 text-gray-600">{item.stockMinimo}</td>
                        <td className="py-2 pr-4 text-gray-600">{item.stockMaximo}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'disponible'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'bajo_stock'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ContabilidadInventarioPage;

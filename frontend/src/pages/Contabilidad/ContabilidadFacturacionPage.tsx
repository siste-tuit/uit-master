import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ContabilidadFacturacionPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
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
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'F-1001', cliente: 'Cliente A', fecha: '2025-09-01', monto: 2500000, estado: 'pagada' },
                  { id: 'F-1002', cliente: 'Cliente B', fecha: '2025-09-05', monto: 3800000, estado: 'pendiente' },
                  { id: 'F-1003', cliente: 'Cliente C', fecha: '2025-09-08', monto: 1450000, estado: 'vencida' },
                ].map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-mono">{f.id}</td>
                    <td className="py-2 pr-4">{f.cliente}</td>
                    <td className="py-2 pr-4">{new Date(f.fecha).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 font-mono text-[10px] md:text-xs">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(f.monto)}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 text-xs rounded ${f.estado === 'pagada' ? 'bg-green-100 text-green-700' : f.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{f.estado}</span>
                    </td>
                    <td className="py-2 space-x-2">
                      <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Ver</button>
                      <button className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700">PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Resumen</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Facturas del mes: 24</li>
            <li>Pendientes: 5</li>
            <li>Vencidas: 2</li>
            <li>Promedio de cobro: 12 días</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadFacturacionPage;



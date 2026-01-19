import React from 'react';
import { financialRecords } from '../../data/mockData';

const GerenciaVentasPage: React.FC = () => {
  const ventas = financialRecords.filter(r => r.type === 'ingreso');
  const total = ventas.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💰 Ventas - Vista Gerencial</h1>
        <p className="text-gray-600">Rendimiento comercial y principales ingresos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ingresos recientes</p>
          <p className="text-2xl font-semibold text-emerald-700">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tickets</p>
          <p className="text-2xl font-semibold text-indigo-700">{ventas.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ticket promedio</p>
          <p className="text-2xl font-semibold text-blue-700">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Math.round(total / Math.max(1, ventas.length)))}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Ingresos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Monto</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4">{new Date(v.date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{v.category}</td>
                  <td className="py-2 pr-4">{v.description}</td>
                  <td className="py-2 pr-4 font-mono">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v.amount)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 text-xs rounded ${v.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GerenciaVentasPage;



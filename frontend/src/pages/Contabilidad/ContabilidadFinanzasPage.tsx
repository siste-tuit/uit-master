import React from 'react';
import { financialRecords } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const ContabilidadFinanzasPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const totalIngresos = financialRecords.filter(r => r.type === 'ingreso').reduce((s, r) => s + r.amount, 0);
  const totalEgresos = financialRecords.filter(r => r.type !== 'ingreso').reduce((s, r) => s + r.amount, 0);
  const utilidad = totalIngresos - totalEgresos;

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
              {financialRecords.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4 capitalize">{r.type}</td>
                  <td className="py-2 pr-4">{r.category}</td>
                  <td className="py-2 pr-4">{r.description}</td>
                  <td className="py-2 pr-4 font-mono">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(r.amount)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 text-xs rounded ${r.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
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

export default ContabilidadFinanzasPage;



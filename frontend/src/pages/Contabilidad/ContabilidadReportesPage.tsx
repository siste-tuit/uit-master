import React from 'react';
import { financialChartData } from '../../data/mockData';

const ContabilidadReportesPage: React.FC = () => {
  const meses = financialChartData.map(m => m.month).join(', ');
  const ingresos = financialChartData.map(m => m.ingresos).reduce((a, b) => a + b, 0);
  const egresos = financialChartData.map(m => m.egresos).reduce((a, b) => a + b, 0);
  const utilidad = financialChartData.map(m => m.utilidad).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Reportes Financieros</h1>
        <p className="text-gray-600">Indicadores y comparativas por periodo.</p>
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
        <h2 className="font-semibold text-gray-800 mb-2">Meses considerados</h2>
        <p className="text-sm text-gray-700">{meses}</p>
      </div>
    </div>
  );
};

export default ContabilidadReportesPage;



import React from 'react';
import { financialChartData, inventoryChartData, productionChartData } from '../../data/mockData';
// Nota: cuando integremos gráficos reales, importaremos los componentes de chartjs

const AdminReportsPage: React.FC = () => {
  const productionData = {
    labels: productionChartData.map((d) => d.date),
    datasets: [
      {
        label: 'Hilado',
        data: productionChartData.map((d) => d.hilado),
        borderColor: '#1A5632',
        backgroundColor: 'rgba(26, 86, 50, 0.15)',
        tension: 0.3,
      },
      {
        label: 'Tejido',
        data: productionChartData.map((d) => d.tejido),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3,
      },
    ],
  } as const;

  const financesData = {
    labels: financialChartData.map((d) => d.month),
    datasets: [
      {
        label: 'Ingresos',
        data: financialChartData.map((d) => d.ingresos),
        backgroundColor: '#10B981',
      },
      {
        label: 'Egresos',
        data: financialChartData.map((d) => d.egresos),
        backgroundColor: '#EF4444',
      },
    ],
  } as const;

  const inventoryData = {
    labels: inventoryChartData.map((d) => d.name),
    datasets: [
      {
        label: 'Distribución',
        data: inventoryChartData.map((d) => d.value),
        backgroundColor: inventoryChartData.map((d) => d.color),
      },
    ],
  } as const;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📈 Reportes y Análisis</h1>
        <p className="text-gray-600">KPIs y tendencias para la toma de decisiones.</p>
      </div>

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



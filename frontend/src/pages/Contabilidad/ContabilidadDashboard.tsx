import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardMetrics, financialChartData, financialRecords, inventoryItems } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';
// Componente de gráfico de barras simple
const SimpleBarChart: React.FC<{ data: any[], dataKey: string, color: string, title: string }> = ({ data, dataKey, color, title }) => {
  const maxValue = Math.max(...data.map(item => item[dataKey]));
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 truncate">{item.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className={`h-6 rounded-full ${color}`}
                style={{ width: `${(item[dataKey] / maxValue) * 100}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                {formatCurrency(item[dataKey])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContabilidadDashboard: React.FC = () => {
  const { user } = useAuth();
  const metrics = getDashboardMetrics('contabilidad');

  // Calcular totales financieros
  const totalIngresos = financialRecords
    .filter(record => record.type === 'ingreso' && record.status === 'aprobado')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalEgresos = financialRecords
    .filter(record => record.type === 'egreso' && record.status === 'aprobado')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalGastos = financialRecords
    .filter(record => record.type === 'gasto' && record.status === 'aprobado')
    .reduce((sum, record) => sum + record.amount, 0);

  const utilidadNeta = totalIngresos - totalEgresos - totalGastos;

  // Calcular valor del inventario
  const valorInventario = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="gradient-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Dashboard Contabilidad</h1>
            <p className="text-uit-green-100 text-lg">
              Gestión financiera y control de costos UIT
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-uit-green-100">Sistema Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-uit-green-100">Valor Inventario: {formatCurrency(valorInventario)}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-6xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="uit-card group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.title}</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-uit-green-100 transition-colors">
                <span className="text-xl">💰</span>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-xs md:text-sm font-bold text-gray-900">
                {formatCurrency(metric.value)}
              </span>
              <span className="text-sm font-medium text-gray-500">{metric.unit}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.percentage > 0 ? '+' : ''}{metric.percentage}%
                </span>
                <span className="text-xs text-gray-500">vs mes anterior</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-500' : 
                metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de rendimiento financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SimpleBarChart 
          data={financialChartData.map(item => ({ name: item.month, ingresos: item.ingresos }))}
          dataKey="ingresos"
          color="bg-green-500"
          title="Ingresos por Mes"
        />
        <SimpleBarChart 
          data={financialChartData.map(item => ({ name: item.month, egresos: item.egresos }))}
          dataKey="egresos"
          color="bg-red-500"
          title="Egresos por Mes"
        />
        <SimpleBarChart 
          data={financialChartData.map(item => ({ name: item.month, utilidad: item.utilidad }))}
          dataKey="utilidad"
          color="bg-blue-500"
          title="Utilidad por Mes"
        />
      </div>

      {/* Resumen financiero detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="uit-card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen Financiero</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-xs md:text-sm font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Egresos Totales</p>
                <p className="text-xs md:text-sm font-bold text-red-600">{formatCurrency(totalEgresos)}</p>
              </div>
              <span className="text-2xl">📉</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos Operativos</p>
                <p className="text-xs md:text-sm font-bold text-yellow-600">{formatCurrency(totalGastos)}</p>
              </div>
              <span className="text-2xl">💸</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-uit-green-50 rounded-lg border-2 border-uit-green-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilidad Neta</p>
                <p className="text-xs md:text-sm font-bold text-uit-green-600">{formatCurrency(utilidadNeta)}</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="uit-card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Estado del Inventario</h2>
          <div className="space-y-4">
            {inventoryItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.cost * item.currentStock)}</p>
                  <p className="text-sm text-gray-600">{item.currentStock} {item.unit}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Valor Total Inventario</span>
                <span className="font-bold text-uit-green-600">{formatCurrency(valorInventario)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registros financieros recientes */}
      <div className="uit-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Registros Financieros Recientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.type === 'ingreso' ? 'bg-green-100 text-green-800' :
                      record.type === 'egreso' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'aprobado' ? 'bg-green-100 text-green-800' :
                      record.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
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

export default ContabilidadDashboard;
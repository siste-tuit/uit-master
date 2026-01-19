import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardMetrics, productionChartData, inventoryChartData, financialChartData } from '../../data/mockData';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdministracionDashboard: React.FC = () => {
  const { user } = useAuth();
  const metrics = getDashboardMetrics('administrador');

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="gradient-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Dashboard Administrativo</h1>
            <p className="text-uit-green-100 text-lg">
              Vista completa del sistema ERP UIT - Unión Innova Textil
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-uit-green-100">Sistema Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-uit-green-100">70 Empleados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-uit-green-100">4 Líneas de Producción</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-6xl">🏭</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="uit-card group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.title}</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-uit-green-100 transition-colors">
                <span className="text-xl">📊</span>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {metric.unit === 'PEN' ? formatCurrency(metric.value) : formatNumber(metric.value)}
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

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Producción */}
        <div className="uit-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Producción por Línea</h2>
            <span className="text-sm text-gray-500">Últimos 7 días</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hilado" stroke="#1A5632" strokeWidth={2} name="Hilado" />
                <Line type="monotone" dataKey="tejido" stroke="#3B82F6" strokeWidth={2} name="Tejido" />
                <Line type="monotone" dataKey="tinturado" stroke="#10B981" strokeWidth={2} name="Tinturado" />
                <Line type="monotone" dataKey="acabado" stroke="#F59E0B" strokeWidth={2} name="Acabado" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Inventario */}
        <div className="uit-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Distribución de Inventario</h2>
            <span className="text-sm text-gray-500">Por categoría</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico Financiero */}
      <div className="uit-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Rendimiento Financiero</h2>
          <span className="text-sm text-gray-500">Últimos 6 meses</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
              <Bar dataKey="egresos" fill="#EF4444" name="Egresos" />
              <Bar dataKey="utilidad" fill="#1A5632" name="Utilidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen de Líneas de Producción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="uit-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Línea de Hilado</h3>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacidad:</span>
              <span className="text-sm font-medium">1000 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Producción:</span>
              <span className="text-sm font-medium">850 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Eficiencia:</span>
              <span className="text-sm font-medium text-green-600">85%</span>
            </div>
          </div>
        </div>

        <div className="uit-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Línea de Tejido</h3>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacidad:</span>
              <span className="text-sm font-medium">800 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Producción:</span>
              <span className="text-sm font-medium">720 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Eficiencia:</span>
              <span className="text-sm font-medium text-green-600">90%</span>
            </div>
          </div>
        </div>

        <div className="uit-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Línea de Tinturado</h3>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacidad:</span>
              <span className="text-sm font-medium">600 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Producción:</span>
              <span className="text-sm font-medium">540 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Eficiencia:</span>
              <span className="text-sm font-medium text-green-600">90%</span>
            </div>
          </div>
        </div>

        <div className="uit-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Línea de Acabado</h3>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacidad:</span>
              <span className="text-sm font-medium">500 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="text-sm font-medium text-yellow-600">Mantenimiento</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Eficiencia:</span>
              <span className="text-sm font-medium text-gray-400">N/A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministracionDashboard;

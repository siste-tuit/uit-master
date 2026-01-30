import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface MetricasFinancieras {
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
  cambioIngresos: number;
}

interface IngresosMensuales {
  ingresosMensuales: number;
  cambioPorcentaje: number;
  mesActual: number;
  añoActual: number;
}

interface InventarioResumen {
  ingenieria?: {
    totalItems: number;
    porcentajeStock: number;
    stockTotal: number;
    stockMaximoTotal: number;
  };
  mantenimiento?: {
    totalItems: number;
    porcentajeStock: number;
    stockTotal: number;
    stockMaximoTotal: number;
  };
}

interface RegistroFinanciero {
  id: string;
  tipo: 'ingreso' | 'egreso' | 'gasto';
  categoria: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
}

interface DashboardResponse {
  metricas: MetricasFinancieras;
  ingresosMensuales: IngresosMensuales;
  inventarioResumen: InventarioResumen;
  registrosRecientes: RegistroFinanciero[];
}
// Componente de gráfico de barras simple
const SimpleBarChart: React.FC<{ data: any[]; dataKey: string; color: string; title: string }> = ({ data, dataKey, color, title }) => {
  if (!data.length) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">Sin datos disponibles.</p>
      </div>
    );
  }

  const maxValue = Math.max(1, ...data.map(item => Number(item[dataKey] || 0)));

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
                style={{ width: `${(Number(item[dataKey] || 0) / maxValue) * 100}%` }}
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
  const [metricas, setMetricas] = useState<MetricasFinancieras>({
    ingresos: 0,
    egresos: 0,
    gastos: 0,
    utilidad: 0,
    cambioIngresos: 0
  });
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresosMensuales | null>(null);
  const [resumenInventario, setResumenInventario] = useState<InventarioResumen | null>(null);
  const [registros, setRegistros] = useState<RegistroFinanciero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('erp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/dashboard`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status} en dashboard contabilidad`);
        const data: DashboardResponse = await res.json();

        if (!isMounted) return;
        setMetricas(data.metricas);
        setIngresosMensuales(data.ingresosMensuales);
        setResumenInventario(data.inventarioResumen);
        setRegistros(data.registrosRecientes || []);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error al cargar datos');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!ingresosMensuales) return [];
    const monthLabel = new Date(ingresosMensuales.añoActual, ingresosMensuales.mesActual - 1, 1).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    });
    return [
      {
        name: monthLabel,
        ingresos: ingresosMensuales.ingresosMensuales,
        egresos: metricas.egresos,
        utilidad: metricas.utilidad
      }
    ];
  }, [ingresosMensuales, metricas.egresos, metricas.utilidad]);

  const totalIngresos = metricas.ingresos || 0;
  const totalEgresos = metricas.egresos || 0;
  const totalGastos = metricas.gastos || 0;
  const utilidadNeta = metricas.utilidad || 0;

  const stockInventarioTotal =
    (resumenInventario?.ingenieria?.stockTotal || 0) +
    (resumenInventario?.mantenimiento?.stockTotal || 0);

  const metrics = [
    {
      id: 'ingresos',
      title: 'Ingresos',
      value: totalIngresos,
      unit: '',
      trend: metricas.cambioIngresos > 0 ? 'up' : metricas.cambioIngresos < 0 ? 'down' : 'stable',
      percentage: Math.abs(metricas.cambioIngresos || 0)
    },
    {
      id: 'egresos',
      title: 'Egresos',
      value: totalEgresos,
      unit: '',
      trend: 'stable',
      percentage: 0
    },
    {
      id: 'gastos',
      title: 'Gastos',
      value: totalGastos,
      unit: '',
      trend: 'stable',
      percentage: 0
    },
    {
      id: 'utilidad',
      title: 'Utilidad',
      value: utilidadNeta,
      unit: '',
      trend: 'stable',
      percentage: 0
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos de Contabilidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium">❌ Error al cargar datos</p>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="gradient-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-white">Dashboard Contabilidad</h1>
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
                <span className="text-sm text-uit-green-100">Stock total: {stockInventarioTotal.toLocaleString()}</span>
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
          data={chartData.map(item => ({ name: item.name, ingresos: item.ingresos }))}
          dataKey="ingresos"
          color="bg-green-500"
          title="Ingresos del Mes"
        />
        <SimpleBarChart
          data={chartData.map(item => ({ name: item.name, egresos: item.egresos }))}
          dataKey="egresos"
          color="bg-red-500"
          title="Egresos del Mes"
        />
        <SimpleBarChart
          data={chartData.map(item => ({ name: item.name, utilidad: item.utilidad }))}
          dataKey="utilidad"
          color="bg-blue-500"
          title="Utilidad del Mes"
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
            {[
              {
                id: 'ingenieria',
                nombre: 'Ingeniería',
                stockTotal: resumenInventario?.ingenieria?.stockTotal || 0,
                porcentaje: resumenInventario?.ingenieria?.porcentajeStock || 0
              },
              {
                id: 'mantenimiento',
                nombre: 'Mantenimiento',
                stockTotal: resumenInventario?.mantenimiento?.stockTotal || 0,
                porcentaje: resumenInventario?.mantenimiento?.porcentajeStock || 0
              }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.nombre}</p>
                  <p className="text-sm text-gray-600">Stock total</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.stockTotal.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{item.porcentaje}%</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Stock total inventario</span>
                <span className="font-bold text-uit-green-600">{stockInventarioTotal.toLocaleString()}</span>
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
              {registros.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.tipo === 'ingreso' ? 'bg-green-100 text-green-800' :
                      record.tipo === 'egreso' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.tipo.charAt(0).toUpperCase() + record.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.categoria}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.descripcion || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(record.monto)}
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
              {registros.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    No hay registros financieros recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadDashboard;
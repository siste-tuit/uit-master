import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface MetricasProduccion {
  produccionDiaria: number;
  eficienciaGeneral: number;
  calidad: number;
  cambioProduccion: number;
  cambioEficiencia: number;
  cambioCalidad: number;
}

interface MetricasFinancieras {
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
}

interface InventarioResumen {
  ingenieria?: { stockTotal: number };
  mantenimiento?: { stockTotal: number };
}

const AdministracionDashboard: React.FC = () => {
  const [metricasProduccion, setMetricasProduccion] = useState<MetricasProduccion>({
    produccionDiaria: 0,
    eficienciaGeneral: 0,
    calidad: 0,
    cambioProduccion: 0,
    cambioEficiencia: 0,
    cambioCalidad: 0
  });
  const [metricasFinancieras, setMetricasFinancieras] = useState<MetricasFinancieras>({
    ingresos: 0,
    egresos: 0,
    gastos: 0,
    utilidad: 0
  });
  const [produccionPeriodo, setProduccionPeriodo] = useState<any[]>([]);
  const [inventarioResumen, setInventarioResumen] = useState<InventarioResumen>({});
  const [registrosFinancieros, setRegistrosFinancieros] = useState<any[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalLineas, setTotalLineas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('erp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchJson = async (url: string) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
      return res.json();
    };

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchJson(`${API_BASE_URL_CORE}/produccion/metricas`),
          fetchJson(`${API_BASE_URL_CORE}/produccion/periodo?periodo=diaria`),
          fetchJson(`${API_BASE_URL_CORE}/inventario/resumen-departamentos`),
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/metricas`),
          fetchJson(`${API_BASE_URL_CORE}/contabilidad/registros?limit=200`),
          fetchJson(`${API_BASE_URL_CORE}/users`),
          fetchJson(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`)
        ]);

        if (!isMounted) return;

        if (results[0].status === 'fulfilled') setMetricasProduccion(results[0].value);
        if (results[1].status === 'fulfilled') setProduccionPeriodo(results[1].value?.datos || []);
        if (results[2].status === 'fulfilled') setInventarioResumen(results[2].value || {});
        if (results[3].status === 'fulfilled') setMetricasFinancieras(results[3].value);
        if (results[4].status === 'fulfilled') setRegistrosFinancieros(results[4].value || []);
        if (results[5].status === 'fulfilled') setTotalUsuarios((results[5].value || []).length);
        if (results[6].status === 'fulfilled') setTotalLineas((results[6].value?.lineas || []).length);
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

  const metrics = useMemo(
    () => [
      {
        id: 'prod',
        title: 'Producción diaria',
        value: metricasProduccion.produccionDiaria || 0,
        unit: 'unidades',
        trend: metricasProduccion.cambioProduccion > 0 ? 'up' : metricasProduccion.cambioProduccion < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioProduccion || 0)
      },
      {
        id: 'eficiencia',
        title: 'Eficiencia',
        value: metricasProduccion.eficienciaGeneral || 0,
        unit: '%',
        trend: metricasProduccion.cambioEficiencia > 0 ? 'up' : metricasProduccion.cambioEficiencia < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioEficiencia || 0)
      },
      {
        id: 'calidad',
        title: 'Calidad',
        value: metricasProduccion.calidad || 0,
        unit: '%',
        trend: metricasProduccion.cambioCalidad > 0 ? 'up' : metricasProduccion.cambioCalidad < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioCalidad || 0)
      },
      {
        id: 'ingresos',
        title: 'Ingresos',
        value: metricasFinancieras.ingresos || 0,
        unit: 'PEN',
        trend: 'stable',
        percentage: 0
      },
      {
        id: 'utilidad',
        title: 'Utilidad',
        value: metricasFinancieras.utilidad || 0,
        unit: 'PEN',
        trend: 'stable',
        percentage: 0
      }
    ],
    [metricasFinancieras, metricasProduccion]
  );

  const inventarioChart = useMemo(
    () => [
      { name: 'Ingeniería', value: Number(inventarioResumen?.ingenieria?.stockTotal || 0), color: '#1A5632' },
      { name: 'Mantenimiento', value: Number(inventarioResumen?.mantenimiento?.stockTotal || 0), color: '#3B82F6' }
    ],
    [inventarioResumen]
  );

  const financialChartData = useMemo(() => {
    const buckets: Record<string, { ingresos: number; egresos: number; utilidad: number }> = {};
    registrosFinancieros.forEach((registro: any) => {
      const fecha = registro.fecha || registro.date;
      if (!fecha) return;
      const monthKey = new Date(fecha).toISOString().slice(0, 7);
      if (!buckets[monthKey]) {
        buckets[monthKey] = { ingresos: 0, egresos: 0, utilidad: 0 };
      }
      if (registro.tipo === 'ingreso') buckets[monthKey].ingresos += Number(registro.monto || 0);
      if (registro.tipo === 'egreso' || registro.tipo === 'gasto') buckets[monthKey].egresos += Number(registro.monto || 0);
      buckets[monthKey].utilidad = buckets[monthKey].ingresos - buckets[monthKey].egresos;
    });
    return Object.keys(buckets)
      .sort()
      .slice(-6)
      .map((key) => ({
        month: key,
        ingresos: buckets[key].ingresos,
        egresos: buckets[key].egresos,
        utilidad: buckets[key].utilidad
      }));
  }, [registrosFinancieros]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos administrativos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
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
              <span className="text-sm text-uit-green-100">{totalUsuarios} usuarios</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-uit-green-100">{totalLineas} líneas de producción</span>
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
            <h2 className="text-xl font-semibold text-gray-900">Producción General</h2>
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={produccionPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="production" stroke="#1A5632" strokeWidth={2} name="Producción" />
                <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} name="Eficiencia" />
                <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} name="Calidad" />
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
                  data={inventarioChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventarioChart.map((entry, index) => (
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

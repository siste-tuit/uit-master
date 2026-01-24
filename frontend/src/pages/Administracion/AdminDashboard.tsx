import React, { useMemo, useState, useEffect } from 'react';
import { MetricCard } from '../../components/Cards';
import { ProductionChart, EfficiencyChart } from '../../components/Charts';
import API_BASE_URL_CORE from '../../config/api';

const AdminDashboard: React.FC = () => {
  const [metricasProduccion, setMetricasProduccion] = useState({
    produccionDiaria: 0,
    eficienciaGeneral: 0,
    calidad: 0,
    cambioProduccion: 0,
    cambioEficiencia: 0,
    cambioCalidad: 0
  });
  const [metricasFinancieras, setMetricasFinancieras] = useState({
    ingresosMensuales: 0,
    cambioPorcentaje: 0
  });
  const [datosProduccionMensual, setDatosProduccionMensual] = useState<any[]>([]);
  const [periodoGrafico, setPeriodoGrafico] = useState<'diaria' | 'semanal' | 'mensual'>('mensual');
  const [inventarioDepartamentos, setInventarioDepartamentos] = useState({
    ingenieria: { totalItems: 0, porcentajeStock: 0, stockTotal: 0, stockMaximoTotal: 0 },
    mantenimiento: { totalItems: 0, porcentajeStock: 0, stockTotal: 0, stockMaximoTotal: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener métricas de producción desde el backend
  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        // Obtener métricas de producción
        setError(null);
        const token = localStorage.getItem('erp_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const prodResponse = await fetch(`${API_BASE_URL_CORE}/produccion/metricas`, { headers });
        if (prodResponse.ok) {
          const prodData = await prodResponse.json();
          setMetricasProduccion(prodData);
        } else {
          console.error('Error al obtener métricas de producción');
        }

        // Obtener métricas financieras (ingresos mensuales)
        const finResponse = await fetch(`${API_BASE_URL_CORE}/contabilidad/ingresos-mensuales`, { headers });
        if (finResponse.ok) {
          const finData = await finResponse.json();
          setMetricasFinancieras(finData);
        } else {
          console.error('Error al obtener ingresos mensuales');
        }

        // Obtener datos de producción por período para gráficos
        const prodPeriodoResponse = await fetch(`${API_BASE_URL_CORE}/produccion/periodo?periodo=${periodoGrafico}`, { headers });
        if (prodPeriodoResponse.ok) {
          const prodPeriodoData = await prodPeriodoResponse.json();
          setDatosProduccionMensual(prodPeriodoData.datos || []);
        } else {
          console.error('Error al obtener producción por período');
        }

        // Obtener resumen de inventario por departamentos
        const inventarioResponse = await fetch(`${API_BASE_URL_CORE}/inventario/resumen-departamentos`, { headers });
        if (inventarioResponse.ok) {
          const inventarioData = await inventarioResponse.json();
          setInventarioDepartamentos(inventarioData);
        } else {
          console.error('Error al obtener inventario por departamentos');
        }
      } catch (error: any) {
        console.error('Error al conectar con el backend:', error);
        setError(error.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchMetricas, 30000);
    return () => clearInterval(interval);
  }, [periodoGrafico]);

  const productionMetrics = useMemo(
    () => [
      {
        id: 'produccion-diaria',
        title: 'Producción diaria',
        value: metricasProduccion.produccionDiaria || 0,
        unit: 'unidades',
        trend: metricasProduccion.cambioProduccion > 0 ? 'up' : metricasProduccion.cambioProduccion < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioProduccion || 0),
        color: 'text-green-600'
      },
      {
        id: 'eficiencia',
        title: 'Eficiencia general',
        value: metricasProduccion.eficienciaGeneral || 0,
        unit: '%',
        trend: metricasProduccion.cambioEficiencia > 0 ? 'up' : metricasProduccion.cambioEficiencia < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioEficiencia || 0),
        color: 'text-blue-600'
      },
      {
        id: 'calidad',
        title: 'Calidad',
        value: metricasProduccion.calidad || 0,
        unit: '%',
        trend: metricasProduccion.cambioCalidad > 0 ? 'up' : metricasProduccion.cambioCalidad < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasProduccion.cambioCalidad || 0),
        color: 'text-indigo-600'
      },
      {
        id: 'ingresos',
        title: 'Ingresos mensuales',
        value: metricasFinancieras.ingresosMensuales || 0,
        unit: 'PEN',
        trend: metricasFinancieras.cambioPorcentaje > 0 ? 'up' : metricasFinancieras.cambioPorcentaje < 0 ? 'down' : 'stable',
        percentage: Math.abs(metricasFinancieras.cambioPorcentaje || 0),
        color: 'text-emerald-600'
      }
    ],
    [metricasFinancieras, metricasProduccion]
  );

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
      <div className="gradient-header rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Contenido principal */}
            <div className="flex-1 space-y-4">
              {/* Título principal */}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-md">
                  Dashboard Administrativo
                </h1>
                <p className="text-green-100 text-sm lg:text-base font-medium">
              Vista completa del sistema ERP para la planta textil
            </p>
              </div>
              
              {/* Indicadores de estado */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-sm font-medium text-white">Sistema Activo</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                  <span className="text-sm font-medium text-white">70 Empleados</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
                  <span className="text-sm font-medium text-white">4 Líneas de Producción</span>
                </div>
              </div>
            </div>
            
            {/* Icono decorativo */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0">
              <div className="w-28 h-28 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                <span className="text-5xl">📊</span>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productionMetrics.map((metric) => (
          <MetricCard 
            key={metric.id} 
            metric={{
              id: metric.id,
              title: metric.title,
              value: metric.value,
              unit: metric.unit,
              trend: metric.trend as "up" | "down" | "stable",
              percentage: metric.percentage,
              color: metric.color
            }} 
          />
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="space-y-4">
        {/* Selector de período */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm font-medium text-gray-600">Vista:</span>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriodoGrafico('diaria')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoGrafico === 'diaria'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Diaria
            </button>
            <button
              onClick={() => setPeriodoGrafico('semanal')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoGrafico === 'semanal'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriodoGrafico('mensual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoGrafico === 'mensual'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart data={datosProduccionMensual} periodo={periodoGrafico} />
          <EfficiencyChart data={datosProduccionMensual} periodo={periodoGrafico} />
        </div>
      </div>

      {/* Inventario por Departamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventario Ingeniería */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">⚙️ Inventario - Ingeniería</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todo →
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Ítems</p>
                  <p className="text-3xl font-bold text-gray-900">{inventarioDepartamentos.ingenieria.totalItems}</p>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📦</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Nivel de Stock</span>
                  <span className="text-lg font-bold text-blue-600">{inventarioDepartamentos.ingenieria.porcentajeStock}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      inventarioDepartamentos.ingenieria.porcentajeStock >= 75 ? 'bg-green-500' :
                      inventarioDepartamentos.ingenieria.porcentajeStock >= 50 ? 'bg-yellow-500' :
                      inventarioDepartamentos.ingenieria.porcentajeStock >= 25 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${inventarioDepartamentos.ingenieria.porcentajeStock}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Stock actual: {inventarioDepartamentos.ingenieria.stockTotal.toLocaleString()} / 
                  {inventarioDepartamentos.ingenieria.stockMaximoTotal.toLocaleString()} unidades
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventario Mantenimiento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">🔧 Inventario - Mantenimiento</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todo →
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Ítems</p>
                  <p className="text-3xl font-bold text-gray-900">{inventarioDepartamentos.mantenimiento.totalItems}</p>
                </div>
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔩</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Nivel de Stock</span>
                  <span className="text-lg font-bold text-orange-600">{inventarioDepartamentos.mantenimiento.porcentajeStock}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      inventarioDepartamentos.mantenimiento.porcentajeStock >= 75 ? 'bg-green-500' :
                      inventarioDepartamentos.mantenimiento.porcentajeStock >= 50 ? 'bg-yellow-500' :
                      inventarioDepartamentos.mantenimiento.porcentajeStock >= 25 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${inventarioDepartamentos.mantenimiento.porcentajeStock}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Stock actual: {inventarioDepartamentos.mantenimiento.stockTotal.toLocaleString()} / 
                  {inventarioDepartamentos.mantenimiento.stockMaximoTotal.toLocaleString()} unidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

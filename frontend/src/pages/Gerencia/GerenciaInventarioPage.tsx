import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_BASE_URL_CORE from '../../config/api';

interface EstadisticasInventario {
  totales: {
    totalItems: number;
    itemsDisponibles: number;
    itemsBajoStock: number;
    itemsAgotados: number;
    stockTotal: number;
    stockMinimo: number;
    stockMaximo: number;
    porcentajeStock: number;
    costoTotal: number;
  };
  porDepartamento: {
    ingenieria: {
      totalItems: number;
      itemsDisponibles: number;
      itemsBajoStock: number;
      itemsAgotados: number;
      stockTotal: number;
      stockMinimo: number;
      stockMaximo: number;
      porcentajeStock: number;
      costoTotal: number;
    };
    mantenimiento: {
      totalItems: number;
      itemsDisponibles: number;
      itemsBajoStock: number;
      itemsAgotados: number;
      stockTotal: number;
      stockMinimo: number;
      stockMaximo: number;
      porcentajeStock: number;
      costoTotal: number;
    };
  };
  distribucionCategorias: Array<{
    nombre: string;
    totalItems: number;
    stockTotal: number;
    itemsDisponibles: number;
    itemsBajoStock: number;
    itemsAgotados: number;
  }>;
  itemsRiesgo: Array<{
    id: string;
    nombre: string;
    departamento: string;
    categoria: string;
    stockActual: number;
    stockMinimo: number;
    stockMaximo: number;
    porcentajeStock: number;
    status: string;
    unidad: string;
  }>;
  distribucionEstado: Array<{
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

const COLORS = {
  disponible: '#10B981',
  bajoStock: '#F59E0B',
  agotado: '#EF4444',
  ingenieria: '#3B82F6',
  mantenimiento: '#8B5CF6'
};

const GerenciaInventarioPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EstadisticasInventario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(`${API_BASE_URL_CORE}/inventario/estadisticas-gerencia`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📊 Estadísticas de inventario recibidas para Gerencia:', result);
        setData(result);
      } catch (err: any) {
        console.error('Error al cargar estadísticas de inventario:', err);
        const errorMessage = err.message || 'No se pudieron cargar las estadísticas de inventario';
        console.error('Detalles del error:', {
          message: errorMessage,
          stack: err.stack,
          name: err.name
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'disponible') return COLORS.disponible;
    if (status === 'bajo_stock') return COLORS.bajoStock;
    return COLORS.agotado;
  };

  const getPorcentajeColor = (porcentaje: number) => {
    if (porcentaje >= 75) return 'text-green-600';
    if (porcentaje >= 50) return 'text-blue-600';
    if (porcentaje >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas de inventario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">⚠️ No hay datos de inventario disponibles</p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const datosPorDepartamento = [
    {
      nombre: 'Ingeniería',
      totalItems: data.porDepartamento.ingenieria.totalItems,
      stockTotal: data.porDepartamento.ingenieria.stockTotal,
      itemsDisponibles: data.porDepartamento.ingenieria.itemsDisponibles,
      itemsBajoStock: data.porDepartamento.ingenieria.itemsBajoStock,
      itemsAgotados: data.porDepartamento.ingenieria.itemsAgotados,
      porcentajeStock: data.porDepartamento.ingenieria.porcentajeStock,
      costoTotal: data.porDepartamento.ingenieria.costoTotal
    },
    {
      nombre: 'Mantenimiento',
      totalItems: data.porDepartamento.mantenimiento.totalItems,
      stockTotal: data.porDepartamento.mantenimiento.stockTotal,
      itemsDisponibles: data.porDepartamento.mantenimiento.itemsDisponibles,
      itemsBajoStock: data.porDepartamento.mantenimiento.itemsBajoStock,
      itemsAgotados: data.porDepartamento.mantenimiento.itemsAgotados,
      porcentajeStock: data.porDepartamento.mantenimiento.porcentajeStock,
      costoTotal: data.porDepartamento.mantenimiento.costoTotal
    }
  ];

  const datosEstado = data.distribucionEstado.map(estado => ({
    name: estado.nombre,
    value: estado.cantidad,
    porcentaje: estado.porcentaje
  }));

  const datosCategorias = data.distribucionCategorias.map(cat => ({
    name: cat.nombre,
    totalItems: cat.totalItems,
    stockTotal: cat.stockTotal
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Inventario - Vista Gerencial</h1>
        <p className="text-gray-600">
          Visión consolidada del inventario de Ingeniería y Mantenimiento. Datos proporcionados por ambos departamentos.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total de Ítems</p>
          <p className="text-3xl font-bold text-indigo-700">{data.totales.totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">Ing: {data.porDepartamento.ingenieria.totalItems} | Mant: {data.porDepartamento.mantenimiento.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Disponibles</p>
          <p className="text-3xl font-bold text-green-700">{data.totales.itemsDisponibles}</p>
          <p className="text-xs text-gray-500 mt-1">{data.totales.totalItems > 0 ? Math.round((data.totales.itemsDisponibles / data.totales.totalItems) * 100) : 0}% del total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Bajo Stock</p>
          <p className="text-3xl font-bold text-amber-700">{data.totales.itemsBajoStock}</p>
          <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Agotados</p>
          <p className="text-3xl font-bold text-red-700">{data.totales.itemsAgotados}</p>
          <p className="text-xs text-gray-500 mt-1">Urgente reposición</p>
        </div>
      </div>

      {/* Métricas de Stock y Costo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Stock Total</p>
          <p className="text-2xl font-bold text-blue-700">{data.totales.stockTotal.toLocaleString('es-PE')}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Nivel de Stock</span>
              <span className={getPorcentajeColor(data.totales.porcentajeStock)}>{data.totales.porcentajeStock}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  data.totales.porcentajeStock >= 75 ? 'bg-green-500' :
                  data.totales.porcentajeStock >= 50 ? 'bg-blue-500' :
                  data.totales.porcentajeStock >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, data.totales.porcentajeStock)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Valor Total del Inventario</p>
          <p className="text-2xl font-bold text-purple-700">S/ {data.totales.costoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-1">Ing: S/ {data.porDepartamento.ingenieria.costoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500">Mant: S/ {data.porDepartamento.mantenimiento.costoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Stock Mínimo vs Máximo</p>
          <p className="text-lg font-semibold text-gray-700">Mín: {data.totales.stockMinimo.toLocaleString('es-PE')}</p>
          <p className="text-lg font-semibold text-gray-700">Máx: {data.totales.stockMaximo.toLocaleString('es-PE')}</p>
        </div>
      </div>

      {/* Gráfico: Comparativa por Departamento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Comparativa por Departamento</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={datosPorDepartamento}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'porcentajeStock') return `${value}%`;
                return value.toLocaleString('es-PE');
              }}
            />
            <Legend />
            <Bar dataKey="totalItems" fill={COLORS.ingenieria} name="Total Ítems" />
            <Bar dataKey="itemsDisponibles" fill={COLORS.disponible} name="Disponibles" />
            <Bar dataKey="itemsBajoStock" fill={COLORS.bajoStock} name="Bajo Stock" />
            <Bar dataKey="itemsAgotados" fill={COLORS.agotado} name="Agotados" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos lado a lado: Estado y Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Distribución por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosEstado}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {datosEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'Disponible' ? COLORS.disponible :
                    entry.name === 'Bajo Stock' ? COLORS.bajoStock : COLORS.agotado
                  } />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Categoría */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Stock por Categoría</h2>
          {datosCategorias.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosCategorias} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => value.toLocaleString('es-PE')} />
                <Legend />
                <Bar dataKey="stockTotal" fill={COLORS.ingenieria} name="Stock Total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de categorías disponibles
            </div>
          )}
        </div>
      </div>

      {/* Stock por Departamento (gráfico de barras) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Stock Total por Departamento</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosPorDepartamento}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString('es-PE')} />
            <Legend />
            <Bar dataKey="stockTotal" fill={COLORS.ingenieria} name="Stock Total" />
            <Bar dataKey="porcentajeStock" fill={COLORS.mantenimiento} name="% Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ítems en Riesgo */}
      {data.itemsRiesgo.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚠️ Top 10 Ítems con Mayor Riesgo (Menor Stock)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Ítem</th>
                  <th className="py-2 pr-4">Departamento</th>
                  <th className="py-2 pr-4">Categoría</th>
                  <th className="py-2 pr-4">Stock Actual</th>
                  <th className="py-2 pr-4">Stock Mínimo</th>
                  <th className="py-2 pr-4">Stock Máximo</th>
                  <th className="py-2 pr-4">% Stock</th>
                  <th className="py-2 pr-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.itemsRiesgo.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">{item.nombre}</td>
                    <td className="py-2 pr-4 capitalize">{item.departamento}</td>
                    <td className="py-2 pr-4 capitalize">{item.categoria}</td>
                    <td className="py-2 pr-4 font-mono">{item.stockActual.toLocaleString('es-PE')} {item.unidad}</td>
                    <td className="py-2 pr-4 font-mono">{item.stockMinimo.toLocaleString('es-PE')} {item.unidad}</td>
                    <td className="py-2 pr-4 font-mono">{item.stockMaximo.toLocaleString('es-PE')} {item.unidad}</td>
                    <td className="py-2 pr-4">
                      <span className={getPorcentajeColor(item.porcentajeStock)}>
                        {item.porcentajeStock}%
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span 
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: getStatusColor(item.status) + '20',
                          color: getStatusColor(item.status)
                        }}
                      >
                        {item.status === 'disponible' ? 'Disponible' :
                         item.status === 'bajo_stock' ? 'Bajo Stock' : 'Agotado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciaInventarioPage;

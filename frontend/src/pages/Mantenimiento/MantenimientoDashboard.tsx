import React from 'react';
import { getDashboardMetrics } from '../../data/mockData';

const MantenimientoDashboard: React.FC = () => {
  const metrics = getDashboardMetrics('mantenimiento');

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🔧 Dashboard de Mantenimiento
        </h1>
        <p className="text-gray-600">
          Gestión de equipos y mantenimiento de maquinaria textil
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                <span className="text-xl">{metric.icon}</span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">{metric.name}</p>
                <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-green-600">{metric.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado de Equipos */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            🏭 Estado de Equipos por Línea
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="font-medium">Línea de Hilado</span>
              <span className="px-2 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                Operativa
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <span className="font-medium">Línea de Tejido</span>
              <span className="px-2 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
                Mantenimiento
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="font-medium">Línea de Tintorería</span>
              <span className="px-2 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                Operativa
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <span className="font-medium">Línea de Acabado</span>
              <span className="px-2 py-1 text-sm text-red-800 bg-red-100 rounded-full">
                Avería
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            📋 Órdenes de Trabajo Activas
          </h3>
          <div className="space-y-3">
            <div className="pl-4 border-l-4 border-red-500">
              <p className="font-medium text-gray-900">Revisión Motor Principal</p>
              <p className="text-sm text-gray-600">Prioridad: Alta - Tiempo estimado: 4h</p>
            </div>
            <div className="pl-4 border-l-4 border-yellow-500">
              <p className="font-medium text-gray-900">Lubricación Rodamientos</p>
              <p className="text-sm text-gray-600">Prioridad: Media - Tiempo estimado: 2h</p>
            </div>
            <div className="pl-4 border-l-4 border-green-500">
              <p className="font-medium text-gray-900">Calibración Sensores</p>
              <p className="text-sm text-gray-600">Prioridad: Baja - Tiempo estimado: 1h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventario de Repuestos */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          🔩 Inventario de Repuestos Críticos
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Rodamientos</span>
              <span className="text-sm text-red-600">Stock Bajo</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-red-500 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <p className="mt-1 text-sm text-gray-600">5 unidades restantes</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Correas</span>
              <span className="text-sm text-green-600">Stock Normal</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="mt-1 text-sm text-gray-600">45 unidades disponibles</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Filtros</span>
              <span className="text-sm text-yellow-600">Stock Medio</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <p className="mt-1 text-sm text-gray-600">20 unidades disponibles</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-4">
        <button className="p-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
          <div className="mb-2 text-2xl">➕</div>
          <div className="font-medium">Nueva Orden</div>
        </button>
        <button className="p-4 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">
          <div className="mb-2 text-2xl">📋</div>
          <div className="font-medium">Ver Equipos</div>
        </button>
        <button className="p-4 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700">
          <div className="mb-2 text-2xl">📦</div>
          <div className="font-medium">Inventario</div>
        </button>
        <button className="p-4 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700">
          <div className="mb-2 text-2xl">📅</div>
          <div className="font-medium">Calendario</div>
        </button>
      </div>
    </div>
  );
};

export default MantenimientoDashboard;

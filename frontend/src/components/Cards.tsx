import React from 'react';
import { DashboardMetric } from '../types';

// Componente para tarjetas de métricas
interface MetricCardProps {
  metric: DashboardMetric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="metric-card group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.title}</h3>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
          <span className="text-xl">{getTrendIcon()}</span>
        </div>
      </div>
      
      <div className="flex items-baseline space-x-3 mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {metric.unit === 'PEN' 
            ? metric.value.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 0 })
            : metric.value.toLocaleString()}
        </span>
        {metric.unit !== 'PEN' && (
          <span className="text-sm font-medium text-gray-500">{metric.unit}</span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`metric-trend ${getTrendColor()}`}>
            {metric.percentage > 0 ? '+' : ''}{metric.percentage}%
          </span>
          <span className="text-xs text-gray-500">vs mes anterior</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${getTrendColor().replace('text-', 'bg-')}`}></div>
      </div>
    </div>
  );
};

// Componente para tarjetas de inventario
interface InventoryCardProps {
  item: {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    status: 'ok' | 'low' | 'out';
  };
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  const getStatusColor = () => {
    switch (item.status) {
      case 'ok':
        return 'text-green-600 bg-green-100';
      case 'low':
        return 'text-yellow-600 bg-yellow-100';
      case 'out':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'ok':
        return 'Stock OK';
      case 'low':
        return 'Stock Bajo';
      case 'out':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }
  };

  const stockPercentage = (item.currentStock / item.maxStock) * 100;

  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 truncate mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500 font-medium">{item.category}</p>
        </div>
        <span className={`status-badge ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Stock actual</span>
          <span className="text-base font-bold text-gray-900">{item.currentStock} {item.unit}</span>
        </div>
        
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                item.status === 'ok' ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                item.status === 'low' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Mín: {item.minStock}</span>
            <span className="text-gray-400">•</span>
            <span>Máx: {item.maxStock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para tarjetas de empleados
interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
    status: string;
    salary: number;
  };
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{employee.name}</h3>
          <p className="text-sm text-gray-500 truncate">{employee.position}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          employee.status === 'activo' 
            ? 'text-green-600 bg-green-100' 
            : 'text-gray-600 bg-gray-100'
        }`}>
          {employee.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Departamento:</span>
          <span className="font-medium">{employee.department}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Salario:</span>
          <span className="font-medium text-xs">{employee.salary.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</span>
        </div>
      </div>
    </div>
  );
};

// Componente para tarjetas de finanzas
interface FinancialCardProps {
  title: string;
  amount: number;
  currency?: string;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  icon?: string;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({ 
  title, 
  amount, 
  currency = '$', 
  trend = 'stable', 
  percentage = 0,
  icon = '💰'
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">
          {amount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
        </span>
      </div>
      
      {percentage !== 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()} {percentage > 0 ? '+' : ''}{percentage}%
          </span>
          <span className="text-xs text-gray-500">vs mes anterior</span>
        </div>
      )}
    </div>
  );
};

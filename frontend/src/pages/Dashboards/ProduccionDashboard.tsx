import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardMetrics, productionLines, productionRecords } from '../../data/mockData';
import { formatNumber, formatDateTime } from '../../utils/helpers';

const ProduccionDashboard: React.FC = () => {
  const { user } = useAuth();
  const metrics = getDashboardMetrics('usuarios');
  const [productionForm, setProductionForm] = useState({
    product: '',
    quantity: '',
    line: '',
    quality: 'buena',
    notes: ''
  });

  // Obtener líneas asignadas al usuario
  const assignedLines = productionLines.filter(line => 
    line.assignedUsers.includes(user?.id || '')
  );

  // Obtener registros del usuario
  const userRecords = productionRecords.filter(record => 
    record.userId === user?.id
  );

  const handleProductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular envío de datos
    alert('Producción registrada exitosamente');
    setProductionForm({ product: '', quantity: '', line: '', quality: 'buena', notes: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excelente':
        return 'text-green-600';
      case 'buena':
        return 'text-blue-600';
      case 'regular':
        return 'text-yellow-600';
      case 'mala':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="gradient-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Dashboard de Producción</h1>
            <p className="text-uit-green-100 text-lg">
              Registra tu producción diaria y supervisa tu progreso
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-uit-green-100">Líneas Activas: {assignedLines.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-uit-green-100">Órdenes Completadas: {userRecords.length}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-6xl">👷</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {formatNumber(metric.value)}
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
                <span className="text-xs text-gray-500">vs semana anterior</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-500' : 
                metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario de registro de producción */}
      <div className="uit-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Registrar Nueva Producción</h2>
        <form onSubmit={handleProductionSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto
              </label>
              <select
                name="product"
                value={productionForm.product}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uit-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar producto</option>
                <option value="hilo-algodon-40-1">Hilo de Algodón 40/1</option>
                <option value="tela-algodon-100">Tela de Algodón 100%</option>
                <option value="tela-teñida-azul">Tela Teñida Azul</option>
                <option value="camiseta-basica">Camiseta Básica</option>
                <option value="pantalon-jean">Pantalón Jean</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                name="quantity"
                value={productionForm.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uit-green-500 focus:border-transparent"
                placeholder="Ej: 100"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Línea de Producción
              </label>
              <select
                name="line"
                value={productionForm.line}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uit-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar línea</option>
                {assignedLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name} - {line.type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calidad
              </label>
              <select
                name="quality"
                value={productionForm.quality}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uit-green-500 focus:border-transparent"
              >
                <option value="excelente">Excelente</option>
                <option value="buena">Buena</option>
                <option value="regular">Regular</option>
                <option value="mala">Mala</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              value={productionForm.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uit-green-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones sobre la producción..."
            />
          </div>
          
          <button
            type="submit"
            className="uit-button-primary w-full md:w-auto"
          >
            🏭 Registrar Producción
          </button>
        </form>
      </div>

      {/* Historial de producción */}
      <div className="uit-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mi Historial de Producción</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(record.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.quantity} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getQualityColor(record.quality)}`}>
                      {record.quality.charAt(0).toUpperCase() + record.quality.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.feedback || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de líneas asignadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignedLines.map((line) => (
          <div key={line.id} className="uit-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{line.name}</h3>
              <span className={`w-3 h-3 rounded-full ${
                line.status === 'activa' ? 'bg-green-500' : 
                line.status === 'mantenimiento' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capacidad:</span>
                <span className="text-sm font-medium">{line.capacity} unidades</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Producción Actual:</span>
                <span className="text-sm font-medium">{line.currentProduction} unidades</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Eficiencia:</span>
                  <span className="text-sm font-medium text-green-600">{line.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-uit-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${line.efficiency}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Estado: {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProduccionDashboard;

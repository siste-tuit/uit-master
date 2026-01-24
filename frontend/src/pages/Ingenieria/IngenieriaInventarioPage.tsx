import React, { useState, useEffect } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost?: number;
  supplier?: string;
  status: 'disponible' | 'bajo_stock' | 'agotado';
}

const IngenieriaInventarioPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar items desde el backend
  useEffect(() => {
    const cargarItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_CORE}/inventario/por-departamento?departamento=ingenieria`);
        if (response.ok) {
          const data = await response.json();
          setInventoryItems(data.items.map((item: any) => ({
            id: item.id,
            name: item.nombre,
            category: item.categoria,
            currentStock: item.stockActual,
            minStock: item.stockMinimo,
            maxStock: item.stockMaximo,
            unit: item.unidad,
            status: item.status
          })));
        } else {
          console.error('Error al cargar inventario');
        }
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarItems();
  }, []);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [itemActual, setItemActual] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '',
    cost: '',
    supplier: '',
  });

  // Filtrar items basado en búsqueda
  const itemsFiltrados = inventoryItems.filter(item => {
    const terminoLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(terminoLower) ||
      item.category.toLowerCase().includes(terminoLower) ||
      item.unit.toLowerCase().includes(terminoLower) ||
      item.supplier?.toLowerCase().includes(terminoLower)
    );
  });

  const totalItems = inventoryItems.length;
  const bajoStock = inventoryItems.filter(i => i.status === 'bajo_stock').length;
  const agotados = inventoryItems.filter(i => i.status === 'agotado').length;

  const calcularEstado = (current: number, min: number, max: number): 'disponible' | 'bajo_stock' | 'agotado' => {
    if (current === 0) return 'agotado';
    if (current < min) return 'bajo_stock';
    return 'disponible';
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const abrirFormularioNuevo = () => {
    if (isReadOnly) {
      return;
    }
    setModoEdicion(false);
    setItemActual(null);
    setFormData({
      name: '',
      category: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      cost: '',
      supplier: '',
    });
    setMostrarFormulario(true);
  };

  const abrirFormularioEdicion = (item: InventoryItem) => {
    if (isReadOnly) {
      return;
    }
    setModoEdicion(true);
    setItemActual(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      cost: item.cost?.toString() || '',
      supplier: item.supplier || '',
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setItemActual(null);
    setFormData({
      name: '',
      category: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      cost: '',
      supplier: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      return;
    }
    
    const currentStock = parseFloat(formData.currentStock);
    const minStock = parseFloat(formData.minStock);
    const maxStock = parseFloat(formData.maxStock);
    
    if (!formData.name || !formData.category || !currentStock || !minStock || !maxStock || !formData.unit) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (modoEdicion && itemActual) {
        // Actualizar item existente
        const response = await fetch(`${API_BASE_URL_CORE}/inventario/items/${itemActual.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: formData.name,
            categoria: formData.category,
            stock_actual: currentStock,
            stock_minimo: minStock,
            stock_maximo: maxStock,
            unidad: formData.unit,
            costo: formData.cost ? parseFloat(formData.cost) : 0,
            proveedor: formData.supplier || null
          })
        });

        if (response.ok) {
          alert('✅ Ítem actualizado exitosamente');
          // Recargar items
          const reloadResponse = await fetch(`${API_BASE_URL_CORE}/inventario/por-departamento?departamento=ingenieria`);
          if (reloadResponse.ok) {
            const data = await reloadResponse.json();
            setInventoryItems(data.items.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              category: item.categoria,
              currentStock: item.stockActual,
              minStock: item.stockMinimo,
              maxStock: item.stockMaximo,
              unit: item.unidad,
              status: item.status
            })));
          }
          cerrarFormulario();
        } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.message || 'No se pudo actualizar el ítem'}`);
        }
      } else {
        // Crear nuevo item
        const response = await fetch(`${API_BASE_URL_CORE}/inventario/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: formData.name,
            categoria: formData.category,
            stock_actual: currentStock,
            stock_minimo: minStock,
            stock_maximo: maxStock,
            unidad: formData.unit,
            costo: formData.cost ? parseFloat(formData.cost) : 0,
            proveedor: formData.supplier || null,
            departamento: 'ingenieria'
          })
        });

        if (response.ok) {
          alert('✅ Ítem agregado exitosamente');
          // Recargar items
          const reloadResponse = await fetch(`${API_BASE_URL_CORE}/inventario/por-departamento?departamento=ingenieria`);
          if (reloadResponse.ok) {
            const data = await reloadResponse.json();
            setInventoryItems(data.items.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              category: item.categoria,
              currentStock: item.stockActual,
              minStock: item.stockMinimo,
              maxStock: item.stockMaximo,
              unit: item.unidad,
              status: item.status
            })));
          }
          cerrarFormulario();
        } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.message || 'No se pudo crear el ítem'}`);
        }
      }
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message || 'Verifica que el backend esté corriendo'}`);
    }
  };

  const handleEliminar = async (id: string) => {
    if (isReadOnly) {
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este ítem?')) {
      try {
        const response = await fetch(`${API_BASE_URL_CORE}/inventario/items/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('✅ Ítem eliminado exitosamente');
          // Recargar items
          const reloadResponse = await fetch(`${API_BASE_URL_CORE}/inventario/por-departamento?departamento=ingenieria`);
          if (reloadResponse.ok) {
            const data = await reloadResponse.json();
            setInventoryItems(data.items.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              category: item.categoria,
              currentStock: item.stockActual,
              minStock: item.stockMinimo,
              maxStock: item.stockMaximo,
              unit: item.unidad,
              status: item.status
            })));
          }
        } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.message || 'No se pudo eliminar el ítem'}`);
        }
      } catch (error: any) {
        console.error('Error al eliminar:', error);
        alert(`❌ Error al conectar con el servidor: ${error.message || 'Verifica que el backend esté corriendo'}`);
      }
    }
  };

  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'bajo_stock':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'agotado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoTexto = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'bajo_stock':
        return 'Bajo Stock';
      case 'agotado':
        return 'Agotado';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📦 Gestión de Inventario</h1>
          <p className="text-gray-600 mt-1">Control y seguimiento de materiales textiles y productos terminados.</p>
        </div>
        {!mostrarFormulario && !isReadOnly && (
          <button
            onClick={abrirFormularioNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            <span className="text-xl">➕</span>
            Agregar Ítem
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Total de Ítems</p>
          <p className="text-4xl font-bold">{totalItems}</p>
          <p className="text-xs mt-2 opacity-80">Materiales registrados</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Bajo Stock</p>
          <p className="text-4xl font-bold">{bajoStock}</p>
          <p className="text-xs mt-2 opacity-80">Requieren atención</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Agotados</p>
          <p className="text-4xl font-bold">{agotados}</p>
          <p className="text-xs mt-2 opacity-80">Reabastecimiento urgente</p>
        </div>
      </div>

      {mostrarFormulario && !isReadOnly && (
        /* Formulario de Agregar/Editar */
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {modoEdicion ? '✏️ Editar Ítem' : '➕ Agregar Nuevo Ítem'}
            </h2>
            <button
              onClick={cerrarFormulario}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✖
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Hilo de Algodón 40/1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría: <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Materia Prima">Materia Prima</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Producto Terminado">Producto Terminado</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Químicos">Químicos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Actual: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleFormChange}
                  placeholder="Ej: 2500"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unidad de Medida: <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar unidad</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="metros">Metros</option>
                  <option value="litros">Litros</option>
                  <option value="unidades">Unidades</option>
                  <option value="rollos">Rollos</option>
                  <option value="bolsas">Bolsas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Mínimo: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleFormChange}
                  placeholder="Ej: 500"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Máximo: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxStock"
                  value={formData.maxStock}
                  onChange={handleFormChange}
                  placeholder="Ej: 5000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo Unitario (S/.)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                  placeholder="Ej: 15.50"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleFormChange}
                  placeholder="Ej: Proveedor Hilos S.A.S"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                {modoEdicion ? '💾 Actualizar' : '➕ Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Inventario */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Materiales del Inventario</h2>
              <p className="text-sm text-gray-600 mt-1">Lista completa de materiales y productos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-lg">🔍</span>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-500 hover:text-gray-700 font-semibold"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600">
              Mostrando {itemsFiltrados.length} resultado(s) para "{searchTerm}"
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mínimo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Máximo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemsFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                    {item.supplier && (
                      <div className="text-xs text-gray-500 mt-1">Proveedor: {item.supplier}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{item.currentStock}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.minStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.maxStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getEstadoColor(item.status)}`}>
                      {getEstadoTexto(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {isReadOnly ? (
                      <span className="text-xs text-gray-400">Solo lectura</span>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirFormularioEdicion(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
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

export default IngenieriaInventarioPage;


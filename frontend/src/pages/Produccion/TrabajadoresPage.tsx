import React, { useState, useEffect } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface Trabajador {
  id: string;
  nombre_completo: string;
  dni?: string;
  telefono?: string;
  cargo?: string;
  area?: string;
  fecha_ingreso?: string;
  is_activo: boolean;
}

const TrabajadoresPage: React.FC = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    telefono: '',
    cargo: '',
    area: '',
    fecha_ingreso: ''
  });

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  const fetchTrabajadores = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/trabajadores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrabajadores(data.trabajadores || []);
      }
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('erp_token');
      const url = editingTrabajador
        ? `${API_BASE_URL_CORE}/trabajadores/${editingTrabajador.id}`
        : `${API_BASE_URL_CORE}/trabajadores`;
      
      const method = editingTrabajador ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTrabajadores();
        setShowModal(false);
        setEditingTrabajador(null);
        setFormData({ nombre_completo: '', dni: '', telefono: '', cargo: '', area: '', fecha_ingreso: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar trabajador');
      }
    } catch (error) {
      console.error('Error al guardar trabajador:', error);
      alert('Error al guardar trabajador');
    }
  };

  const handleEdit = (trabajador: Trabajador) => {
    setEditingTrabajador(trabajador);
    setFormData({
      nombre_completo: trabajador.nombre_completo,
      dni: trabajador.dni || '',
      telefono: trabajador.telefono || '',
      cargo: trabajador.cargo || '',
      area: trabajador.area || '',
      fecha_ingreso: trabajador.fecha_ingreso || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este trabajador?')) return;

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/trabajadores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTrabajadores();
      }
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
    }
  };

  const trabajadoresActivos = trabajadores.filter(t => t.is_activo);
  const puedeAgregar = trabajadoresActivos.length < 15;

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Trabajadores</h1>
        <button
          onClick={() => {
            setEditingTrabajador(null);
            setFormData({ nombre_completo: '', dni: '', telefono: '', cargo: '', area: '', fecha_ingreso: '' });
            setShowModal(true);
          }}
          disabled={!puedeAgregar}
          className={`px-4 py-2 rounded-lg font-semibold ${
            puedeAgregar
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          + Agregar Trabajador ({trabajadoresActivos.length}/15)
        </button>
      </div>

      {!puedeAgregar && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          Has alcanzado el límite máximo de 15 trabajadores activos.
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Ingreso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trabajadoresActivos.map((trabajador) => (
              <tr key={trabajador.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trabajador.nombre_completo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trabajador.dni || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trabajador.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trabajador.cargo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trabajador.area || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trabajador.fecha_ingreso ? new Date(trabajador.fecha_ingreso).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(trabajador)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(trabajador.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTrabajador ? 'Editar Trabajador' : 'Nuevo Trabajador'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccione un área</option>
                  <option value="Costura">Costura</option>
                  <option value="Corte">Corte</option>
                  <option value="Empaque">Empaque</option>
                  <option value="Control de Calidad">Control de Calidad</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Supervisión">Supervisión</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                <input
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTrabajador(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabajadoresPage;


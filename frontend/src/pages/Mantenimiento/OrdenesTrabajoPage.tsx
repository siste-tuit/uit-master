// pages/OrdenesTrabajoPage.tsx

"use client";
import React, { useState } from 'react';
import { useOrdenesTrabajo, OrdenTrabajoData } from '@/context/OrdenContext';
import OrdenFormModal from '@/components/Mantenimiento/OrdenFormModal';
import { useAuth } from '../../context/AuthContext';

type ModalMode = string | null | 'CREATE_NEW';

const OrdenesTrabajoPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const { ordenes, loading, error } = useOrdenesTrabajo();

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');

  const [modalOrdenId, setModalOrdenId] = useState<ModalMode>(null);

  const handleOpenCreateModal = () => {
    if (isReadOnly) return;
    setModalOrdenId("CREATE_NEW");
  };
  const handleOpenEditModal = (id: string) => {
    if (isReadOnly) return;
    setModalOrdenId(id);
  };
  const handleCloseModal = () => setModalOrdenId(null);

  const getPrioridadColor = (prioridad: OrdenTrabajoData['prioridad']) => {
    switch (prioridad) {
      case 'ALTA':
      case 'URGENTE': return 'bg-red-100 text-red-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: OrdenTrabajoData['estado']) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrdenes = ordenes.filter(orden => {
    const estadoFiltro = filtroEstado.toUpperCase().replace('_', '');
    const prioridadFiltro = filtroPrioridad.toUpperCase();

    const matchesEstado = filtroEstado === 'todos' || orden.estado === estadoFiltro;
    const matchesPrioridad = filtroPrioridad === 'todas' || orden.prioridad === prioridadFiltro;

    return matchesEstado && matchesPrioridad;
  });

  if (loading) {
    return <div className="min-h-screen p-6 text-xl text-center text-blue-600">Cargando Órdenes... 📋</div>;
  }

  if (error) {
    return <div className="min-h-screen p-6 text-xl text-center text-red-600">Error al cargar: {error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          📋 Órdenes de Trabajo
        </h1>
        <p className="text-gray-600">
          Gestiona las órdenes de mantenimiento y reparación de equipos
        </p>
      </div>

      {/* Filtros y Botón Nueva Orden */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block mb-2 text-sm font-medium text-gray-700">Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          {!isReadOnly && (
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Nueva Orden
            </button>
          )}
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4">
        {filteredOrdenes.map(orden => (
          <div key={orden.id} className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{orden.titulo}</h3>
                <p className="text-sm text-gray-600">{orden.equipo_nombre}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(orden.prioridad)}`}>
                  {orden.prioridad}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                  {orden.estado.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="mb-4 text-gray-700">{orden.descripcion}</p>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-gray-600">Asignado a:</span>
                <p className="font-medium">{orden.asignado_a_nombre || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Tiempo Estimado:</span>
                <p className="font-medium">{orden.tiempo_estimado_h}h</p>
              </div>
              <div>
                <span className="text-gray-600">Fecha Vencimiento:</span>
                <p className="font-medium">
                  {orden.fecha_vencimiento ? new Date(orden.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Repuestos:</span>
                <p className="font-medium">{orden.total_repuestos} items</p>
              </div>
            </div>

            {/* ⭐ VISUALIZACIÓN DE CHIPS DE REPUESTOS (CORREGIDO) */}
            {orden.repuestos_necesarios && orden.repuestos_necesarios.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-600">Repuestos necesarios:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {orden.repuestos_necesarios.map((r, index) => (
                    <span key={index} className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                      {/* ⭐ CORRECCIÓN AQUÍ: Usamos repuesto_nombre y cantidad_requerida */}
                      {r.repuesto_nombre} (x{r.cantidad_requerida})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="flex mt-4 space-x-2">
                <button
                  className="px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  onClick={() => handleOpenEditModal(orden.id)}
                >
                  Ver Detalles
                </button>
                <button className="px-4 py-2 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                  Actualizar Estado
                </button>
                <button className="px-4 py-2 text-sm text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200">
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Creación/Edición */}
      {modalOrdenId !== null && (
        <OrdenFormModal
          ordenIdToEdit={modalOrdenId === "CREATE_NEW" ? null : modalOrdenId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrdenesTrabajoPage;
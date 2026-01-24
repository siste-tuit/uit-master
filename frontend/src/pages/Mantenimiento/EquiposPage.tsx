// pages/EquiposPage.tsx (Implementación final con Contexto y Modal Único)

"use client";
import React, { useState } from 'react';
import { useEquipos, EquipoData } from '@/context/EquipoContext';
import EquipoFormModal from '@/components/Mantenimiento/EquipoFormModal';
import { Label } from 'recharts';
import { useAuth } from '../../context/AuthContext';

// Definimos un nuevo tipo de estado para el control de apertura
// Usamos "CREATE_NEW" como placeholder para abrir el modal en modo creación.
type ModalMode = string | null | 'CREATE_NEW';

const EquiposPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const { equipos, loading, error } = useEquipos();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroLinea, setFiltroLinea] = useState<string>('todas');

  // Estado inicial: null (Cerrado)
  const [modalEquipoId, setModalEquipoId] = useState<ModalMode>(null);

  // --- Handlers de Modal ---
  // ⭐ CORRECCIÓN: Usamos "CREATE_NEW" para forzar el cambio de estado y abrir el modal.
  const handleOpenCreateModal = () => {
    if (isReadOnly) return;
    setModalEquipoId("CREATE_NEW");
  };
  const handleOpenEditModal = (id: string) => {
    if (isReadOnly) return;
    setModalEquipoId(id);
  };
  const handleCloseModal = () => setModalEquipoId(null); // Esto cierra el modal

  // Mapeo de ENUMs
  const getEstadoColor = (estado: EquipoData['estado']) => {
    switch (estado) {
      case 'OPERATIVO': return 'bg-green-100 text-green-800';
      case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-800';
      case 'FUERA_SERVICIO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Lógica de filtrado
  const filteredEquipos: EquipoData[] = equipos.filter(equipo => {
    const estadoFiltro = filtroEstado.toUpperCase().replace('AVERIA', 'FUERA_SERVICIO').replace('PARADO', 'FUERA_SERVICIO');
    const matchesEstado = filtroEstado === 'todos' || equipo.estado === estadoFiltro;
    const matchesLinea = filtroLinea === 'todas' || equipo.linea_produccion === filtroLinea;
    return matchesEstado && matchesLinea;
  });

  const lineasUnicas = Array.from(new Set(equipos.map(e => e.linea_produccion))).filter(Boolean);

  // --- Manejo de estado de carga y error ---
  if (loading) {
    return <div className="min-h-screen p-6 text-xl text-center text-blue-600">Cargando Equipos... ⚙️</div>;
  }

  if (error) {
    return <div className="min-h-screen p-6 text-xl text-center text-red-600">Error al cargar: {error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🏭 Gestión de Equipos
        </h1>
        <p className="text-gray-600">
          Administra el estado y mantenimiento de la maquinaria textil
        </p>
      </div>

      {/* Filtros y Botón de Creación */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Filtro Estado */}
          <div>
            <Label className="block mb-2 text-sm font-medium text-gray-700">
              Estado del Equipo
            </Label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="operativo">Operativo</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="fuera_servicio">Fuera de Servicio</option>
            </select>
          </div>

          {/* Filtro Línea */}
          <div>
            <Label className="block mb-2 text-sm font-medium text-gray-700">
              Línea de Producción
            </Label>
            <select
              value={filtroLinea}
              onChange={(e) => setFiltroLinea(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las Líneas</option>
              {lineasUnicas.map(linea => (
                <option key={linea} value={linea}>{linea}</option>
              ))}
            </select>
          </div>

          {/* Botón de Nuevo Equipo */}
          {!isReadOnly && (
            <div className="flex items-end">
              <button
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={handleOpenCreateModal} // ⭐ Ahora usa "CREATE_NEW"
              >
                + Nuevo Equipo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Equipos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredEquipos.map(equipo => (
          <div key={equipo.id} className="p-6 bg-white rounded-lg shadow-md">

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{equipo.nombre}</h3>
                <p className="text-sm text-gray-600">{equipo.linea_produccion}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(equipo.estado)}`}>
                {equipo.estado.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-medium">{equipo.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horas Operación:</span>
                <span className="font-medium">{equipo.horas_operacion.toLocaleString()}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Responsable:</span>
                <span className="font-medium">{equipo.responsable_nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último Mantenimiento:</span>
                <span className="font-medium">
                  {equipo.ultimo_mantenimiento ? new Date(equipo.ultimo_mantenimiento).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo Mantenimiento:</span>
                <span className="font-medium">
                  {equipo.proximo_mantenimiento ? new Date(equipo.proximo_mantenimiento).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex mt-4 space-x-2">
                <button
                  className="flex-1 px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  onClick={() => handleOpenEditModal(equipo.id)}
                >
                  Ver Detalles
                </button>
                <button className="flex-1 px-3 py-2 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                  Crear Orden
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredEquipos.length === 0 && !loading && (
        <div className="py-10 text-lg text-center text-gray-500">
          No se encontraron equipos con los filtros seleccionados.
        </div>
      )}

      {/* ⭐ Renderiza el modal solo si modalEquipoId NO es null */}
      {modalEquipoId !== null && (
        <EquipoFormModal
          // Si es "CREATE_NEW", pasamos null (modo creación). Si es un ID, lo pasamos directamente.
          equipoIdToEdit={modalEquipoId === "CREATE_NEW" ? null : modalEquipoId}
          onClose={handleCloseModal} // Esto cierra el modal (establece modalEquipoId = null)
        />
      )}

    </div>
  );
};

export default EquiposPage;
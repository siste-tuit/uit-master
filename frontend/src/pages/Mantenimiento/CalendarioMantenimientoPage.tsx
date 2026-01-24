// pages/CalendarioMantenimientoPage.tsx

"use client";
import React, { useState, useMemo } from 'react';
// ⭐ Importación del contexto principal
import { useCalendario, EventoCalendarioData } from '@/context/CalendarioContext';
import CalendarioFormModal from '@/components/Mantenimiento/CalendarioFromModal';
import { Label } from '@/components/ui/label'; // Asumo la importación de Label de shadcn/ui
import { useAuth } from '../../context/AuthContext';

type ModalMode = string | null | 'CREATE_NEW';

// Nota: Los ENUMs en el backend usan mayúsculas, adaptamos la función de color
const getPriorityColor = (p: EventoCalendarioData['prioridad']) => {
  switch (p) {
    case 'ALTA': return 'bg-red-100 text-red-800';
    case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
    case 'BAJA': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const CalendarioMantenimientoPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  // 1. Usar el contexto para obtener eventos
  const { eventos, loading, error } = useCalendario();

  // ⭐ Control de Modal: null=Cerrado, ID/CREATE_NEW=Abierto
  const [modalEventoId, setModalEventoId] = useState<ModalMode>(null);

  // --- Handlers de Modal ---
  const handleOpenCreateModal = () => {
    if (isReadOnly) return;
    setModalEventoId("CREATE_NEW");
  };
  const handleOpenEditModal = (id: string) => {
    if (isReadOnly) return;
    setModalEventoId(id);
  };
  const handleCloseModal = () => setModalEventoId(null);

  // --- Lógica de filtrado "Próximos 7 días" ---
  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const eventosProximos = useMemo(() => {
    // Calcular la fecha límite (dentro de 7 días)
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 7);
    const limitDateStr = limitDate.toISOString().slice(0, 10);

    return eventos
      .filter(ev => {
        // Filtra eventos programados que caen en el rango [hoy, hoy + 7 días]
        return ev.fecha_programada >= hoy &&
          ev.fecha_programada <= limitDateStr &&
          ev.estado === 'PROGRAMADO';
      })
      // Ordenar por fecha programada (ascendente)
      .sort((a, b) => a.fecha_programada.localeCompare(b.fecha_programada));
  }, [eventos, hoy]);


  // --- Manejo de Carga y Error ---
  if (loading) {
    return <div className="min-h-screen p-6 text-xl text-center text-blue-600">Cargando Calendario... 📅</div>;
  }

  if (error) {
    return <div className="min-h-screen p-6 text-xl text-center text-red-600">Error al cargar: {error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">📅 Calendario de Mantenimiento</h1>
        <p className="text-gray-600">Programación de mantenimientos preventivos y correctivos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Próximos eventos (Adaptado para usar datos del Contexto) */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Próximos 7 días</h2>
          <div className="space-y-3">
            {eventosProximos.length > 0 ? (
              eventosProximos.map(ev => (
                <div
                  key={ev.id}
                  className={`p-4 border rounded-lg ${isReadOnly ? '' : 'cursor-pointer hover:bg-gray-50'}`}
                  onClick={isReadOnly ? undefined : () => handleOpenEditModal(ev.id)} // ⭐ Abre modal de edición
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Usamos nombre_evento del backend */}
                      <p className="font-semibold text-gray-900">{ev.nombre_evento}</p>
                      {/* Usamos equipo_nombre y linea_produccion del JOIN */}
                      <p className="text-sm text-gray-600">{ev.equipo_nombre} · {ev.linea_produccion}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ev.prioridad)}`}>
                      {ev.prioridad.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                    {/* Usamos fecha_programada */}
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {new Date(ev.fecha_programada).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 border rounded-lg">No hay eventos en los próximos 7 días.</div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            {!isReadOnly && (
              <button
                className="p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                onClick={handleOpenCreateModal} // ⭐ Abre modal de creación
              >
                + Nuevo evento
              </button>
            )}
            <button className="p-4 text-white bg-green-600 rounded-lg hover:bg-green-700">Importar</button>
            <button className="p-4 text-white bg-orange-600 rounded-lg hover:bg-orange-700">Exportar</button>
            <button className="p-4 text-white bg-purple-600 rounded-lg hover:bg-purple-700">Ver calendario mensual</button>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p>Hoy: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{hoy}</span></p>
          </div>
        </div>
      </div>

      {/* Modal de Creación/Edición */}
      {modalEventoId !== null && (
        <CalendarioFormModal
          // Si modalEventoId es "CREATE_NEW", pasamos null al modal
          eventoIdToEdit={modalEventoId === "CREATE_NEW" ? null : modalEventoId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CalendarioMantenimientoPage;
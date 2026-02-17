"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useIncidencias } from "@/context/IncidenciasContext";
import { useAuth } from "../../context/AuthContext";

const SoporteTicketsPage: React.FC = () => {
  const { incidencias, loading, error, fetchIncidencias, updateIncidencia } = useIncidencias();
  const { user } = useAuth();

  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const ticketsSoporte = useMemo(
    () =>
      incidencias.filter((i) => {
        // Filtrar por departamento Mantenimiento si está definido, o por título genérico
        const esMantenimiento =
          (i.departamento_nombre && i.departamento_nombre.toLowerCase().startsWith("mantenimiento")) ||
          (i.titulo && i.titulo.toLowerCase().includes("soporte de máquina"));

        if (!esMantenimiento) return false;

        const matchesEstado =
          filtroEstado === "todas" ? true : i.estado === filtroEstado;
        const matchesPrioridad =
          filtroPrioridad === "todas" ? true : i.prioridad === filtroPrioridad;

        return matchesEstado && matchesPrioridad;
      }),
    [incidencias, filtroEstado, filtroPrioridad]
  );

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    const ticket = ticketsSoporte.find((t) => t.id === id);
    if (!ticket) return;

    await updateIncidencia(id, {
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      prioridad: ticket.prioridad,
      estado: nuevoEstado as any,
      asignado_a: ticket.asignado_a || null,
      departamento_id: ticket.departamento_id || null,
      fecha_resolucion:
        nuevoEstado === "resuelto" ? new Date().toISOString() : ticket.fecha_resolucion || null,
    });
  };

  const handleChangePrioridad = async (id: string, nuevaPrioridad: string) => {
    const ticket = ticketsSoporte.find((t) => t.id === id);
    if (!ticket) return;

    await updateIncidencia(id, {
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      prioridad: nuevaPrioridad as any,
      estado: ticket.estado,
      asignado_a: ticket.asignado_a || null,
      departamento_id: ticket.departamento_id || null,
      fecha_resolucion: ticket.fecha_resolucion || null,
    });
  };

  const isReadOnly = user?.role === "gerencia";

  if (loading) {
    return (
      <div className="min-h-screen p-6 text-center text-blue-600">
        Cargando tickets de soporte...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 text-center text-red-600">
        Error al cargar tickets: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🛟 Tickets de Soporte desde Producción
        </h1>
        <p className="text-gray-600">
          Solicitudes que los operarios de producción han enviado al área de Mantenimiento
          (problemas de máquina, pedidos de agujas e insumos relacionados).
        </p>
      </div>

      {/* Filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 min-w-40">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {ticketsSoporte.length === 0 && (
          <div className="p-4 text-sm text-center text-gray-500 bg-white rounded-lg shadow">
            No hay tickets de soporte registrados para mantenimiento.
          </div>
        )}

        {ticketsSoporte.map((ticket) => {
          const prioridadColor =
            ticket.prioridad === "alta" || ticket.prioridad === "critica"
              ? "bg-red-100 text-red-800"
              : ticket.prioridad === "media"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800";

          const estadoColor =
            ticket.estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : ticket.estado === "en_proceso"
              ? "bg-blue-100 text-blue-800"
              : ticket.estado === "resuelto"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800";

          return (
            <div key={ticket.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {ticket.titulo}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Reportado por:{" "}
                    <span className="font-medium">
                      {ticket.reportado_por_nombre || ticket.reportado_por}
                    </span>
                    {ticket.fecha_reporte && (
                      <>
                        {" "}
                        ·{" "}
                        {new Date(ticket.fecha_reporte).toLocaleString("es-PE")}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${prioridadColor}`}
                  >
                    Prioridad: {ticket.prioridad.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${estadoColor}`}
                  >
                    Estado: {ticket.estado.replace("_", " ")}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-800 whitespace-pre-line">
                {ticket.descripcion}
              </p>

              {!isReadOnly && (
                <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                  <div>
                    <label className="mr-2 text-gray-600">Cambiar estado:</label>
                    <select
                      value={ticket.estado}
                      onChange={(e) =>
                        handleChangeEstado(ticket.id, e.target.value)
                      }
                      className="p-1 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>

                  <div>
                    <label className="mr-2 text-gray-600">Prioridad:</label>
                    <select
                      value={ticket.prioridad}
                      onChange={(e) =>
                        handleChangePrioridad(ticket.id, e.target.value)
                      }
                      className="p-1 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoporteTicketsPage;


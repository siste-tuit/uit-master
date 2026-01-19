"use client";
import React, { useEffect } from "react";
import { useIncidencias } from "@/context/IncidenciasContext";

const IncidenciasPage: React.FC = () => {
  const { incidencias, loading, fetchIncidencias } = useIncidencias();

  useEffect(() => {
    fetchIncidencias();
  }, []);

  console.log("IncidenciasPage renderizada:", incidencias);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f9ff",
        minHeight: "100vh",
        border: "2px solid #0ea5e9",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#0c4a6e",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        🔧 GESTIÓN DE INCIDENCIAS
      </h1>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#1e40af", marginBottom: "15px" }}>
          📋 Lista de Incidencias Activas
        </h2>

        {loading ? (
          <p style={{ color: "#1e3a8a" }}>Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <p style={{ color: "#475569" }}>No hay incidencias registradas.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {incidencias.map((incidencia) => {
              // Colores dinámicos según estado/prioridad
              const prioridadColor =
                incidencia.prioridad === "alta"
                  ? "#dc2626"
                  : incidencia.prioridad === "media"
                  ? "#d97706"
                  : incidencia.prioridad === "baja"
                  ? "#15803d"
                  : "#7f1d1d";

              const borderColor =
                incidencia.estado === "pendiente"
                  ? "#fbbf24"
                  : incidencia.estado === "en_proceso"
                  ? "#f59e0b"
                  : incidencia.estado === "resuelto"
                  ? "#10b981"
                  : "#0d9488";

              const bgColor =
                incidencia.estado === "pendiente"
                  ? "#fef3c7"
                  : incidencia.estado === "en_proceso"
                  ? "#fef3c7"
                  : incidencia.estado === "resuelto"
                  ? "#d1fae5"
                  : "#ccfbf1";

              return (
                <div
                  key={incidencia.id}
                  style={{
                    padding: "15px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    backgroundColor: bgColor,
                  }}
                >
                  <h3 style={{ color: "#92400e", margin: "0 0 8px 0" }}>
                    {incidencia.titulo}
                  </h3>
                  <p style={{ color: "#78350f", margin: "0 0 8px 0" }}>
                    {incidencia.descripcion}
                  </p>
                  <div style={{ fontSize: "14px", color: "#92400e" }}>
                    <span>👤 {incidencia.reportado_por}</span> |{" "}
                    <span>
                      📅{" "}
                      {new Date(incidencia.fecha_reporte).toLocaleDateString()}
                    </span>{" "}
                    |{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: prioridadColor,
                      }}
                    >
                      {incidencia.prioridad.toUpperCase()} PRIORIDAD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#1e40af",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "16px" }}>
          🎉 ¡Página de Incidencias funcionando correctamente!
        </p>
        <p
          style={{
            margin: "5px 0 0 0",
            fontSize: "14px",
            opacity: 0.9,
          }}
        >
          Tiempo de carga: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default IncidenciasPage;

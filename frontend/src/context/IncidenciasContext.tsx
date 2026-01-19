"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Incidencia {
    id: string;
    titulo: string;
    descripcion: string;
    estado: "pendiente" | "en_proceso" | "resuelto" | "cerrado";
    prioridad: "baja" | "media" | "alta" | "critica";
    reportado_por: string;
    asignado_a?: string | null;
    departamento_id?: number | null;
    fecha_reporte: string;
    fecha_resolucion?: string | null;
    reportado_por_nombre?: string;
    asignado_a_nombre?: string;
    departamento_nombre?: string;
}

interface IncidenciasContextType {
    incidencias: Incidencia[];
    loading: boolean;
    error: string | null;
    fetchIncidencias: () => Promise<void>;
    addIncidencia: (data: Partial<Incidencia>) => Promise<void>;
    updateIncidencia: (id: string, data: Partial<Incidencia>) => Promise<void>;
    deleteIncidencia: (id: string) => Promise<void>;
}

const IncidenciasContext = createContext<IncidenciasContextType | undefined>(undefined);

import API_BASE_URL_CORE from '../config/api';
const API_URL = `${API_BASE_URL_CORE}/incidencias`;

export const IncidenciasProvider = ({ children }: { children: ReactNode }) => {
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 🔄 Obtener todas las incidencias
    const fetchIncidencias = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Error al obtener incidencias");
            const data = await res.json();
            setIncidencias(data);
        } catch (err: any) {
            setError(err.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    // ➕ Crear una incidencia
    const addIncidencia = async (data: Partial<Incidencia>) => {
        try {
            setLoading(true);
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Error al crear incidencia");
            await fetchIncidencias(); // Actualizar lista
        } catch (err: any) {
            setError(err.message || "Error al crear incidencia");
        } finally {
            setLoading(false);
        }
    };

    // ✏️ Actualizar una incidencia
    const updateIncidencia = async (id: string, data: Partial<Incidencia>) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Error al actualizar incidencia");
            await fetchIncidencias();
        } catch (err: any) {
            setError(err.message || "Error al actualizar incidencia");
        } finally {
            setLoading(false);
        }
    };

    // 🗑️ Eliminar una incidencia
    const deleteIncidencia = async (id: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar incidencia");
            setIncidencias((prev) => prev.filter((i) => i.id !== id));
        } catch (err: any) {
            setError(err.message || "Error al eliminar incidencia");
        } finally {
            setLoading(false);
        }
    };

    // Cargar incidencias al montar (solo si el usuario tiene acceso)
    useEffect(() => {
        // Solo cargar incidencias si el usuario está autenticado y tiene el rol adecuado
        // Esto evita errores 500 cuando la tabla no existe o hay problemas
        const token = localStorage.getItem('erp_token');
        if (token) {
            fetchIncidencias().catch(err => {
                console.warn('⚠️ No se pudieron cargar incidencias (esto es normal si no tienes acceso):', err);
            });
        }
    }, []);

    return (
        <IncidenciasContext.Provider
            value={{
                incidencias,
                loading,
                error,
                fetchIncidencias,
                addIncidencia,
                updateIncidencia,
                deleteIncidencia,
            }}
        >
            {children}
        </IncidenciasContext.Provider>
    );
};

// 🧠 Hook para usar el contexto
export const useIncidencias = () => {
    const context = useContext(IncidenciasContext);
    if (!context) {
        throw new Error("useIncidencias debe usarse dentro de un IncidenciasProvider");
    }
    return context;
};

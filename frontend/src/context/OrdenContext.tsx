// contexts/OrdenTrabajoContext.tsx

"use client";
import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useContext,
    ReactNode,
} from "react";

// 🧠 Tipos
interface OTRepuesto {
    repuesto_id: string;
    repuesto_nombre: string; // Para mostrar en el detalle
    cantidad_requerida: number;
    cantidad_utilizada: number;
}

// Corresponde a la tabla 'ordenes_trabajo'
export interface OrdenTrabajoData {
    id: string;
    equipo_id: string;
    equipo_nombre: string; // Nombre del equipo (JOIN)
    titulo: string;
    descripcion: string;
    tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'INSPECCION';
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    tiempo_estimado_h: number | null;
    asignado_a: string | null;
    asignado_a_nombre: string; // Nombre del técnico (JOIN)
    fecha_creacion: string;
    fecha_vencimiento: string | null;
    fecha_finalizacion: string | null;
    notas_finales: string | null;
    total_repuestos?: number; // Propiedad para el listado (COUNT)
    repuestos_necesarios?: OTRepuesto[]; // Propiedad para el detalle
}

// 📦 Contexto
interface OrdenTrabajoContextProps {
    ordenes: OrdenTrabajoData[];
    loading: boolean;
    error: string | null;
    fetchOrdenes: () => Promise<void>;
    getOrdenById: (id: string) => Promise<OrdenTrabajoData | undefined>;
    handleCreateUpdate: (ordenData: any, isCreating: boolean) => Promise<void>;
    handleDelete: (ordenId: string) => Promise<void>;
}

const OrdenTrabajoContext = createContext<OrdenTrabajoContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/ordenes`;

export const OrdenTrabajoProvider = ({ children }: { children: ReactNode }) => {
    const [ordenes, setOrdenes] = useState<OrdenTrabajoData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener Órdenes de Trabajo
    const fetchOrdenes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener órdenes de trabajo");
            const data = await res.json();
            setOrdenes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 Obtener una OT por ID (con detalles de repuestos)
    const getOrdenById = useCallback(async (id: string): Promise<OrdenTrabajoData | undefined> => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener orden de trabajo");
            return await res.json();
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }, []);


    // 🔹 Crear o editar OT
    const handleCreateUpdate = async (ordenData: any, isCreating: boolean) => {
        const method = isCreating ? "POST" : "PUT";
        const url = isCreating
            ? API_BASE_URL
            : `${API_BASE_URL}/${ordenData.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(ordenData),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || `Error al ${isCreating ? "crear" : "actualizar"} orden de trabajo`
                );

            await fetchOrdenes(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // 🔹 Eliminar OT
    const handleDelete = async (ordenId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${ordenId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al eliminar orden de trabajo");

            await fetchOrdenes(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };


    useEffect(() => {
        fetchOrdenes();
    }, [fetchOrdenes]);

    return (
        <OrdenTrabajoContext.Provider
            value={{
                ordenes,
                loading,
                error,
                fetchOrdenes,
                getOrdenById,
                handleCreateUpdate,
                handleDelete,
            }}
        >
            {children}
        </OrdenTrabajoContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useOrdenesTrabajo = () => {
    const context = useContext(OrdenTrabajoContext);
    if (!context) {
        throw new Error("useOrdenesTrabajo debe usarse dentro de un OrdenTrabajoProvider");
    }
    return context;
};
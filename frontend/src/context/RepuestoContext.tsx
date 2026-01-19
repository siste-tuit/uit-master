// contexts/RepuestoContext.tsx

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
// Corresponde a la tabla 'repuestos'
export interface RepuestoData {
    id: string;
    codigo: string;
    nombre: string;
    categoria: string;
    stock: number;
    stock_minimo: number;
    ubicacion: string | null;
    proveedor: string | null;
    costo: number;
    is_critico: boolean;
    stock_bajo?: boolean; // Propiedad calculada
}

// 📦 Contexto
interface RepuestoContextProps {
    repuestos: RepuestoData[];
    loading: boolean;
    error: string | null;
    fetchRepuestos: () => Promise<void>;
    getRepuestoById: (id: string) => Promise<RepuestoData | undefined>;
    handleCreateUpdate: (repuestoData: any, isCreating: boolean) => Promise<void>;
    handleDelete: (repuestoId: string) => Promise<void>;
}

const RepuestoContext = createContext<RepuestoContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/repuestos`;

export const RepuestoProvider = ({ children }: { children: ReactNode }) => {
    const [repuestos, setRepuestos] = useState<RepuestoData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener Repuestos
    const fetchRepuestos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener repuestos");
            const data = await res.json();
            setRepuestos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 Obtener un repuesto por ID
    const getRepuestoById = useCallback(async (id: string): Promise<RepuestoData | undefined> => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener repuesto");
            return await res.json();
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }, []);

    // 🔹 Crear o editar repuesto
    const handleCreateUpdate = async (repuestoData: any, isCreating: boolean) => {
        const method = isCreating ? "POST" : "PUT";
        const url = isCreating
            ? API_BASE_URL
            : `${API_BASE_URL}/${repuestoData.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(repuestoData),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || `Error al ${isCreating ? "crear" : "actualizar"} repuesto`
                );

            await fetchRepuestos(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // 🔹 Eliminar repuesto
    const handleDelete = async (repuestoId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${repuestoId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al eliminar repuesto");

            await fetchRepuestos(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchRepuestos();
    }, [fetchRepuestos]);

    return (
        <RepuestoContext.Provider
            value={{
                repuestos,
                loading,
                error,
                fetchRepuestos,
                getRepuestoById,
                handleCreateUpdate,
                handleDelete,
            }}
        >
            {children}
        </RepuestoContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useRepuestos = () => {
    const context = useContext(RepuestoContext);
    if (!context) {
        throw new Error("useRepuestos debe usarse dentro de un RepuestoProvider");
    }
    return context;
};
// contexts/CalendarioContext.tsx

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
// Corresponde a la tabla 'calendario_mantenimiento'
export interface EventoCalendarioData {
    id: string;
    equipo_id: string;
    equipo_nombre: string; // Nombre del equipo (JOIN)
    nombre_evento: string;
    descripcion: string | null;
    tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'INSPECCION';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
    fecha_programada: string; // Usamos string para DATE
    hora_inicio: string | null; // Usamos string para TIME
    hora_fin: string | null; // Usamos string para TIME
    estado: 'PROGRAMADO' | 'REALIZADO' | 'CANCELADO';
    ot_id: string | null; // Referencia a una Orden de Trabajo
    linea_produccion?: string; // Línea del equipo (JOIN)
}

// 📦 Contexto
interface CalendarioContextProps {
    eventos: EventoCalendarioData[];
    loading: boolean;
    error: string | null;
    fetchEventos: (startDate?: string, endDate?: string) => Promise<void>;
    getEventoById: (id: string) => Promise<EventoCalendarioData | undefined>;
    handleCreateUpdate: (eventoData: any, isCreating: boolean) => Promise<void>;
    handleDelete: (eventoId: string) => Promise<void>;
}

const CalendarioContext = createContext<CalendarioContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/calendario`;

export const CalendarioProvider = ({ children }: { children: ReactNode }) => {
    const [eventos, setEventos] = useState<EventoCalendarioData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener Eventos (con filtros de fecha opcionales)
    const fetchEventos = useCallback(async (startDate?: string, endDate?: string) => {
        setLoading(true);
        setError(null);
        try {
            let url = API_BASE_URL;
            // Construir la URL con parámetros de consulta si se proporcionan fechas
            if (startDate && endDate) {
                const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
                url = `${API_BASE_URL}?${params.toString()}`;
            }

            const res = await fetch(url, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener eventos de calendario");
            const data = await res.json();
            setEventos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 Obtener un evento por ID
    const getEventoById = useCallback(async (id: string): Promise<EventoCalendarioData | undefined> => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener evento");
            return await res.json();
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }, []);


    // 🔹 Crear o editar evento
    const handleCreateUpdate = async (eventoData: any, isCreating: boolean) => {
        const method = isCreating ? "POST" : "PUT";
        const url = isCreating
            ? API_BASE_URL
            : `${API_BASE_URL}/${eventoData.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(eventoData),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || `Error al ${isCreating ? "crear" : "actualizar"} evento`
                );

            await fetchEventos(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // 🔹 Eliminar evento
    const handleDelete = async (eventoId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${eventoId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al eliminar evento");

            await fetchEventos(); // Recargar la lista
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        // Carga inicial (ej: eventos de los próximos 30 días)
        fetchEventos();
    }, [fetchEventos]);

    return (
        <CalendarioContext.Provider
            value={{
                eventos,
                loading,
                error,
                fetchEventos,
                getEventoById,
                handleCreateUpdate,
                handleDelete,
            }}
        >
            {children}
        </CalendarioContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useCalendario = () => {
    const context = useContext(CalendarioContext);
    if (!context) {
        throw new Error("useCalendario debe usarse dentro de un CalendarioProvider");
    }
    return context;
};
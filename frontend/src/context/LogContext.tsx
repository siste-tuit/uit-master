// LogContext.tsx
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
interface LogData {
    id: number;
    timestamp: string; // Formato 'dd/mm/yyyy, HH:ii:ss'
    nivel: string; // ERROR | WARNING | INFO | DEBUG
    fuente: string; // auth | database | api | frontend | system | security
    mensaje: string;
    stack_trace: string | null;
    usuario_id: string | null;
    ip: string | null;
}

interface LogFilters {
    nivel?: string;
    fuente?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}

interface LogSummary {
    total: number;
    errores: number;
    advertencias: number;
    informacion: number;
    debug: number;
}

interface LogPayload {
    nivel: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
    fuente: 'auth' | 'database' | 'api' | 'frontend' | 'system' | 'security';
    mensaje: string;
    stack_trace?: string;
    usuario_id?: string;
    ip?: string;
}

// 📦 Contexto
interface LogsContextProps {
    logs: LogData[];
    summary: LogSummary | null;
    loadingLogs: boolean;
    loadingSummary: boolean;
    error: string | null;

    // Funciones
    fetchLogs: (filters?: LogFilters) => Promise<void>;
    fetchSummary: () => Promise<void>;
    createLog: (payload: LogPayload) => Promise<void>;

    // Datos auxiliares
    NIVELES: string[];
    FUENTES: string[];
}

const LogsContext = createContext<LogsContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/logs`;

export const LogsProvider = ({ children }: { children: ReactNode }) => {
    const [logs, setLogs] = useState<LogData[]>([]);
    const [summary, setSummary] = useState<LogSummary | null>(null);
    const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Listas de valores fijos para los filtros del frontend
    const NIVELES = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];
    const FUENTES = ['auth', 'database', 'api', 'frontend', 'system', 'security'];

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        // Aquí se asumiría obtener el token si los endpoints están protegidos
        "Authorization": `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener Logs con Filtros
    const fetchLogs = useCallback(async (filters: LogFilters = {}) => {
        setLoadingLogs(true);
        setError(null);

        // Construir la cadena de consulta (query string) a partir de los filtros
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        const url = `${API_BASE_URL}${params ? `?${params}` : ''}`;

        try {
            const res = await fetch(url, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener logs");

            const data: LogData[] = await res.json();
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al obtener logs");
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    // 🔹 Obtener Resumen de Logs
    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_BASE_URL}/resumen`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener el resumen de logs");

            const data: LogSummary = await res.json();
            setSummary(data);
        } catch (err) {
            console.error("Error en fetchSummary:", err);
            // No se establece el error globalmente para no bloquear la tabla de logs
        } finally {
            setLoadingSummary(false);
        }
    }, []);

    // 🔹 Crear un nuevo Log
    const createLog = async (payload: LogPayload) => {
        try {
            const res = await fetch(API_BASE_URL, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al registrar el log");
            }

            // Opcional: Recargar el resumen si se crea un log
            fetchSummary();

        } catch (err) {
            console.error("Error al crear log:", err);
            // Se propaga el error para que el componente que llama lo maneje (ej. mostrar notificación)
            throw err;
        }
    };

    // Efecto para la carga inicial
    useEffect(() => {
        fetchLogs();
        fetchSummary();
    }, [fetchLogs, fetchSummary]);

    return (
        <LogsContext.Provider
            value={{
                logs,
                summary,
                loadingLogs,
                loadingSummary,
                error,
                fetchLogs,
                fetchSummary,
                createLog,
                NIVELES,
                FUENTES,
            }}
        >
            {children}
        </LogsContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useLogs = () => {
    const context = useContext(LogsContext);
    if (!context) {
        throw new Error("useLogs debe usarse dentro de un LogsProvider");
    }
    return context;
};
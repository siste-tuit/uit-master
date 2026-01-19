// contexts/EquipoContext.tsx (Versión Final Corregida)

"use client";
import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useContext,
    ReactNode,
} from "react";

// ⭐ 1. Importamos el hook y los tipos del UsuariosContext
// Asegúrate de que esta ruta sea correcta:
import { useUsuarios } from './UsuariosContext';

// 🧠 Tipos
// Corresponde a la tabla 'equipos'
export interface EquipoData {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    estado: 'OPERATIVO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';
    linea_produccion: string;
    horas_operacion: number;
    responsable_id: string | null;
    responsable_nombre?: string; // Nombre del usuario responsable (JOIN)
    ultimo_mantenimiento: string | null;
    proximo_mantenimiento: string | null;
    ubicacion: string | null;
}

// ⭐ 2. Definición del tipo simplificado que se usará en el Select
export interface UsuarioDataEquipo {
    id: string;
    nombre_completo: string;
}

// 📦 Contexto
interface EquipoContextProps {
    equipos: EquipoData[];
    usuarios: UsuarioDataEquipo[]; // Usamos el tipo UsuarioDataEquipo
    loading: boolean;
    error: string | null;
    fetchEquipos: () => Promise<void>;
    getEquipoById: (id: string) => Promise<EquipoData | undefined>;
    handleCreateUpdate: (equipoData: any, isCreating: boolean) => Promise<void>;
    handleDelete: (equipoId: string) => Promise<void>;
}

const EquipoContext = createContext<EquipoContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/equipos`;

export const EquipoProvider = ({ children }: { children: ReactNode }) => {
    // ⭐ 3. Obtenemos los datos de usuarios desde el UsuariosContext
    const { users: allUsers, loading: loadingUsers } = useUsuarios();

    const [equipos, setEquipos] = useState<EquipoData[]>([]);

    // ⭐ 4. Mapeamos los usuarios al formato que necesita el Select
    const usuariosResponsables: UsuarioDataEquipo[] = useMemo(() => {
        return allUsers.map(user => ({
            id: user.id,
            // Asumiendo que el campo relevante en tu backend es 'nombre_completo',
            // si tu UsersContext usa 'name', debes mapearlo:
            nombre_completo: (user as any).nombre_completo || user.name,
        }));
    }, [allUsers]);

    const [loadingEquipos, setLoadingEquipos] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // El loading final debe esperar a ambos: equipos y usuarios
    const loading = loadingEquipos || loadingUsers;

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener Equipos
    const fetchEquipos = useCallback(async () => {
        setLoadingEquipos(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener equipos");
            const data = await res.json();
            setEquipos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al cargar equipos");
        } finally {
            setLoadingEquipos(false);
        }
    }, []);

    // 🔹 Obtener un equipo por ID (sin cambios)
    const getEquipoById = useCallback(async (id: string): Promise<EquipoData | undefined> => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener equipo");
            return await res.json();
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }, []);


    // 🔹 Crear o editar equipo (sin cambios)
    const handleCreateUpdate = async (equipoData: any, isCreating: boolean) => {
        // ... (Implementación de POST/PUT) ...
        const method = isCreating ? "POST" : "PUT";
        const url = isCreating ? API_BASE_URL : `${API_BASE_URL}/${equipoData.id}`;
        try {
            const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(equipoData) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Error al ${isCreating ? "crear" : "actualizar"} equipo`);
            await fetchEquipos();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // 🔹 Eliminar equipo (sin cambios)
    const handleDelete = async (equipoId: string) => {
        // ... (Implementación de DELETE) ...
        try {
            const res = await fetch(`${API_BASE_URL}/${equipoId}`, { method: "DELETE", headers: getAuthHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al eliminar equipo");
            await fetchEquipos();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };


    useEffect(() => {
        fetchEquipos();
        // Ya no necesitamos fetchUsuarios() aquí, ya que usamos useUsuarios()
    }, [fetchEquipos]);

    return (
        <EquipoContext.Provider
            value={{
                equipos,
                usuarios: usuariosResponsables, // ⭐ Proporcionamos los usuarios mapeados
                loading,
                error,
                fetchEquipos,
                getEquipoById,
                handleCreateUpdate,
                handleDelete,
            }}
        >
            {children}
        </EquipoContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useEquipos = () => {
    const context = useContext(EquipoContext);
    if (!context) {
        throw new Error("useEquipos debe usarse dentro de un EquipoProvider");
    }
    return context;
};
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
interface UserData {
    id: string;
    name: string;
    email: string;
    role_name: string;
    role_id: number;
    department: string;
    is_active: boolean;
}

interface Role {
    id: number;
    nombre: string;
}

interface Departamento {
    id: number;
    nombre: string;
}

// 📦 Contexto
interface UsuariosContextProps {
    users: UserData[];
    roles: Role[];
    departamentos: Departamento[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    fetchRoles: () => Promise<void>;
    fetchDepartamentos: () => Promise<void>;
    handleCreateUpdate: (userData: any, isCreating: boolean) => Promise<void>;
    handleToggleStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

const UsuariosContext = createContext<UsuariosContextProps | undefined>(
    undefined
);

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/users`;
const API_ROLES_URL = `${API_BASE_URL_CORE}/roles`;
const API_DEPARTAMENTOS_URL = `${API_BASE_URL_CORE}/departamentos`;

export const UsuariosProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("erp_token")}`,
    });

    // 🔹 Obtener usuarios
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener usuarios");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 Obtener roles
    const fetchRoles = useCallback(async () => {
        try {
            const res = await fetch(API_ROLES_URL, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Error al obtener roles");
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    // 🔹 Obtener departamentos
    const fetchDepartamentos = useCallback(async () => {
        try {
            const res = await fetch(API_DEPARTAMENTOS_URL, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Error al obtener departamentos");
            const data = await res.json();
            setDepartamentos(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    // 🔹 Crear o editar usuario
    const handleCreateUpdate = async (userData: any, isCreating: boolean) => {
        const method = isCreating ? "POST" : "PUT";
        const url = isCreating
            ? API_BASE_URL
            : `${API_BASE_URL}/${userData.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(userData),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || `Error al ${isCreating ? "crear" : "actualizar"} usuario`
                );

            setUsers(data.users);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // 🔹 Cambiar estado (activo/inactivo)
    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${userId}/status`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al cambiar estado");
            setUsers(data.users);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchDepartamentos();
    }, [fetchUsers, fetchRoles, fetchDepartamentos]);

    return (
        <UsuariosContext.Provider
            value={{
                users,
                roles,
                departamentos,
                loading,
                error,
                fetchUsers,
                fetchRoles,
                fetchDepartamentos,
                handleCreateUpdate,
                handleToggleStatus,
            }}
        >
            {children}
        </UsuariosContext.Provider>
    );
};

// 🪄 Hook para usarlo fácilmente
export const useUsuarios = () => {
    const context = useContext(UsuariosContext);
    if (!context) {
        throw new Error("useUsuarios debe usarse dentro de un UsuariosProvider");
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Departamento } from '../types';

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/departamentos`;

interface DepartamentoContextType {
    departamentos: Departamento[];
    isLoading: boolean;
    fetchDepartamentos: () => Promise<void>;
    addDepartamento: (nombre: string) => Promise<boolean>;
    updateDepartamento: (id: number, nombre: string) => Promise<boolean>;
    deleteDepartamento: (id: number) => Promise<boolean>;
}

const DepartamentoContext = createContext<DepartamentoContextType | undefined>(undefined);

export const useDepartamentos = () => {
    const context = useContext(DepartamentoContext);
    if (!context) {
        throw new Error('useDepartamentos debe ser usado dentro de un DepartamentoProvider');
    }
    return context;
};

interface DepartamentoProviderProps {
    children: ReactNode;
}

export const DepartamentoProvider: React.FC<DepartamentoProviderProps> = ({ children }) => {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDepartamentos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}`);
            const data = await response.json();
            if (response.ok) {
                setDepartamentos(data);
            } else {
                console.error('Error al obtener departamentos:', data.message);
            }
        } catch (error) {
            console.error('Error de red al obtener departamentos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addDepartamento = async (nombre: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre }),
            });
            if (response.ok) {
                await fetchDepartamentos();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al agregar departamento:', error);
            return false;
        }
    };

    const updateDepartamento = async (id: number, nombre: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre }),
            });
            if (response.ok) {
                await fetchDepartamentos();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar departamento:', error);
            return false;
        }
    };

    const deleteDepartamento = async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchDepartamentos();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            return false;
        }
    };

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    return (
        <DepartamentoContext.Provider
            value={{ departamentos, isLoading, fetchDepartamentos, addDepartamento, updateDepartamento, deleteDepartamento }}
        >
            {children}
        </DepartamentoContext.Provider>
    );
};

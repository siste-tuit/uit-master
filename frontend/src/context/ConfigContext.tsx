import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfiguracionEmpresa } from '../types'; // define este tipo

import API_BASE_URL_CORE from '../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/configuracion`;

interface ConfiguracionContextType {
  configuracion: ConfiguracionEmpresa | null;
  isLoading: boolean;
  fetchConfiguracion: () => Promise<void>;
  updateConfiguracion: (nuevaConfig: Partial<ConfiguracionEmpresa>) => Promise<boolean>;
}

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error('useConfiguracion debe ser usado dentro de un ConfiguracionProvider');
  }
  return context;
};

interface ConfiguracionProviderProps {
  children: ReactNode;
}

export const ConfiguracionProvider: React.FC<ConfiguracionProviderProps> = ({ children }) => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmpresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfiguracion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();
      if (response.ok) {
        setConfiguracion(data);
      } else {
        console.error('Error al obtener configuración:', data.message);
      }
    } catch (error) {
      console.error('Error de red al obtener configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfiguracion = async (nuevaConfig: Partial<ConfiguracionEmpresa>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaConfig),
      });
      if (response.ok) {
        await fetchConfiguracion();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  return (
    <ConfiguracionContext.Provider value={{ configuracion, isLoading, fetchConfiguracion, updateConfiguracion }}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

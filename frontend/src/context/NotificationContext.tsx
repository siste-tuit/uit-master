import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';

// Tipos para el contexto de notificaciones
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Mock data de notificaciones
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva orden de producción',
    message: 'Se ha asignado una nueva orden de producción a la línea 3',
    type: 'info',
    userId: '6',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    actionUrl: '/produccion',
  },
  {
    id: '2',
    title: 'Stock bajo',
    message: 'El hilo de algodón 40/1 está por debajo del stock mínimo',
    type: 'warning',
    userId: '3',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    actionUrl: '/inventario',
  },
  {
    id: '3',
    title: 'Producción completada',
    message: 'La orden #1234 ha sido completada exitosamente',
    type: 'success',
    userId: '6',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
    actionUrl: '/produccion',
  },
  {
    id: '4',
    title: 'Error en línea de producción',
    message: 'Se detectó un error en la línea 2, requiere atención inmediata',
    type: 'error',
    userId: '3',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
    actionUrl: '/ingenieria',
  },
  {
    id: '5',
    title: 'Reporte mensual disponible',
    message: 'El reporte de producción del mes está listo para revisión',
    type: 'info',
    userId: '4',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    actionUrl: '/reportes',
  },
];

// Provider del contexto
interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cargar notificaciones del usuario
  useEffect(() => {
    if (userId) {
      const userNotifications = mockNotifications.filter(n => n.userId === userId);
      setNotifications(userNotifications);
    }
  }, [userId]);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Agregar nueva notificación
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Marcar notificación como leída
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Eliminar notificación
  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Limpiar todas las notificaciones
  const clearAll = () => {
    setNotifications([]);
  };

  // Simular notificaciones en tiempo real (cada 30 segundos)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      // Simular notificaciones aleatorias
      const randomNotifications = [
        {
          title: 'Actualización de producción',
          message: 'La línea 1 ha alcanzado el 85% de su capacidad',
          type: 'info' as const,
          userId,
          actionUrl: '/produccion',
        },
        {
          title: 'Nuevo pedido recibido',
          message: 'Se ha recibido un nuevo pedido de 500 unidades',
          type: 'success' as const,
          userId,
          actionUrl: '/contabilidad',
        },
        {
          title: 'Mantenimiento programado',
          message: 'La línea 2 requiere mantenimiento preventivo',
          type: 'warning' as const,
          userId,
          actionUrl: '/ingenieria',
        },
      ];

      // 10% de probabilidad de generar una notificación
      if (Math.random() < 0.1) {
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [userId]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

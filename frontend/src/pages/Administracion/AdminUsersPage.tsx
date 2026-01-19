// AdminUsersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { UserModal } from '@/components/User/UserModal'; // ⬅️ Importa el nuevo componente de modal

// Definición de tipos
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

import API_BASE_URL_CORE from '../../config/api';
const API_BASE_URL = `${API_BASE_URL_CORE}/users`;
const API_ROLES_URL = `${API_BASE_URL_CORE}/roles`;
const API_DEPARTAMENTOS_URL = `${API_BASE_URL_CORE}/departamentos`;

const AdminUsersPage: React.FC = () => {
  // Aquí puedes usar useAuth para obtener el token JWT
  // const { user } = useAuth(); 
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string }[]>([]);

  // Función para obtener las cabeceras con el token
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('erp_token')}` // Obtiene el token del contexto de Auth
  });

  // --- Funciones de Fetching ---

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        // Si la respuesta es 401/403 (No autorizado/Prohibido)
        if (response.status === 401 || response.status === 403) {
          throw new Error('No tienes permiso para ver esta sección.');
        }
        throw new Error('Error al cargar la lista de usuarios.');
      }

      const data: UserData[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con la API.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener la lista de roles (Deberías crear un endpoint /api/roles en el backend)
  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch(API_ROLES_URL, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        // Si la ruta está protegida y falla, lanza un error específico
        throw new Error('Error al cargar los roles. Permiso denegado o API no disponible.');
      }

      const data: Role[] = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      // Mostrar un error genérico o dejar roles como vacío si falla
    }
  }, []);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await fetch(API_DEPARTAMENTOS_URL, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cargar los departamentos.');
      }

      const data: { id: number; nombre: string }[] = await response.json();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartamentos();
  }, [fetchUsers, fetchRoles, fetchDepartamentos]);

  // --- Handlers de Acciones CRUD ---

  const handleCreateUpdate = async (userData: any, isCreating: boolean) => {
    setError(null);

    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating ? API_BASE_URL : `${API_BASE_URL}/${userData.id}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${isCreating ? 'crear' : 'actualizar'} el usuario.`);
      }

      // El backend devuelve la lista actualizada (data.users)
      setUsers(data.users);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar.');
      // Re-lanzar error para que el modal lo capture
      throw err;
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${currentStatus ? 'desactivar' : 'activar'} la cuenta.`);
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserData) => {
    setEditingUser(user);
    setError(null);
    setIsModalOpen(true);
  };

  // --- Renderizado ---

  return (
    <div className="p-6">
      {/* ... (Header y Resumen) ... */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Usuarios</h2>
            <button
              className="px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              onClick={handleOpenCreateModal}
              disabled={loading}
            >
              Nuevo usuario
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          {loading && users.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Correo</th>
                    <th className="py-2 pr-4">Rol</th>
                    <th className="py-2 pr-4">Departamento</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4 font-mono">{u.email}</td>
                      <td className="py-2 pr-4 capitalize">{u.role_name}</td>
                      <td className="py-2 pr-4 capitalize">{u.department}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${u.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
                        >
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2 space-x-2">
                        <button
                          className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                          onClick={() => handleOpenEditModal(u)}
                        >
                          Editar
                        </button>
                        <button
                          className={`px-2 py-1 text-xs text-white rounded ${u.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          disabled={loading}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-4 font-semibold text-gray-800">Resumen</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Usuarios totales: {users.length}</li>
            <li>Activos: {users.filter(u => u.is_active).length}</li>
            <li>Inactivos: {users.filter(u => !u.is_active).length}</li>
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <UserModal
          user={editingUser}
          roles={roles}
          departamentos={departamentos}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateUpdate}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
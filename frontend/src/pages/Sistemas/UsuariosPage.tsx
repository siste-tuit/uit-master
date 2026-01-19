"use client";
import React, { useState, useMemo } from 'react';
import { useUsuarios } from '@/context/UsuariosContext'; 
// Asumiendo que UserModal está en el mismo lugar que la página anterior, lo importamos:
import { UserModal } from '@/components/User/UserModal'; 

// NOTA: Esta interfaz Usuario de la página se mantiene igual
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  ultimoAcceso: Date;
  fechaCreacion: Date;
  avatar: string;
  telefono?: string;
  permisos: string[];
}

// Interfaz para UserData del contexto
interface UserData {
    id: string;
    name: string;
    email: string;
    role_name: string;
    role_id: number;
    department: string;
    is_active: boolean;
}

// Función de mapeo para adaptar UserData del Contexto a la interfaz Usuario de la página.
const mapUserDataToUsuario = (userData: UserData): Usuario => {
  let avatar = '👥'; 
  if (userData.role_name.includes('Admin')) avatar = '👔';
  else if (userData.role_name.includes('Sistemas')) avatar = '⚙️';
  else if (userData.role_name.includes('Gerencia')) avatar = '👩‍💼';
  else if (userData.role_name.includes('Ingeniería')) avatar = '🔧';
  else if (userData.role_name.includes('Contabilidad')) avatar = '📊';

  return {
    id: userData.id,
    nombre: userData.name,
    email: userData.email,
    rol: userData.role_name,
    departamento: userData.department,
    estado: userData.is_active ? 'activo' : 'inactivo', 
    ultimoAcceso: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)),
    fechaCreacion: new Date('2024-01-01'),
    avatar: avatar,
    telefono: undefined,
    permisos: [userData.role_name.toLowerCase()],
  };
};

// Función para mapear Usuario (de la vista) a UserData (para la API)
const mapUsuarioToUserData = (usuario: Usuario, roles: any[], departamentos: any[]): Partial<UserData> => {
    const role = roles.find(r => r.nombre === usuario.rol);
    const department = departamentos.find(d => d.nombre === usuario.departamento);
    
    return {
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        role_name: usuario.rol,
        role_id: role ? role.id : undefined, // Importante para el backend
        department: usuario.departamento,
        // Asumiendo que el formulario solo permite Activo/Inactivo
        is_active: usuario.estado === 'activo', 
    };
};

const UsuariosPage: React.FC = () => {
  // 1. Usar el hook del contexto
  const {
    users: usersContext,
    roles: rolesContext,
    departamentos: departamentosContext,
    loading,
    error,
    handleToggleStatus,
    handleCreateUpdate, // Función CRUD del contexto
  } = useUsuarios();

  // 2. Mapear los datos del contexto
  const usuarios = useMemo(() => usersContext.map(mapUserDataToUsuario), [usersContext]);
  const rolesUnicos = useMemo(() => rolesContext.map(r => r.nombre), [rolesContext]);
  const deptosUnicos = useMemo(() => departamentosContext.map(d => d.nombre), [departamentosContext]);

  // 3. Estados de UI (incluyendo modal/edición)
  const [filtros, setFiltros] = useState({
    estado: 'todos',
    rol: 'todos',
    departamento: 'todos'
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
  const [editingUser, setEditingUser] = useState<UserData | null>(null); // Usuario a editar (en formato API)
  const [busqueda, setBusqueda] = useState('');

  // Funciones de estilo se mantienen
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Administrador': return 'bg-purple-100 text-purple-800';
      case 'Sistemas': return 'bg-blue-100 text-blue-800';
      case 'Gerencia': return 'bg-yellow-100 text-yellow-800';
      case 'Contabilidad': return 'bg-green-100 text-green-800';
      case 'Ingeniería': return 'bg-orange-100 text-orange-800';
      case 'Usuario': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Lógica de filtrado y estadísticas se mantienen igual
  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleFiltroEstado = filtros.estado === 'todos' || usuario.estado === filtros.estado;
    const cumpleFiltroRol = filtros.rol === 'todos' || usuario.rol === filtros.rol;
    const cumpleFiltroDepartamento = filtros.departamento === 'todos' || usuario.departamento === filtros.departamento;
    const cumpleBusqueda = busqueda === '' || 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleFiltroRol && cumpleFiltroDepartamento && cumpleBusqueda;
  });

  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
    suspendidos: usuarios.filter(u => u.estado === 'suspendido').length,
    ultimoMes: usuarios.filter(u => u.fechaCreacion > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)).length
  };

  // --- Handlers de Acciones CRUD del Contexto ---

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (usuario: Usuario) => {
    // Mapear el formato de la vista al formato de la API (UserData) para pasar al Modal
    const userToEdit = usersContext.find(u => u.id === usuario.id); 
    setEditingUser(userToEdit || null);
    setIsModalOpen(true);
  };

  // Usamos handleCreateUpdate del contexto
  const handleSaveUser = async (userData: any) => {
    const isCreating = !userData.id;
    try {
        await handleCreateUpdate(userData, isCreating);
        setIsModalOpen(false); // Cerrar al éxito
    } catch (e) {
        // El contexto ya maneja el error internamente o lo lanza
        throw e; // Lanza el error para que el modal lo pueda mostrar
    }
  };

  // Usamos handleToggleStatus del contexto
  const handleCambiarEstado = async (userId: string, nuevoEstado: string) => {
    const userContextData = usersContext.find(u => u.id === userId);
    
    if (!userContextData) return;

    // Solo la función del backend maneja 'activo' (true) o 'inactivo' (false)
    const newStatusIsActive = nuevoEstado === 'activo';
    const currentStatus = userContextData.is_active;

    // Llama al toggle solo si el estado deseado es diferente al actual,
    // ya que handleToggleStatus invierte el estado actual.
    if (newStatusIsActive !== currentStatus) {
        try {
            await handleToggleStatus(userId, currentStatus);
        } catch (e) {
            console.error('Error al cambiar estado con API:', e);
        }
    } else if (nuevoEstado === 'suspendido') {
        // NOTA: Si 'suspendido' requiere una llamada a API diferente, 
        // debe implementarse una función específica en el contexto. 
        // Aquí no se hace nada para 'suspendido' para no alterar la API original.
        alert('Advertencia: El estado "suspendido" no tiene un endpoint específico en el contexto. Solo se manejan Activo/Inactivo.');
    }
  };

  const handleEliminarUsuario = (usuarioId: string) => {
    if (window.confirm('¿Estás seguro de que quieres ELIMINAR este usuario? Esta acción es permanente. (Funcionalidad DELETE faltante en el contexto/API)')) {
      // Si tu API/Contexto tuviera un `handleDelete(userId)`, se llamaría aquí:
      // try {
      //   await handleDelete(usuarioId);
      // } catch (e) {
      //   alert('Error al eliminar: ' + (e as Error).message);
      // }
    }
  };

  // --- Renderizado ---

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <p className="text-xl font-medium text-blue-600">Cargando usuarios y recursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          <p className="font-bold">Error al cargar datos:</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">Verifica que tu servidor API (`http://localhost:5000`) esté corriendo.</p>
        </div>
      </div>
    );
  }

  // Estructura del front-end (JSX) se mantiene EXACTAMENTE igual
  return (
    <div className="min-h-screen p-6 bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-600">{estadisticas.inactivos}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                <span className="text-2xl">⏸️</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspendidos</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.suspendidos}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <span className="text-2xl">🚫</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos (30d)</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.ultimoMes}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <span className="text-2xl">🆕</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Acciones */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col flex-1 gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />

              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>

              {/* Roles dinámicos del contexto */}
              <select
                value={filtros.rol}
                onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos los roles</option>
                {[...new Set(rolesUnicos)].map(rol => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>

              {/* Departamentos dinámicos del contexto */}
              <select
                value={filtros.departamento}
                onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos los departamentos</option>
                {[...new Set(deptosUnicos)].map(depto => (
                  <option key={depto} value={depto}>{depto}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal} // Nuevo handler para abrir el modal de creación
              className="flex items-center px-6 py-2 space-x-2 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <span>➕</span>
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-primary-100">
                          <span className="text-xl">{usuario.avatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                          <div className="text-sm text-gray-500">{usuario.email}</div>
                          {usuario.telefono && (
                            <div className="text-xs text-gray-400">{usuario.telefono}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {usuario.departamento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(usuario.estado)}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {usuario.ultimoAcceso.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(usuario)} // Nuevo handler para abrir el modal de edición
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Editar
                        </button>
                        <select
                          value={usuario.estado}
                          onChange={(e) => handleCambiarEstado(usuario.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="activo">Activar</option>
                          <option value="inactivo">Desactivar</option>
                          <option value="suspendido">Suspender</option>
                        </select>
                        <button
                          onClick={() => handleEliminarUsuario(usuario.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {usuariosFiltrados.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
            <p className="text-gray-500">Intenta ajustar los filtros o crear un nuevo usuario</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Distribución por Roles</h3>
            <div className="space-y-3">
              {[...new Set(usuarios.map(u => u.rol))].map(rol => {
                const count = usuarios.filter(u => u.rol === rol).length;
                const percentage = usuarios.length > 0 ? (count / usuarios.length) * 100 : 0;
                return (
                  <div key={rol} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{rol}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 rounded-full bg-primary-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <div className="space-y-3">
              {usuarios
                .sort((a, b) => b.ultimoAcceso.getTime() - a.ultimoAcceso.getTime())
                .slice(0, 5)
                .map(usuario => (
                  <div key={usuario.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                      <span className="text-sm">{usuario.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{usuario.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {usuario.ultimoAcceso.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Modal para Crear/Editar */}
        {isModalOpen && (
            <UserModal
                // El modal espera el usuario a editar en el formato UserData
                user={editingUser} 
                // Los roles y departamentos completos del contexto
                roles={rolesContext.map(r => ({ id: r.id, nombre: r.nombre }))}
                departamentos={departamentosContext.map(d => ({ id: d.id, nombre: d.nombre }))}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveUser} // Usa el nuevo handler conectado al contexto
            />
        )}
    </div>
  );
};

export default UsuariosPage;
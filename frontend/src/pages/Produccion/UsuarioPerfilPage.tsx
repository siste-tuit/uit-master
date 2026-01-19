import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UsuarioPerfilPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👤 Mi Perfil</h1>
        <p className="text-gray-600">Información de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4">
          <div className="text-5xl">{user?.avatar ?? '🙂'}</div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{user?.name ?? 'Usuario'}</p>
            <p className="text-sm text-gray-600">{user?.email ?? '-'}</p>
            <p className="text-sm text-gray-600 capitalize">Rol: {user?.role ?? '-'}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Preferencias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">Nombre</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" defaultValue={user?.name ?? ''} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Correo</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" defaultValue={user?.email ?? ''} />
            </label>
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span>Recibir notificaciones</span>
            </label>
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Modo compacto</span>
            </label>
          </div>
          <div className="mt-4">
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioPerfilPage;



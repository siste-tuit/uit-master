import React, { useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

type Prioridad = 'baja' | 'media' | 'alta';
type TipoSolicitud = 'problema_maquina' | 'insumo' | 'otro';

const SoportePage: React.FC = () => {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<TipoSolicitud>('problema_maquina');
  const [maquina, setMaquina] = useState('');
  const [insumo, setInsumo] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    setError(null);

    try {
      const token = localStorage.getItem('erp_token');
      if (!token) {
        setError('No se encontró sesión activa. Vuelve a iniciar sesión.');
        setEnviando(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL_CORE}/incidencias/soporte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: 'Soporte de máquina de producción',
          tipo_solicitud: tipo,
          maquina,
          insumo: insumo || undefined,
          prioridad,
          descripcion,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al enviar el ticket de soporte');
      }

      setMensaje('Tu solicitud de soporte fue enviada al área de Mantenimiento.');
      // Limpiar formulario
      setTipo('problema_maquina');
      setMaquina('');
      setInsumo('');
      setPrioridad('media');
      setDescripcion('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error inesperado al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Soporte de Mantenimiento</h1>
        <p className="mt-1 text-sm text-gray-600">
          Genera un ticket para el área de mantenimiento cuando tengas un problema con tu máquina
          o necesites un insumo (como agujas, repuestos u otros materiales relacionados).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de solicitud
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoSolicitud)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="problema_maquina">Problema con máquina</option>
              <option value="insumo">Solicitud de insumo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={e => setPrioridad(e.target.value as Prioridad)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máquina / equipo
            </label>
            <input
              type="text"
              value={maquina}
              onChange={e => setMaquina(e.target.value)}
              placeholder="Ej: Máquina recta Juki L-1234, Línea 1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insumo solicitado (opcional)
            </label>
            <input
              type="text"
              value={insumo}
              onChange={e => setInsumo(e.target.value)}
              placeholder="Ej: Agujas 134R Nº 90, aceite, etc."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción del problema o necesidad
          </label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Describe qué está pasando con la máquina, desde cuándo, y cualquier detalle que ayude al área de mantenimiento."
            required
          />
        </div>

        {user && (
          <p className="text-xs text-gray-500">
            Ticket enviado por: <span className="font-medium">{user.email}</span>
          </p>
        )}

        {mensaje && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando...' : 'Enviar ticket de soporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoportePage;


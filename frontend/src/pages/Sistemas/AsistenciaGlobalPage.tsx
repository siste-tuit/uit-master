import React, { useEffect, useState } from 'react';
import API_BASE_URL_CORE from '../../config/api';

interface RegistroAsistencia {
  id: string;
  trabajador_id: string;
  usuario_id: string;
  fecha: string;
  hora_entrada?: string;
  hora_refrigerio_salida?: string;
  hora_refrigerio_llegada?: string;
  hora_salida?: string;
  horas_trabajadas?: string;
  observaciones?: string;
  trabajador_nombre: string;
  trabajador_dni?: string;
  trabajador_cargo?: string;
  trabajador_area?: string;
  usuario_email: string;
  usuario_nombre: string;
}

const AsistenciaGlobalPage: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState<string>('');
  const [usuarioEmail, setUsuarioEmail] = useState<string>('');
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistros();
    const intervalId = setInterval(fetchRegistros, 30000); // auto-actualiza cada 30s
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, area, usuarioEmail]);

  const fetchRegistros = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('erp_token');
      const params = new URLSearchParams();
      if (fecha) params.append('fecha', fecha);
      if (area) params.append('area', area);
      if (usuarioEmail) params.append('usuarioEmail', usuarioEmail.trim());

      const response = await fetch(`${API_BASE_URL_CORE}/asistencia/admin/global?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar la asistencia');
      }

      const data = await response.json();
      setRegistros(data.registros || []);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar asistencia global:', err);
      setError(err.message || 'Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  };

  const formatHora = (hora?: string) => hora ? hora.substring(0, 5) : '-';

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Asistencia de Trabajadores</h1>
          <p className="text-gray-500 text-sm">Vista global para Sistemas (solo lectura)</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Área:</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas</option>
              <option value="Costura">Costura</option>
              <option value="Corte">Corte</option>
              <option value="Empaque">Empaque</option>
              <option value="Control de Calidad">Control de Calidad</option>
              <option value="Almacén">Almacén</option>
              <option value="Supervisión">Supervisión</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Usuario (email):</label>
            <input
              type="text"
              value={usuarioEmail}
              placeholder="ej: AyC@textil.com"
              onChange={(e) => setUsuarioEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              style={{ minWidth: '220px' }}
            />
          </div>
          <button
            onClick={fetchRegistros}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref. Salida</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref. Llegada</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.map((reg) => (
              <tr key={reg.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {new Date(reg.fecha).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{reg.trabajador_nombre}</div>
                  <div className="text-xs text-gray-500">
                    {reg.trabajador_cargo || ''} {reg.trabajador_dni ? `• DNI: ${reg.trabajador_dni}` : ''}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {reg.trabajador_area || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{reg.usuario_email}</div>
                  <div className="text-xs text-gray-500">{reg.usuario_nombre}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatHora(reg.hora_entrada)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatHora(reg.hora_refrigerio_salida)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatHora(reg.hora_refrigerio_llegada)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatHora(reg.hora_salida)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {reg.horas_trabajadas ? `${reg.horas_trabajadas} h` : '-'}
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                  No hay registros para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsistenciaGlobalPage;


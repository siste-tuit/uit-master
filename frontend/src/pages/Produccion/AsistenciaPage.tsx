import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL_CORE from '../../config/api';

interface Trabajador {
  id: string;
  nombre_completo: string;
  dni?: string;
  cargo?: string;
}

interface RegistroAsistencia {
  id?: string;
  trabajador_id: string;
  fecha: string;
  hora_entrada?: string;
  hora_refrigerio_salida?: string;
  hora_refrigerio_llegada?: string;
  hora_salida?: string;
  horas_trabajadas?: number;
  observaciones?: string;
}

const AsistenciaPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [registros, setRegistros] = useState<Record<string, RegistroAsistencia>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) {
      fetchRegistrosAsistencia();
    }
  }, [fechaSeleccionada]);

  const fetchTrabajadores = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/trabajadores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const activos = (data.trabajadores || []).filter((t: any) => t.is_activo);
        setTrabajadores(activos);
        
        // Inicializar registros vacíos para cada trabajador
        const registrosIniciales: Record<string, RegistroAsistencia> = {};
        activos.forEach((t: Trabajador) => {
          registrosIniciales[t.id] = {
            trabajador_id: t.id,
            fecha: fechaSeleccionada,
            hora_entrada: '',
            hora_refrigerio_salida: '',
            hora_refrigerio_llegada: '',
            hora_salida: '',
            observaciones: ''
          };
        });
        setRegistros(registrosIniciales);
      }
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrosAsistencia = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(
        `${API_BASE_URL_CORE}/asistencia?fecha=${fechaSeleccionada}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const registrosMap: Record<string, RegistroAsistencia> = {};
        
        // Inicializar todos los trabajadores
        trabajadores.forEach(t => {
          registrosMap[t.id] = {
            trabajador_id: t.id,
            fecha: fechaSeleccionada,
            hora_entrada: '',
            hora_refrigerio_salida: '',
            hora_refrigerio_llegada: '',
            hora_salida: '',
            observaciones: ''
          };
        });

        // Llenar con datos existentes
        (data.registros || []).forEach((reg: any) => {
          registrosMap[reg.trabajador_id] = {
            id: reg.id,
            trabajador_id: reg.trabajador_id,
            fecha: reg.fecha,
            hora_entrada: reg.hora_entrada || '',
            hora_refrigerio_salida: reg.hora_refrigerio_salida || '',
            hora_refrigerio_llegada: reg.hora_refrigerio_llegada || '',
            hora_salida: reg.hora_salida || '',
            horas_trabajadas: reg.horas_trabajadas,
            observaciones: reg.observaciones || ''
          };
        });

        setRegistros(registrosMap);
      }
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  const handleTimeChange = (trabajadorId: string, field: string, value: string) => {
    if (isReadOnly) return;
    setRegistros(prev => ({
      ...prev,
      [trabajadorId]: {
        ...prev[trabajadorId],
        [field]: value
      }
    }));
  };

  const handleSave = async (trabajadorId: string) => {
    if (isReadOnly) return;
    try {
      const registro = registros[trabajadorId];
      if (!registro) return;

      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/asistencia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trabajadorId: registro.trabajador_id,
          fecha: fechaSeleccionada,
          hora_entrada: registro.hora_entrada || null,
          hora_refrigerio_salida: registro.hora_refrigerio_salida || null,
          hora_refrigerio_llegada: registro.hora_refrigerio_llegada || null,
          hora_salida: registro.hora_salida || null,
          observaciones: registro.observaciones || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRegistros(prev => ({
          ...prev,
          [trabajadorId]: {
            ...prev[trabajadorId],
            id: data.registro.id,
            horas_trabajadas: data.registro.horas_trabajadas
          }
        }));
        alert('Registro guardado exitosamente');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar registro');
      }
    } catch (error) {
      console.error('Error al guardar registro:', error);
      alert('Error al guardar registro');
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Registro de Asistencia</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref. Salida</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref. Llegada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trabajadores.map((trabajador) => {
                const registro = registros[trabajador.id] || {
                  trabajador_id: trabajador.id,
                  fecha: fechaSeleccionada,
                  hora_entrada: '',
                  hora_refrigerio_salida: '',
                  hora_refrigerio_llegada: '',
                  hora_salida: ''
                };

                return (
                  <tr key={trabajador.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trabajador.nombre_completo}</div>
                      {trabajador.cargo && (
                        <div className="text-xs text-gray-500">{trabajador.cargo}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={formatTime(registro.hora_entrada)}
                        onChange={(e) => handleTimeChange(trabajador.id, 'hora_entrada', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={formatTime(registro.hora_refrigerio_salida)}
                        onChange={(e) => handleTimeChange(trabajador.id, 'hora_refrigerio_salida', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={formatTime(registro.hora_refrigerio_llegada)}
                        onChange={(e) => handleTimeChange(trabajador.id, 'hora_refrigerio_llegada', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={formatTime(registro.hora_salida)}
                        onChange={(e) => handleTimeChange(trabajador.id, 'hora_salida', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {registro.horas_trabajadas ? `${registro.horas_trabajadas} hrs` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isReadOnly ? (
                        <span className="text-xs text-gray-400">Solo lectura</span>
                      ) : (
                        <button
                          onClick={() => handleSave(trabajador.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Guardar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {trabajadores.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          No tienes trabajadores registrados. Ve a la sección de Trabajadores para agregar algunos.
        </div>
      )}
    </div>
  );
};

export default AsistenciaPage;


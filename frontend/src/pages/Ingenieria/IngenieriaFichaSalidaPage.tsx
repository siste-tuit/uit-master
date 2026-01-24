import React, { useMemo, useState, useEffect } from 'react';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface FlujoSalidaRow {
  anio: string;
  mes: string;
  semana: string;
  dia: string;
  fecha: string;
  linea: string;
  ficha: string;
  prendasEnviadas: string;
  tStd: string;
  estatus: string;
  observacion: string;
  bajada: string;
}

interface FiltrosFlujoSalida {
  linea: string;
  anio: string;
  mes: string;
  semana: string;
  dia: string;
}

const meses = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const crearFilaVacia = (filtros: FiltrosFlujoSalida): FlujoSalidaRow => ({
  anio: filtros.anio,
  mes: filtros.mes,
  semana: filtros.semana,
  dia: filtros.dia,
  fecha: new Date().toISOString().split('T')[0],
  linea: filtros.linea,
  ficha: '',
  prendasEnviadas: '',
  tStd: '',
  estatus: '',
  observacion: '',
  bajada: ''
});

interface UsuarioSistemas {
  id: string;
  nombre_completo: string;
  email: string;
  avatar: string | null;
}

const IngenieriaFichaSalidaPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const hoy = useMemo(() => new Date(), []);
  const filtrosIniciales: FiltrosFlujoSalida = {
    linea: '',
    anio: hoy.getFullYear().toString(),
    mes: meses[hoy.getMonth()]?.value ?? '01',
    semana: '',
    dia: ''
  };

  const [filtros, setFiltros] = useState<FiltrosFlujoSalida>(filtrosIniciales);
  const [filas, setFilas] = useState<FlujoSalidaRow[]>([crearFilaVacia(filtrosIniciales)]);
  const [usuariosSistemas, setUsuariosSistemas] = useState<UsuarioSistemas[]>([]);
  const [usuarioSistemasSeleccionado, setUsuarioSistemasSeleccionado] = useState<string>('');
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [lineasDisponibles, setLineasDisponibles] = useState<string[]>([]);
  const [loadingLineas, setLoadingLineas] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const semanas = useMemo(
    () =>
      Array.from({ length: 53 }, (_, index) => {
        const numero = index + 1;
        return numero.toString().padStart(2, '0');
      }),
    []
  );

  // Cargar usuarios de Sistemas
  useEffect(() => {
    const cargarUsuariosSistemas = async () => {
      try {
        setLoadingUsuarios(true);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(`${API_BASE_URL_CORE}/flujos-salida/usuarios-sistemas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsuariosSistemas(data.usuarios || []);
          // Si solo hay un usuario, seleccionarlo automáticamente
          if (data.usuarios && data.usuarios.length === 1) {
            setUsuarioSistemasSeleccionado(data.usuarios[0].id);
          }
        } else {
          console.error('Error al cargar usuarios de Sistemas');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    cargarUsuariosSistemas();
  }, []);

  useEffect(() => {
    const cargarLineas = async () => {
      try {
        setLoadingLineas(true);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (response.ok) {
          const data = await response.json();
          setLineasDisponibles((data.lineas || []).map((l: any) => l.nombre));
        } else {
          setLineasDisponibles([]);
        }
      } catch (error) {
        console.error('Error al cargar líneas:', error);
        setLineasDisponibles([]);
      } finally {
        setLoadingLineas(false);
      }
    };

    cargarLineas();
  }, []);

  const handleFiltroChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilaChange = (index: number, campo: keyof FlujoSalidaRow, valor: string) => {
    setFilas((prev) => {
      const nuevas = [...prev];
      nuevas[index] = {
        ...nuevas[index],
        [campo]: valor
      };
      return nuevas;
    });
  };

  const agregarFila = () => {
    if (isReadOnly) {
      return;
    }
    setFilas((prev) => [...prev, crearFilaVacia(filtros)]);
  };

  const eliminarFila = (index: number) => {
    if (isReadOnly) {
      return;
    }
    setFilas((prev) => prev.filter((_, filaIndex) => filaIndex !== index));
  };

  const limpiarTodo = () => {
    if (isReadOnly) {
      return;
    }
    setFiltros(filtrosIniciales);
    setFilas([crearFilaVacia(filtrosIniciales)]);
  };

  const guardarListado = async () => {
    if (isReadOnly) {
      return;
    }
    // Validar usuario de Sistemas seleccionado
    if (!usuarioSistemasSeleccionado) {
      alert('⚠️ Por favor selecciona un usuario de Sistemas para enviar el flujo.');
      return;
    }

    // Validar que haya al menos una fila
    if (filas.length === 0) {
      alert('⚠️ Debes agregar al menos una fila para guardar.');
      return;
    }

    // Filtrar filas con datos completos obligatorios
    const filasConDatos = filas.filter(
      (fila) => {
        // Validar campos obligatorios
        if (!fila.anio || !fila.mes || !fila.semana || !fila.dia || !fila.fecha || !fila.linea || !fila.ficha) {
          return false;
        }
        
        // Validar que prendasEnviadas sea un número válido mayor a 0
        const prendas = parseInt(fila.prendasEnviadas);
        if (!prendas || prendas <= 0 || isNaN(prendas)) {
          return false;
        }
        
        return true;
      }
    );

    if (filasConDatos.length === 0) {
      alert('⚠️ Completa al menos una fila con la información obligatoria:\n\n' +
            '• Año, Mes, Semana, Día\n' +
            '• Fecha\n' +
            '• Línea\n' +
            '• Ficha\n' +
            '• Prendas enviadas (número mayor a 0)');
      return;
    }

    // Validar fechas
    const fechasInvalidas = filasConDatos.filter(fila => {
      const fecha = new Date(fila.fecha);
      return isNaN(fecha.getTime());
    });

    if (fechasInvalidas.length > 0) {
      alert('⚠️ Algunas fechas no son válidas. Por favor, verifica las fechas ingresadas.');
      return;
    }

    // Preparar datos para enviar
    const datosParaEnviar = {
      usuario_sistemas_id: usuarioSistemasSeleccionado,
      filtros,
      filas: filasConDatos.map(fila => ({
        ...fila,
        prendasEnviadas: parseInt(fila.prendasEnviadas)
      }))
    };

    setEnviando(true);
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/flujos-salida/enviar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });

      const result = await response.json();

      if (response.ok) {
        const usuarioDestino = usuariosSistemas.find(u => u.id === usuarioSistemasSeleccionado);
        alert(`✅ Flujo de salida enviado exitosamente a:\n\n` +
              `${usuarioDestino?.nombre_completo || 'Usuario de Sistemas'}\n` +
              `${usuarioDestino?.email || ''}\n\n` +
              `Total de filas: ${filasConDatos.length}`);
        
        // Limpiar formulario
        limpiarTodo();
        setUsuarioSistemasSeleccionado('');
      } else {
        alert(`❌ Error: ${result.message || 'No se pudo enviar el flujo de salida'}`);
      }
    } catch (error: any) {
      console.error('Error al enviar flujo:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message || 'Verifica que el backend esté corriendo'}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🚚 Flujo de Salida</h1>
        <p className="text-gray-600 mt-2">
          Gestiona múltiples registros del flujo de salida en un mismo cuadro con filtros por línea, año, mes y semana.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
        {/* Selección de Usuario de Sistemas */}
        <section className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-bold text-blue-900 mb-2">
            👤 Usuario de Sistemas Destino: <span className="text-red-500">*</span>
          </label>
          {loadingUsuarios ? (
            <p className="text-sm text-gray-500">Cargando usuarios...</p>
          ) : (
            <select
              value={usuarioSistemasSeleccionado}
              onChange={(e) => setUsuarioSistemasSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">-- Selecciona un usuario de Sistemas --</option>
              {usuariosSistemas.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre_completo} - {usuario.email}
                </option>
              ))}
            </select>
          )}
          {usuarioSistemasSeleccionado && (
            <p className="mt-2 text-sm text-blue-700">
              ✅ Flujo será enviado a: <strong>{usuariosSistemas.find(u => u.id === usuarioSistemasSeleccionado)?.nombre_completo}</strong> ({usuariosSistemas.find(u => u.id === usuarioSistemasSeleccionado)?.email})
            </p>
          )}
          {usuariosSistemas.length === 0 && !loadingUsuarios && (
            <p className="mt-2 text-sm text-yellow-600">
              ⚠️ No se encontraron usuarios de Sistemas. Contacta al administrador del sistema.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros operativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Línea</label>
              <select
                name="linea"
                value={filtros.linea}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {lineasDisponibles.map((linea) => (
                  <option key={linea} value={linea}>
                    {linea}
                  </option>
                ))}
              </select>
              {loadingLineas && (
                <p className="mt-1 text-xs text-gray-500">Cargando líneas...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
              <input
                type="number"
                name="anio"
                value={filtros.anio}
                onChange={handleFiltroChange}
                min="2000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
              <select
                name="mes"
                value={filtros.mes}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semana</label>
              <select
                name="semana"
                value={filtros.semana}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {semanas.map((semana) => (
                  <option key={semana} value={semana}>
                    Semana {semana}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Día</label>
              <select
                name="dia"
                value={filtros.dia}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {diasSemana.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registro de salidas</h2>
            {!isReadOnly && (
              <button
                type="button"
                onClick={agregarFila}
                className="px-4 py-2 rounded-lg bg-secondary-600 text-white font-semibold hover:bg-secondary-700 transition-colors"
              >
                + Agregar fila
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-secondary-50">
                <tr className="text-left text-sm font-semibold text-secondary-800">
                  <th className="px-3 py-3 border-b border-gray-200">Año</th>
                  <th className="px-3 py-3 border-b border-gray-200">Mes</th>
                  <th className="px-3 py-3 border-b border-gray-200">Semana</th>
                  <th className="px-3 py-3 border-b border-gray-200">Día</th>
                  <th className="px-3 py-3 border-b border-gray-200">Fecha</th>
                  <th className="px-3 py-3 border-b border-gray-200">Línea</th>
                  <th className="px-3 py-3 border-b border-gray-200">Ficha</th>
                  <th className="px-3 py-3 border-b border-gray-200">Prendas enviadas</th>
                  <th className="px-3 py-3 border-b border-gray-200">T.ST</th>
                  <th className="px-3 py-3 border-b border-gray-200">Estatus</th>
                  <th className="px-3 py-3 border-b border-gray-200">Observaciones</th>
                  <th className="px-3 py-3 border-b border-gray-200">Bajada</th>
                  <th className="px-3 py-3 border-b border-gray-200 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {filas.map((fila, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="number"
                        min="2000"
                        value={fila.anio}
                        onChange={(event) => handleFilaChange(index, 'anio', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <select
                        value={fila.mes}
                        onChange={(event) => handleFilaChange(index, 'mes', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      >
                        <option value="">Mes</option>
                        {meses.map((mes) => (
                          <option key={mes.value} value={mes.value}>
                            {mes.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <select
                        value={fila.semana}
                        onChange={(event) =>
                          handleFilaChange(index, 'semana', event.target.value)
                        }
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      >
                        <option value="">Sem</option>
                        {semanas.map((semana) => (
                          <option key={semana} value={semana}>
                            {semana}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <select
                        value={fila.dia}
                        onChange={(event) => handleFilaChange(index, 'dia', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      >
                        <option value="">Día</option>
                        {diasSemana.map((dia) => (
                          <option key={dia.value} value={dia.value}>
                            {dia.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="date"
                        value={fila.fecha}
                        onChange={(event) => handleFilaChange(index, 'fecha', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <select
                        value={fila.linea}
                        onChange={(event) => handleFilaChange(index, 'linea', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      >
                        <option value="">Línea</option>
                        {lineasDisponibles.map((linea) => (
                          <option key={linea} value={linea}>
                            {linea}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Ficha"
                        value={fila.ficha}
                        onChange={(event) => handleFilaChange(index, 'ficha', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="number"
                        min="1"
                        placeholder="0"
                        value={fila.prendasEnviadas}
                        onChange={(event) => {
                          const valor = event.target.value;
                          // Solo permitir números positivos
                          if (valor === '' || (parseInt(valor) >= 0 && !isNaN(parseInt(valor)))) {
                            handleFilaChange(index, 'prendasEnviadas', valor);
                          }
                        }}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="T.ST"
                        value={fila.tStd}
                        onChange={(event) => handleFilaChange(index, 'tStd', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Estatus"
                        value={fila.estatus}
                        onChange={(event) => handleFilaChange(index, 'estatus', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Observación"
                        value={fila.observacion}
                        onChange={(event) =>
                          handleFilaChange(index, 'observacion', event.target.value)
                        }
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Bajada"
                        value={fila.bajada}
                        onChange={(event) => handleFilaChange(index, 'bajada', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 text-center">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => eliminarFila(index)}
                          className="px-3 py-1 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors"
                          disabled={filas.length === 1}
                        >
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {!isReadOnly && (
          <div className="flex flex-col md:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={limpiarTodo}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Limpiar todo
            </button>
            <button
              type="button"
              onClick={guardarListado}
              disabled={enviando || !usuarioSistemasSeleccionado}
              className="px-6 py-3 rounded-lg bg-secondary-600 text-white font-semibold hover:bg-secondary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {enviando ? '⏳ Enviando...' : '📤 Enviar a Sistemas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngenieriaFichaSalidaPage;


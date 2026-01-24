import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface FlujoIngresoRow {
  fecha: string;
  linea: string;
  ficha: string;
  op: string;
  cliente: string;
  estiloCliente: string;
  color: string;
  prendas: string;
  tStd: string;
  estatus: string;
  observacion: string;
}

interface FiltrosFlujoIngreso {
  anio: string;
  mes: string;
  semana: string;
  linea: string;
}

const lineasDisponibles = [
  'A&C - CHINCHA GREEN',
  'A&C 2 - CHINCHA GREEN',
  'A&C 3 - CHINCHA GREEN',
  'A&C 4 - CHINCHA GREEN',
  'D&M - CHINCHA GREEN',
  'ELENA TEX - CHINCHA GREEN',
  'EMANUEL - CHINCHA GREEN',
  'EMANUEL 2 - CHINCHA GREEN',
  'JFL STYLE - CHINCHA GREEN',
  'JUANA ZEA - CHINCHA GREEN',
  'M&L - CHINCHA GREEN',
  'M&L 2 - CHINCHA GREEN',
  'VELASQUEZ - CHINCHA GREEN'
];

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

const crearFilaVacia = (lineaPorDefecto: string): FlujoIngresoRow => ({
  fecha: new Date().toISOString().split('T')[0],
  linea: lineaPorDefecto,
  ficha: '',
  op: '',
  cliente: '',
  estiloCliente: '',
  color: '',
  prendas: '',
  tStd: '',
  estatus: '',
  observacion: ''
});

const IngenieriaFichaEntregaPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const hoy = useMemo(() => new Date(), []);
  const filtrosIniciales: FiltrosFlujoIngreso = {
    anio: hoy.getFullYear().toString(),
    mes: (hoy.getMonth() + 1).toString().padStart(2, '0'),
    semana: '',
    linea: ''
  };

  const [filtros, setFiltros] = useState<FiltrosFlujoIngreso>(filtrosIniciales);
  const [filas, setFilas] = useState<FlujoIngresoRow[]>([crearFilaVacia(filtrosIniciales.linea)]);

  const semanas = useMemo(
    () =>
      Array.from({ length: 53 }, (_, index) => {
        const numero = index + 1;
        return numero.toString().padStart(2, '0');
      }),
    []
  );

  const handleFiltroChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilaChange = (index: number, campo: keyof FlujoIngresoRow, valor: string) => {
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
    setFilas((prev) => [...prev, crearFilaVacia(filtros.linea)]);
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
    setFilas([crearFilaVacia('')]);
  };

  const guardarListado = () => {
    if (isReadOnly) {
      return;
    }
    const filasConDatos = filas.filter(
      (fila) => fila.fecha && fila.linea && fila.ficha && fila.cliente && fila.prendas
    );

    if (filasConDatos.length === 0) {
      alert('⚠️ Debes completar al menos una fila con información obligatoria.');
      return;
    }

    console.log('✅ Flujo de ingreso listo para guardar:', {
      filtros,
      filas: filasConDatos
    });
    alert('✅ Flujo de ingreso preparado. Revisa la consola para ver el detalle.');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📄 Flujo de Ingreso</h1>
        <p className="text-gray-600 mt-2">
          Registra múltiples ingresos en un solo cuadro, clasificando la información por línea, año, mes y semana operativa.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros operativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Línea</label>
              <select
                name="linea"
                value={filtros.linea}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {lineasDisponibles.map((linea) => (
                  <option key={linea} value={linea}>
                    {linea}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
              <input
                type="number"
                name="anio"
                value={filtros.anio}
                onChange={handleFiltroChange}
                min="2000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
              <select
                name="mes"
                value={filtros.mes}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {semanas.map((semana) => (
                  <option key={semana} value={semana}>
                    Semana {semana}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registro de ingresos</h2>
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
                  <th className="px-3 py-3 border-b border-gray-200">Fecha</th>
                  <th className="px-3 py-3 border-b border-gray-200">Línea</th>
                  <th className="px-3 py-3 border-b border-gray-200">Ficha</th>
                  <th className="px-3 py-3 border-b border-gray-200">OP</th>
                  <th className="px-3 py-3 border-b border-gray-200">Cliente</th>
                  <th className="px-3 py-3 border-b border-gray-200">Estilo Cliente</th>
                  <th className="px-3 py-3 border-b border-gray-200">Color</th>
                  <th className="px-3 py-3 border-b border-gray-200">Prendas</th>
                  <th className="px-3 py-3 border-b border-gray-200">T_STD</th>
                  <th className="px-3 py-3 border-b border-gray-200">Estatus</th>
                  <th className="px-3 py-3 border-b border-gray-200">Observación</th>
                  <th className="px-3 py-3 border-b border-gray-200 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {filas.map((fila, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="date"
                        value={fila.fecha}
                        onChange={(event) => handleFilaChange(index, 'fecha', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <select
                        value={fila.linea}
                        onChange={(event) => handleFilaChange(index, 'linea', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecciona</option>
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
                        placeholder="Ej: 83656"
                        value={fila.ficha}
                        onChange={(event) => handleFilaChange(index, 'ficha', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="OP"
                        value={fila.op}
                        onChange={(event) => handleFilaChange(index, 'op', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Cliente"
                        value={fila.cliente}
                        onChange={(event) =>
                          handleFilaChange(index, 'cliente', event.target.value)
                        }
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Estilo"
                        value={fila.estiloCliente}
                        onChange={(event) =>
                          handleFilaChange(index, 'estiloCliente', event.target.value)
                        }
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Color"
                        value={fila.color}
                        onChange={(event) => handleFilaChange(index, 'color', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={fila.prendas}
                        onChange={(event) => handleFilaChange(index, 'prendas', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="T_STD"
                        value={fila.tStd}
                        onChange={(event) => handleFilaChange(index, 'tStd', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Estatus"
                        value={fila.estatus}
                        onChange={(event) => handleFilaChange(index, 'estatus', event.target.value)}
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-2 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="px-6 py-3 rounded-lg bg-secondary-600 text-white font-semibold hover:bg-secondary-700 transition-colors"
            >
              Guardar flujo de ingreso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngenieriaFichaEntregaPage;


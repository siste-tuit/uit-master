import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import API_BASE_URL_CORE from '../../config/api';

interface LineaProduccion {
  id: string;
  nombre: string;
  usuarios: string[];
  produccionActual: number;
  produccionObjetivo: number;
  eficiencia: number;
  status: 'activa' | 'mantenimiento' | 'detenida';
}

const IngenieriaDashboard: React.FC = () => {
  const [lineasProduccion, setLineasProduccion] = useState<LineaProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<LineaProduccion | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [formData, setFormData] = useState({
    cantidad_producida: '',
    cantidad_objetivo: '2000',
    cantidad_defectuosa: '0',
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
    estado: 'activa' as 'activa' | 'mantenimiento' | 'detenida'
  });
  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtener datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_CORE}/produccion/ingenieria`);
        if (response.ok) {
          const data = await response.json();
          setLineasProduccion(data.lineas || []);
        } else {
          console.warn('⚠️ Error al obtener datos del servidor:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error al conectar con el servidor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Datos de líneas de producción textil (fallback)
  const lineasFallback: LineaProduccion[] = [
    {
      id: '1',
      nombre: 'A&C - CHINCHA GREEN',
      usuarios: ['Juan Pérez', 'María González'],
      produccionActual: 1850,
      produccionObjetivo: 2000,
      eficiencia: 92.5,
      status: 'activa',
    },
    {
      id: '2',
      nombre: 'A&C 2 - CHINCHA GREEN',
      usuarios: ['Carlos Ramírez', 'Ana Martínez'],
      produccionActual: 1720,
      produccionObjetivo: 2000,
      eficiencia: 86.0,
      status: 'activa',
    },
    {
      id: '3',
      nombre: 'A&C 3 - CHINCHA GREEN',
      usuarios: ['Luis Sánchez', 'Patricia López'],
      produccionActual: 1920,
      produccionObjetivo: 2000,
      eficiencia: 96.0,
      status: 'activa',
    },
    {
      id: '4',
      nombre: 'A&C 4 - CHINCHA GREEN',
      usuarios: ['Roberto Torres'],
      produccionActual: 1680,
      produccionObjetivo: 2000,
      eficiencia: 84.0,
      status: 'activa',
    },
    {
      id: '5',
      nombre: 'D&M - CHINCHA GREEN',
      usuarios: ['Carmen Vega', 'Fernando Díaz'],
      produccionActual: 1950,
      produccionObjetivo: 2000,
      eficiencia: 97.5,
      status: 'activa',
    },
    {
      id: '6',
      nombre: 'ELENA TEX - CHINCHA GREEN',
      usuarios: ['Sandra Morales'],
      produccionActual: 1890,
      produccionObjetivo: 2000,
      eficiencia: 94.5,
      status: 'activa',
    },
    {
      id: '7',
      nombre: 'JFL STYLE - CHINCHA GREEN',
      usuarios: ['Miguel Herrera', 'Laura Jiménez'],
      produccionActual: 1760,
      produccionObjetivo: 2000,
      eficiencia: 88.0,
      status: 'activa',
    },
    {
      id: '8',
      nombre: 'JUANA ZEA - CHINCHA GREEN',
      usuarios: ['Pedro Castro'],
      produccionActual: 0,
      produccionObjetivo: 2000,
      eficiencia: 0,
      status: 'mantenimiento',
    },
    {
      id: '9',
      nombre: 'M&L - CHINCHA GREEN',
      usuarios: ['Elena Ruiz', 'Diego Moreno'],
      produccionActual: 1840,
      produccionObjetivo: 2000,
      eficiencia: 92.0,
      status: 'activa',
    },
    {
      id: '10',
      nombre: 'M&L 2 - CHINCHA GREEN',
      usuarios: ['Gabriela Paredes'],
      produccionActual: 1810,
      produccionObjetivo: 2000,
      eficiencia: 90.5,
      status: 'activa',
    },
    {
      id: '11',
      nombre: 'VELASQUEZ - CHINCHA GREEN',
      usuarios: ['Ricardo Valdez', 'Monica Soto'],
      produccionActual: 1880,
      produccionObjetivo: 2000,
      eficiencia: 94.0,
      status: 'activa',
    },
  ];

  // Usar datos del backend o fallback
  const lineas = lineasProduccion.length > 0 ? lineasProduccion : lineasFallback;

  // Función para abrir modal de registro
  const handleRegistrarProduccion = (linea: LineaProduccion) => {
    setLineaSeleccionada(linea);
    setFormData({
      cantidad_producida: linea.produccionActual.toString(),
      cantidad_objetivo: linea.produccionObjetivo.toString(),
      cantidad_defectuosa: '0',
      fecha: new Date().toISOString().split('T')[0],
      notas: '',
      estado: linea.status
    });
    setShowModal(true);
  };

  // Función para guardar producción
  const handleGuardarProduccion = async () => {
    if (!lineaSeleccionada || !formData.cantidad_producida || !formData.cantidad_objetivo) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar que la fecha esté en formato correcto
    if (!formData.fecha) {
      alert('Por favor selecciona una fecha');
      return;
    }

    // Validar que la cantidad producida no sea negativa
    const cantidadProducida = parseInt(formData.cantidad_producida) || 0;
    const cantidadDefectuosa = parseInt(formData.cantidad_defectuosa) || 0;
    const cantidadObjetivo = parseInt(formData.cantidad_objetivo) || 2000;

    if (cantidadDefectuosa > cantidadProducida) {
      alert('La cantidad defectuosa no puede ser mayor que la cantidad producida');
      return;
    }

    // Calcular cantidad neta (producida - defectuosa)
    const cantidadNeta = cantidadProducida - cantidadDefectuosa;

    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const fechaFormateada = formData.fecha.includes('T') 
      ? formData.fecha.split('T')[0] 
      : formData.fecha;

    try {
      const requestBody = {
        linea_id: lineaSeleccionada.id,
        fecha: fechaFormateada,
        cantidad_producida: cantidadNeta, // Enviar cantidad neta (producida - defectuosa)
        cantidad_objetivo: cantidadObjetivo,
        cantidad_defectuosa: cantidadDefectuosa,
        notas: formData.notas || null,
        estado: formData.estado
      };

      console.log('Enviando datos:', requestBody);

      // Registrar la producción (el estado se actualiza dentro del mismo endpoint)
      const response = await fetch(`${API_BASE_URL_CORE}/produccion/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('✅ Producción registrada y estado actualizado exitosamente');
        setShowModal(false);
        // Recargar datos
        const dataResponse = await fetch(`${API_BASE_URL_CORE}/produccion/ingenieria`);
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setLineasProduccion(data.lineas);
        }
      } else {
        console.error('Error del servidor:', responseData);
        alert(`❌ Error: ${responseData.message || 'No se pudo registrar la producción'}`);
      }
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message || 'Verifica que el backend esté corriendo en el puerto 5000'}`);
    }
  };

  // Calcular métricas generales
  const totalProduccion = lineas.reduce((sum, l) => sum + l.produccionActual, 0);
  const lineasActivas = lineas.filter(l => l.status === 'activa').length;
  const eficienciaPromedio = lineasActivas > 0
    ? Math.round(
        lineas.filter(l => l.status === 'activa').reduce((sum, l) => sum + l.eficiencia, 0) / lineasActivas
      )
    : 0;

  // Datos para gráfico de barras
  const datosGraficoBarras = lineas.map(l => ({
    nombre: l.nombre.replace(' - CHINCHA GREEN', ''),
    produccion: l.produccionActual,
    objetivo: l.produccionObjetivo,
    eficiencia: l.eficiencia,
  }));

  // Datos para gráfico de tendencia (últimos 7 días)
  const datosGraficoTendencia = [
    { fecha: 'Lun', produccion: 17800 },
    { fecha: 'Mar', produccion: 18200 },
    { fecha: 'Mié', produccion: 17500 },
    { fecha: 'Jue', produccion: 18900 },
    { fecha: 'Vie', produccion: 18500 },
    { fecha: 'Sáb', produccion: 19200 },
    { fecha: 'Dom', produccion: totalProduccion },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'detenida':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activa':
        return '✅';
      case 'mantenimiento':
        return '🔧';
      case 'detenida':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'activa':
        return 'Activa';
      case 'mantenimiento':
        return 'Mantenimiento';
      case 'detenida':
        return 'Deshabilitada';
      default:
        return status;
    }
  };

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 95) return '#10B981'; // Verde
    if (eficiencia >= 85) return '#3B82F6'; // Azul
    if (eficiencia >= 70) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🔧 Dashboard de Ingeniería</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Monitoreo de producción por línea textil y asignación de usuarios.</p>
      </div>

      {/* KPIs Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-4 xl:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-2">Producción Total Diaria</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalProduccion.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-80">unidades producidas</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-2">Eficiencia Promedio</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{eficienciaPromedio}%</p>
          <p className="text-xs mt-2 opacity-80">líneas activas</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-2">Líneas Operativas</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{lineasActivas}/{lineas.length}</p>
          <p className="text-xs mt-2 opacity-80">en funcionamiento</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-4 xl:gap-6 mb-6 sm:mb-8">
        {/* Gráfico de Barras - Producción por Línea */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Producción por Línea</h2>
          <div className="h-64 sm:h-72 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGraficoBarras} margin={{ top: 5, right: 5, left: -10, bottom: isMobile ? 80 : 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={isMobile ? -90 : -45}
                  textAnchor={isMobile ? "middle" : "end"}
                  height={isMobile ? 120 : 80}
                  interval={isMobile ? "preserveStartEnd" : 0}
                  tick={{ fontSize: isMobile ? 9 : 10 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="produccion" name="Producción Actual" fill="#1A5632" radius={[8, 8, 0, 0]} />
                <Bar dataKey="objetivo" name="Objetivo" fill="#94A3B8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Líneas - Tendencia Semanal */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Tendencia de Producción</h2>
          <div className="h-64 sm:h-72 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGraficoTendencia} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: isMobile ? 10 : 11 }} />
                <YAxis tick={{ fontSize: isMobile ? 10 : 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="produccion" 
                  name="Producción Total" 
                  stroke="#1A5632" 
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ fill: '#1A5632', strokeWidth: 2, r: isMobile ? 4 : 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Líneas de Producción */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Líneas de Producción Textil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lineas.map((linea) => (
            <div 
              key={linea.id} 
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-shadow"
            >
              {/* Encabezado */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 truncate">{linea.nombre}</h3>
                  <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold rounded-full border ${getStatusColor(linea.status)}`}>
                    <span>{getStatusIcon(linea.status)}</span>
                    <span className="truncate">{getStatusTexto(linea.status).replace(/[✅🔧🔴]/g, '').trim()}</span>
                  </span>
                </div>
              </div>

              {/* Usuarios Asignados */}
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">👥 Usuarios:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {linea.usuarios.map((usuario, idx) => (
                    <span key={idx} className="px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-xs rounded-full truncate max-w-full">
                      {usuario}
                    </span>
                  ))}
                </div>
              </div>

              {/* Producción */}
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">📊 Producción:</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-bold text-gray-900">{linea.produccionActual.toLocaleString()} unidades</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="text-gray-700">{linea.produccionObjetivo.toLocaleString()} unidades</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${linea.status === 'activa' ? linea.eficiencia : 0}%`,
                        backgroundColor: getEficienciaColor(linea.eficiencia)
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Eficiencia</span>
                    <span className="font-bold" style={{ color: getEficienciaColor(linea.eficiencia) }}>
                      {linea.status === 'activa' ? `${linea.eficiencia}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para registrar producción */}
              <button
                onClick={() => handleRegistrarProduccion(linea)}
                className="w-full mt-3 sm:mt-4 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={linea.status === 'detenida'}
              >
                📝 Registrar Producción
              </button>
          </div>
        ))}
        </div>
      </div>

      {/* Modal para registrar producción */}
      {showModal && lineaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-lg mx-auto overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 pr-2 sm:pr-4 flex-1 min-w-0">
                <span className="block sm:inline">Registrar Producción</span>
                <span className="block sm:inline text-sm sm:text-base text-gray-600 mt-1 sm:mt-0 sm:ml-1">- {lineaSeleccionada.nombre}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Fecha: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Objetivo (unidades): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.cantidad_objetivo}
                  onChange={(e) => setFormData({ ...formData, cantidad_objetivo: e.target.value })}
                  min="1"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: 2000"
                />
                <p className="text-xs text-gray-500 mt-1">Meta de producción para esta línea</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Cantidad Producida (unidades): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.cantidad_producida}
                  onChange={(e) => setFormData({ ...formData, cantidad_producida: e.target.value })}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: 1850"
                />
                <p className="text-xs text-gray-500 mt-1">Total de unidades producidas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Defectuosa (unidades):
                </label>
                <input
                  type="number"
                  value={formData.cantidad_defectuosa}
                  onChange={(e) => {
                    const defectuosa = e.target.value;
                    const producida = parseInt(formData.cantidad_producida) || 0;
                    if (defectuosa && parseInt(defectuosa) > producida) {
                      alert('La cantidad defectuosa no puede ser mayor que la producida');
                      return;
                    }
                    setFormData({ ...formData, cantidad_defectuosa: defectuosa });
                  }}
                  min="0"
                  max={formData.cantidad_producida || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad que se descontará de la producción
                  {formData.cantidad_producida && (
                    <span className="block mt-1 font-semibold text-green-600">
                      Producción neta: {parseInt(formData.cantidad_producida) - (parseInt(formData.cantidad_defectuosa) || 0)} unidades
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Línea: <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'activa' | 'mantenimiento' | 'detenida' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="activa">🟢 ACTIVA</option>
                  <option value="mantenimiento">🟡 MANTENIMIENTO</option>
                  <option value="detenida">🔴 DESHABILITADA</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.estado === 'activa' && 'Línea operativa y en producción'}
                  {formData.estado === 'mantenimiento' && 'Línea en mantenimiento temporal'}
                  {formData.estado === 'detenida' && 'Línea deshabilitada'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional):
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Observaciones sobre la producción..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleGuardarProduccion}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 sm:py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 sm:py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngenieriaDashboard;

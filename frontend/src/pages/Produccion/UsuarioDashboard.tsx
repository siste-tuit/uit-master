import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL_CORE from '../../config/api';

interface EstadisticasHoy {
  fecha: string;
  producido: number;
  defectuoso: number;
  neto: number;
}

interface EstadisticaDiaria {
  fecha: string;
  producido: number;
  defectuoso: number;
  neto: number;
}

interface EstadisticaSemanal {
  semana: number;
  fechaInicio: string;
  fechaFin: string;
  producido: number;
  defectuoso: number;
  neto: number;
  reportes: number;
}

interface EstadisticaMensual {
  año: number;
  mes: number;
  nombreMes: string;
  producido: number;
  defectuoso: number;
  neto: number;
  reportes: number;
}

interface EstadisticasData {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    linea_id: string | null;
    linea_nombre: string | null;
  };
  estadisticas: {
    hoy: EstadisticasHoy;
    diarias: EstadisticaDiaria[];
    semanales: EstadisticaSemanal[];
    mensuales: EstadisticaMensual[];
  };
  totales: {
    producido: number;
    defectuoso: number;
    neto: number;
    porcentajeCalidad: number;
    totalReportes: number;
  };
}

const UsuarioDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(
          `${API_BASE_URL_CORE}/reportes-produccion/estadisticas/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener las estadísticas');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [user?.id]);

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
          <h1 className="mb-2 text-3xl font-bold">Dashboard Usuario</h1>
          <p className="text-green-100">Panel de control para operadores de producción</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
          <h1 className="mb-2 text-3xl font-bold">Dashboard Usuario</h1>
          <p className="text-green-100">Panel de control para operadores de producción</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error || 'No se pudieron cargar las estadísticas'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="p-6 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
        <h1 className="mb-2 text-3xl font-bold">Dashboard Usuario</h1>
        <p className="text-green-100">Panel de control para operadores de producción</p>
        {data.usuario.linea_nombre && (
          <p className="mt-2 text-lg font-semibold">📍 Línea: {data.usuario.linea_nombre}</p>
        )}
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Producido</p>
          <p className="text-3xl font-bold text-green-600">{data.totales.producido.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Defectuoso</p>
          <p className="text-3xl font-bold text-red-600">{data.totales.defectuoso.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Neto</p>
          <p className="text-3xl font-bold text-blue-600">{data.totales.neto.toLocaleString('es-PE')}</p>
          <p className="text-xs text-gray-400 mt-1">unidades</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Calidad</p>
          <p className="text-3xl font-bold text-purple-600">{data.totales.porcentajeCalidad.toFixed(1)}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${data.totales.porcentajeCalidad >= 90 ? 'bg-green-500' : data.totales.porcentajeCalidad >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(data.totales.porcentajeCalidad, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estadísticas del Día Actual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Producción de Hoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Producido</p>
            <p className="text-2xl font-bold text-green-700">{data.estadisticas.hoy.producido.toLocaleString('es-PE')}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Defectuoso</p>
            <p className="text-2xl font-bold text-red-700">{data.estadisticas.hoy.defectuoso.toLocaleString('es-PE')}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Neto</p>
            <p className="text-2xl font-bold text-blue-700">{data.estadisticas.hoy.neto.toLocaleString('es-PE')}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Producción Diaria (Últimos 7 días) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Producción Diaria (Últimos 7 días)</h2>
        <div className="space-y-4">
          {data.estadisticas.diarias.map((dia, index) => {
            const maxProducido = Math.max(...data.estadisticas.diarias.map(d => d.producido), 1);
            const porcentaje = maxProducido > 0 ? (dia.producido / maxProducido) * 100 : 0;
            const porcentajeDefectuoso = dia.producido > 0 ? (dia.defectuoso / dia.producido) * 100 : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{formatFecha(dia.fecha)}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-600">✓ {dia.producido}</span>
                    <span className="text-red-600">✗ {dia.defectuoso}</span>
                    <span className="text-blue-600 font-semibold">Neto: {dia.neto}</span>
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="absolute left-0 top-0 h-6 bg-green-500 rounded-full"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                  {porcentajeDefectuoso > 0 && (
                    <div
                      className="absolute left-0 top-0 h-6 bg-red-500 rounded-full opacity-70"
                      style={{ width: `${(porcentaje * porcentajeDefectuoso) / 100}%` }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas Semanales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Producción Semanal (Últimas 4 semanas)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.estadisticas.semanales.map((semana, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Semana {semana.semana}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {formatFecha(semana.fechaInicio)} - {formatFecha(semana.fechaFin)}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Producido:</span>
                  <span className="text-sm font-bold text-green-600">{semana.producido.toLocaleString('es-PE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Defectuoso:</span>
                  <span className="text-sm font-bold text-red-600">{semana.defectuoso.toLocaleString('es-PE')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-xs font-semibold text-gray-700">Neto:</span>
                  <span className="text-sm font-bold text-blue-600">{semana.neto.toLocaleString('es-PE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Reportes:</span>
                  <span className="text-sm font-semibold text-gray-700">{semana.reportes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas Mensuales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📆 Producción Mensual (Últimos 6 meses)</h2>
        <div className="space-y-4">
          {data.estadisticas.mensuales.map((mes, index) => {
            const maxProducido = Math.max(...data.estadisticas.mensuales.map(m => m.producido), 1);
            const porcentaje = maxProducido > 0 ? (mes.producido / maxProducido) * 100 : 0;
            const porcentajeCalidad = mes.producido > 0 ? ((mes.neto / mes.producido) * 100) : 0;

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{mes.nombreMes} {mes.año}</p>
                    <p className="text-xs text-gray-500">{mes.reportes} reportes enviados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Calidad</p>
                    <p className={`text-xl font-bold ${porcentajeCalidad >= 90 ? 'text-green-600' : porcentajeCalidad >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {porcentajeCalidad.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Producido: <strong className="text-green-600">{mes.producido.toLocaleString('es-PE')}</strong></span>
                    <span className="text-gray-600">Defectuoso: <strong className="text-red-600">{mes.defectuoso.toLocaleString('es-PE')}</strong></span>
                    <span className="text-gray-600">Neto: <strong className="text-blue-600">{mes.neto.toLocaleString('es-PE')}</strong></span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="absolute left-0 top-0 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsuarioDashboard;

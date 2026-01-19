"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLogs } from '@/context/LogContext'; // Ajusta la ruta de importación

// Definición de tipos adaptada a la vista original
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// Interfaz para LogData del contexto (se usa para el mapeo)
interface LogData {
    id: number;
    timestamp: string; // Formato 'dd/mm/yyyy, HH:ii:ss' de la API
    nivel: string; // ERROR | WARNING | INFO | DEBUG
    fuente: string; // auth | database | api | frontend | system | security
    mensaje: string;
    stack_trace: string | null;
    usuario_id: string | null;
    ip: string | null;
}

// Función de mapeo para adaptar LogData del Contexto a la interfaz LogEntry de la página.
const mapLogDataToLogEntry = (logData: LogData): LogEntry => {
    // La API devuelve: 'dd/mm/yyyy, HH:ii:ss' (LogData.timestamp)
    // Se intenta convertir a un objeto Date lo mejor posible para el front
    const parts = logData.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/);
    let date: Date;

    if (parts) {
        // Formato (YYYY, MM-1, DD, HH, MM, SS)
        date = new Date(
            parseInt(parts[3]), // YYYY
            parseInt(parts[2]) - 1, // MM (0-indexado)
            parseInt(parts[1]), // DD
            parseInt(parts[4]), // HH
            parseInt(parts[5]), // MM
            parseInt(parts[6])  // SS
        );
    } else {
        date = new Date(); // Fallback si el formato es inesperado
    }

    return {
        id: String(logData.id),
        timestamp: date,
        level: logData.nivel.toLowerCase() as 'info' | 'warning' | 'error' | 'debug',
        source: logData.fuente,
        message: logData.mensaje,
        details: logData.stack_trace || undefined,
        userId: logData.usuario_id || undefined,
        ip: logData.ip || undefined,
        userAgent: undefined, // No provisto por la API
    };
};

const LogsPage: React.FC = () => {
    // 1. Usar el hook del contexto para obtener logs, resumen y funciones
    const {
        logs: logsContext,
        summary: summaryContext,
        loadingLogs,
        loadingSummary,
        error,
        fetchLogs,
        fetchSummary,
        createLog,
        NIVELES,
        FUENTES,
    } = useLogs();

    // 2. Mapear los logs del contexto al formato de la página
    const logs = useMemo(() => logsContext.map(mapLogDataToLogEntry), [logsContext]);

    // Estados de UI
    const [filtros, setFiltros] = useState({
        level: 'todos',
        source: 'todos',
        fechaInicio: '',
        fechaFin: '',
        busqueda: ''
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const [logsPorPagina] = useState(50);
    const [logsEnTiempoReal, setLogsEnTiempoReal] = useState(false);

    // 3. Reemplazar la lógica de fetch y aplicar filtros a la API
    const handleFetchLogs = useCallback(() => {
        // Preparar filtros para la API
        const apiFilters: { [key: string]: string } = {};

        if (filtros.level !== 'todos') apiFilters.nivel = filtros.level.toUpperCase();
        if (filtros.source !== 'todos') apiFilters.fuente = filtros.source;
        // Los filtros de fecha solo se envían a la API, no se usan en el filtro local
        if (filtros.fechaInicio) apiFilters.fecha_inicio = filtros.fechaInicio.split('T')[0];
        if (filtros.fechaFin) apiFilters.fecha_fin = filtros.fechaFin.split('T')[0];

        fetchLogs(apiFilters);
    }, [filtros.level, filtros.source, filtros.fechaInicio, filtros.fechaFin, fetchLogs]);

    // Ejecutar el fetch cuando los filtros relevantes cambian
    useEffect(() => {
        handleFetchLogs();
    }, [handleFetchLogs]);


    // Simular logs en tiempo real (manteniendo la simulación local)
    useEffect(() => {
        if (!logsEnTiempoReal) return;

        const interval = setInterval(() => {
            // En una aplicación real, se usaría WebSockets.
            // Aquí, simplemente recargamos el summary para ver si hay logs nuevos.
            fetchSummary();
        }, 5000);

        return () => clearInterval(interval);
    }, [logsEnTiempoReal, fetchSummary]);


    // Lógica de estilos y paginación se mantiene igual
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'debug': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'auth': return 'bg-purple-100 text-purple-800';
            case 'database': return 'bg-green-100 text-green-800';
            case 'api': return 'bg-blue-100 text-blue-800';
            case 'frontend': return 'bg-orange-100 text-orange-800';
            case 'system': return 'bg-gray-100 text-gray-800';
            case 'security': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // La búsqueda local por palabra clave se mantiene, ya que la API no la soporta
    const logsFiltrados = logs.filter(log => {
        // Los filtros de level/source ya fueron aplicados por la API
        
        // Filtro de búsqueda local
        if (filtros.busqueda && !log.message.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
        
        // La API ya filtró por fecha, pero como el control de fecha incluye hora (datetime-local),
        // mantenemos el filtro local solo por si acaso la API no soporta bien el `datetime-local`
        const fechaInicioDate = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
        const fechaFinDate = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
        
        if (fechaInicioDate && log.timestamp < fechaInicioDate) return false;
        if (fechaFinDate && log.timestamp > fechaFinDate) return false;
        
        return true;
    });

    // Paginación local se mantiene
    const totalPaginas = Math.ceil(logsFiltrados.length / logsPorPagina);
    const logsPaginados = logsFiltrados.slice(
        (paginaActual - 1) * logsPorPagina,
        paginaActual * logsPorPagina
    );

    // Estadísticas
    const estadisticas = summaryContext || {
        total: 0,
        errores: 0,
        warnings: 0,
        info: 0,
        debug: 0
    };

    const handleExportarLogs = () => {
        const logsCSV = logsFiltrados.map(log => 
            `${log.timestamp.toISOString()},${log.level},${log.source},${log.message},${log.userId || ''},${log.ip || ''}`
        ).join('\n');
        
        const blob = new Blob([`timestamp,level,source,message,userId,ip\n${logsCSV}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLimpiarLogs = () => {
        if (window.confirm('¿Estás seguro de que quieres limpiar todos los logs? (Esta acción solo es simulada en el front)')) {
            // Nota: Se requiere una función `deleteLogs` en el contexto para hacer esto real
            // setLogs([]); // Si tuviéramos un setLogs local
        }
    };
    
    // Renderizado de carga y error
    if (loadingLogs && logs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
                <p className="text-xl font-medium text-blue-600">Cargando logs del sistema...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen p-6 bg-gray-50">
                <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                    <p className="font-bold">Error al cargar logs:</p>
                    <p>{error}</p>
                    <p className="mt-2 text-sm">Intenta recargar o verifica la conexión a la API.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Registros del Sistema (Logs)</h1>
                <p className="text-gray-600">Monitorea y analiza los registros del sistema en tiempo real</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Logs</p>
                            <p className="text-2xl font-bold text-gray-900">{loadingSummary ? '...' : estadisticas.total}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                            <span className="text-2xl">📋</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Errores</p>
                            <p className="text-2xl font-bold text-red-600">{loadingSummary ? '...' : estadisticas.errores}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                            <span className="text-2xl">❌</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Advertencias</p>
                            <p className="text-2xl font-bold text-yellow-600">{loadingSummary ? '...' : estadisticas.advertencias}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                            <span className="text-2xl">⚠️</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Información</p>
                            <p className="text-2xl font-bold text-blue-600">{loadingSummary ? '...' : estadisticas.informacion}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                            <span className="text-2xl">ℹ️</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Debug</p>
                            <p className="text-2xl font-bold text-gray-600">{loadingSummary ? '...' : estadisticas.debug}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                            <span className="text-2xl">🐛</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y Controles */}
            <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-5">
                    <input
                        type="text"
                        placeholder="Buscar en mensajes..."
                        value={filtros.busqueda}
                        onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />

                    <select
                        value={filtros.level}
                        onChange={(e) => setFiltros({...filtros, level: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="todos">Todos los niveles</option>
                        {NIVELES.map(nivel => (
                            <option key={nivel} value={nivel.toLowerCase()}>{nivel}</option>
                        ))}
                    </select>

                    <select
                        value={filtros.source}
                        onChange={(e) => setFiltros({...filtros, source: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="todos">Todas las fuentes</option>
                        {FUENTES.map(fuente => (
                            <option key={fuente} value={fuente}>{fuente.charAt(0).toUpperCase() + fuente.slice(1)}</option>
                        ))}
                    </select>

                    <input
                        type="date" // Cambiado de datetime-local a date para coincidir con la API
                        value={filtros.fechaInicio}
                        onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />

                    <input
                        type="date" // Cambiado de datetime-local a date para coincidir con la API
                        value={filtros.fechaFin}
                        onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={logsEnTiempoReal}
                                onChange={(e) => setLogsEnTiempoReal(e.target.checked)}
                                className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Tiempo Real</span>
                        </label>
                        <span className="text-sm text-gray-500">
                            Mostrando {logsPaginados.length} de {logsFiltrados.length} logs
                        </span>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleExportarLogs}
                            className="flex items-center px-4 py-2 space-x-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <span>📥</span>
                            <span>Exportar</span>
                        </button>
                        <button
                            onClick={handleLimpiarLogs}
                            className="flex items-center px-4 py-2 space-x-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            <span>🗑️</span>
                            <span>Limpiar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Logs */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Nivel
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Fuente
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Mensaje
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    IP
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logsPaginados.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                        {log.timestamp.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(log.level)}`}>
                                            {log.level.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(log.source)}`}>
                                            {log.source}
                                        </span>
                                    </td>
                                    <td className="max-w-xs px-6 py-4 text-sm text-gray-900">
                                        <div className="truncate" title={log.message}>
                                            {log.message}
                                        </div>
                                        {log.details && (
                                            <div className="mt-1 text-xs text-gray-500 truncate" title={log.details}>
                                                {log.details}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {log.userId || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {log.ip || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Página {paginaActual} de {totalPaginas}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                                    disabled={paginaActual === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                                    disabled={paginaActual === totalPaginas}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {logsPaginados.length === 0 && (
                <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
                        <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No se encontraron logs</h3>
                    <p className="text-gray-500">Intenta ajustar los filtros o verificar la configuración</p>
                </div>
            )}
        </div>
    );
};

export default LogsPage;
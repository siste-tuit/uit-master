import React, { useState, useEffect } from 'react';

interface DocumentoHistorial {
  id: string;
  tipo: 'produccion' | 'reporte';
  fecha: string;
  cliente: string;
  ficha: string;
  descripcion: string;
  datos: any;
}

const IngenieriaHistorialPage: React.FC = () => {
  const [documentos, setDocumentos] = useState<DocumentoHistorial[]>([]);
  const [filtroTiempo, setFiltroTiempo] = useState<'dia' | 'semana' | 'mes' | 'todos'>('todos');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'produccion' | 'reporte'>('todos');

  // Cargar documentos del localStorage al montar
  useEffect(() => {
    const cargarDocumentos = () => {
      const documentosGuardados = localStorage.getItem('historial_documentos');
      if (documentosGuardados) {
        setDocumentos(JSON.parse(documentosGuardados));
      }
    };

    const handleGuardarDocumento = (event: Event) => {
      console.log('Evento guardarDocumento recibido en Historial');
      const customEvent = event as CustomEvent;
      const nuevoDocumento: DocumentoHistorial = customEvent.detail;
      console.log('Nuevo documento recibido:', nuevoDocumento);
      setDocumentos(prev => {
        // Evitar duplicados verificando si el documento ya existe
        const yaExiste = prev.some(doc => doc.id === nuevoDocumento.id);
        if (yaExiste) {
          console.log('Documento ya existe en el historial:', nuevoDocumento.id);
          return prev;
        }
        const updatedDocs = [...prev, nuevoDocumento];
        console.log('Guardando documento en localStorage. Total:', updatedDocs.length);
        localStorage.setItem('historial_documentos', JSON.stringify(updatedDocs));
        return updatedDocs;
      });
    };

    cargarDocumentos();
    window.addEventListener('guardarDocumento', handleGuardarDocumento);

    return () => {
      window.removeEventListener('guardarDocumento', handleGuardarDocumento);
    };
  }, []);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    // Filtro por tipo
    if (tipoFiltro !== 'todos' && doc.tipo !== tipoFiltro) {
      return false;
    }

    // Filtro por tiempo
    const fechaDoc = new Date(doc.fecha);
    const ahora = new Date();

    if (filtroTiempo === 'dia') {
      return fechaDoc.toDateString() === ahora.toDateString();
    }

    if (filtroTiempo === 'semana') {
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - ahora.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      return fechaDoc >= inicioSemana;
    }

    if (filtroTiempo === 'mes') {
      return fechaDoc.getMonth() === ahora.getMonth() && 
             fechaDoc.getFullYear() === ahora.getFullYear();
    }

    return true; // 'todos'
  });

  // Agrupar por fecha
  const documentosAgrupados = documentosFiltrados.reduce((acc, doc) => {
    const fecha = new Date(doc.fecha).toLocaleDateString('es-ES');
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(doc);
    return acc;
  }, {} as Record<string, DocumentoHistorial[]>);

  const verDocumento = (documento: DocumentoHistorial) => {
    alert(`Ver documento: ${documento.descripcion}`);
    console.log('Datos del documento:', documento.datos);
  };

  const eliminarDocumento = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este documento del historial?')) {
      const nuevosDocumentos = documentos.filter(d => d.id !== id);
      localStorage.setItem('historial_documentos', JSON.stringify(nuevosDocumentos));
      setDocumentos(nuevosDocumentos);
      alert('Documento eliminado exitosamente');
    }
  };

  const getTipoIcono = (tipo: string) => {
    return tipo === 'produccion' ? '🏭' : '📊';
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'produccion' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getTipoTexto = (tipo: string) => {
    return tipo === 'produccion' ? 'Orden de Producción' : 'Reporte de Producción';
  };

  const totalDocumentos = documentos.length;
  const totalProduccion = documentos.filter(d => d.tipo === 'produccion').length;
  const totalReportes = documentos.filter(d => d.tipo === 'reporte').length;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Historial de Documentos</h1>
          <p className="text-gray-600 mt-1">Registro completo de órdenes de producción y reportes generados.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Total Documentos</p>
          <p className="text-4xl font-bold">{totalDocumentos}</p>
          <p className="text-xs mt-2 opacity-80">documentos históricos</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Órdenes de Producción</p>
          <p className="text-4xl font-bold">{totalProduccion}</p>
          <p className="text-xs mt-2 opacity-80">documentos guardados</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Reportes Generados</p>
          <p className="text-4xl font-bold">{totalReportes}</p>
          <p className="text-xs mt-2 opacity-80">análisis de producción</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Tiempo
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroTiempo('dia')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filtroTiempo === 'dia'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Día
              </button>
              <button
                onClick={() => setFiltroTiempo('semana')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filtroTiempo === 'semana'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📆 Semana
              </button>
              <button
                onClick={() => setFiltroTiempo('mes')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filtroTiempo === 'mes'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Mes
              </button>
              <button
                onClick={() => setFiltroTiempo('todos')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filtroTiempo === 'todos'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔄 Todos
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFiltro('todos')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tipoFiltro === 'todos'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 Todos
              </button>
              <button
                onClick={() => setTipoFiltro('produccion')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tipoFiltro === 'produccion'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏭 Producción
              </button>
              <button
                onClick={() => setTipoFiltro('reporte')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tipoFiltro === 'reporte'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Reportes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Documentos Agrupados */}
      {Object.keys(documentosAgrupados).length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay documentos</h3>
          <p className="text-gray-600">
            Los documentos generados en Producción y Reportes aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentosAgrupados).map(([fecha, docs]) => (
            <div key={fecha} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  📅 {fecha} <span className="text-sm font-normal text-gray-600">({docs.length} documento{docs.length > 1 ? 's' : ''})</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {docs.map((documento) => (
                  <div key={documento.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`px-3 py-2 rounded-lg ${getTipoColor(documento.tipo)}`}>
                          <span className="text-2xl">{getTipoIcono(documento.tipo)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{getTipoTexto(documento.tipo)}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTipoColor(documento.tipo)}`}>
                              {documento.tipo === 'produccion' ? '🏭 Producción' : '📊 Reporte'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Cliente:</span> {documento.cliente} |{' '}
                            <span className="font-semibold">Ficha:</span> {documento.ficha}
                          </p>
                          <p className="text-sm text-gray-700">{documento.descripcion}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className="text-xs text-gray-500">
                          {new Date(documento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => verDocumento(documento)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => eliminarDocumento(documento.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngenieriaHistorialPage;

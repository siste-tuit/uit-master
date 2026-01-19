import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import API_BASE_URL_CORE from '../../config/api';

interface ReporteGenerado {
  id: string;
  fecha_generacion: string;
  numero_ficha: string;
  numero_pedido: string;
  cliente: string;
  fecha_inicio: string;
  fecha_fin: string;
  linea_produccion: string;
  produccion_datos: { fecha: string; cantidad: number; porcentaje_efectividad: number }[];
  tiempo_total_dias: number;
  cantidad_pedida: number;
  cantidad_confeccionada: number;
  promedio_diario: number;
  efectividad_promedio: number;
  estado: 'atrasado' | 'en_tiempo' | 'adelantado';
}

// Función helper para cargar imágenes
const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

interface LineaProduccion {
  id: string;
  nombre: string;
  status: string;
  usuarios: string[];
}

const IngenieriaReportesPage: React.FC = () => {
  const [formReporte, setFormReporte] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    numero_ficha: '',
    numero_pedido: '',
    cliente: '',
    linea_produccion: '',
    cantidad_pedida: '',
    cantidad_confeccionada: '',
    tiempo_produccion_dias: ''
  });

  const [reporteGenerado, setReporteGenerado] = useState<ReporteGenerado | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [lineasProduccion, setLineasProduccion] = useState<LineaProduccion[]>([]);
  const [loadingLineas, setLoadingLineas] = useState(true);
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);

  // Cargar líneas de producción
  useEffect(() => {
    const fetchLineas = async () => {
      try {
        setLoadingLineas(true);
        const response = await fetch(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Líneas recibidas del backend (Reportes):', data.lineas.length);
          setLineasProduccion(data.lineas || []);
        } else {
          console.error('❌ Error en la respuesta del servidor:', response.status);
        }
      } catch (error) {
        console.error('❌ Error al cargar líneas de producción:', error);
      } finally {
        setLoadingLineas(false);
      }
    };

    fetchLineas();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormReporte(prev => {
      const nuevoEstado = {
        ...prev,
        [name]: value
      };
      
      // Calcular días automáticamente cuando cambian las fechas
      if (name === 'fecha_inicio' || name === 'fecha_fin') {
        if (nuevoEstado.fecha_inicio && nuevoEstado.fecha_fin) {
          const fechaInicio = new Date(nuevoEstado.fecha_inicio);
          const fechaFin = new Date(nuevoEstado.fecha_fin);
          if (fechaFin > fechaInicio) {
            const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
            nuevoEstado.tiempo_produccion_dias = dias.toString();
          } else {
            nuevoEstado.tiempo_produccion_dias = '';
          }
        } else {
          nuevoEstado.tiempo_produccion_dias = '';
        }
      }
      
      return nuevoEstado;
    });
  };

  const generarReporte = () => {
    // Validaciones
    if (!formReporte.numero_ficha || !formReporte.numero_pedido || !formReporte.cliente || 
        !formReporte.fecha_inicio || !formReporte.fecha_fin || !formReporte.linea_produccion ||
        !formReporte.cantidad_pedida || !formReporte.cantidad_confeccionada) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const cantidadPedida = parseInt(formReporte.cantidad_pedida);
    const cantidadConfeccionada = parseInt(formReporte.cantidad_confeccionada);
    const fechaInicio = new Date(formReporte.fecha_inicio);
    const fechaFin = new Date(formReporte.fecha_fin);
    
    // Validar que la fecha fin sea posterior a la fecha inicio
    if (fechaFin <= fechaInicio) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    // Validar que la cantidad confeccionada no exceda la pedida
    if (cantidadConfeccionada > cantidadPedida) {
      alert('La cantidad confeccionada no puede ser mayor que la cantidad pedida');
      return;
    }

    const tiempoTotalDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    const promedioDiario = Math.round(cantidadConfeccionada / tiempoTotalDias);

    // Calcular efectividad basado en la cantidad confeccionada vs pedida
    const porcentajeCumplimiento = Math.round((cantidadConfeccionada / cantidadPedida) * 100);
    
    // Estándar de producción textil: 100 prendas/día es 100% efectividad
    const estandarProduccion = 100; // prendas por día como 100%
    const produccionObjetivo = estandarProduccion * tiempoTotalDias;
    
    // Calcular efectividad basado en la producción real vs objetivo
    const efectividadPromedio = Math.min(100, Math.round((cantidadConfeccionada / produccionObjetivo) * 100));

    // Generar datos diarios simulados basados en el promedio y efectividad
    const produccionDatos = [];
    
    for (let i = 0; i < tiempoTotalDias; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      
      // Simular variación diaria (±20%)
      const variacion = 1 + (Math.random() * 0.4 - 0.2);
      const cantidadDiaria = Math.max(1, Math.round(promedioDiario * variacion));
      
      // Efectividad diaria basada en cantidad vs estándar
      const efectividadDiaria = Math.min(100, Math.round((cantidadDiaria / estandarProduccion) * 100));
      
      produccionDatos.push({
        fecha: fecha.toISOString().split('T')[0],
        cantidad: cantidadDiaria,
        porcentaje_efectividad: efectividadDiaria
      });
    }

    // Ajustar el total para que coincida exactamente con el ingresado
    const totalSimulado = produccionDatos.reduce((sum, d) => sum + d.cantidad, 0);
    const diferencia = cantidadConfeccionada - totalSimulado;
    if (diferencia !== 0 && produccionDatos.length > 0) {
      const ultimoDia = produccionDatos[produccionDatos.length - 1];
      ultimoDia.cantidad += diferencia;
      ultimoDia.porcentaje_efectividad = Math.min(100, Math.round((ultimoDia.cantidad / estandarProduccion) * 100));
    }

    // Determinar estado basado en porcentaje de cumplimiento y efectividad
    let estado: 'atrasado' | 'en_tiempo' | 'adelantado';
    if (porcentajeCumplimiento >= 95 && efectividadPromedio >= 95) {
      estado = 'adelantado';
    } else if (porcentajeCumplimiento >= 80 && efectividadPromedio >= 85) {
      estado = 'en_tiempo';
    } else {
      estado = 'atrasado';
    }

    const nuevoReporte: ReporteGenerado = {
      id: `RPT-${Date.now()}`,
      fecha_generacion: new Date().toISOString().split('T')[0],
      numero_ficha: formReporte.numero_ficha,
      numero_pedido: formReporte.numero_pedido,
      cliente: formReporte.cliente,
      fecha_inicio: formReporte.fecha_inicio,
      fecha_fin: formReporte.fecha_fin,
      linea_produccion: (() => {
        const lineaSeleccionada = lineasProduccion.find(l => l.id === formReporte.linea_produccion);
        return lineaSeleccionada ? lineaSeleccionada.nombre : formReporte.linea_produccion;
      })(),
      produccion_datos: produccionDatos,
      tiempo_total_dias: tiempoTotalDias,
      cantidad_pedida: cantidadPedida,
      cantidad_confeccionada: cantidadConfeccionada,
      promedio_diario: promedioDiario,
      efectividad_promedio: efectividadPromedio,
      estado: estado
    };

    setReporteGenerado(nuevoReporte);
    setMostrarFormulario(false);
    alert('Reporte generado exitosamente');
  };

  const handleEnviarReporte = async () => {
    if (!reporteGenerado) return;

    // Buscar la línea de producción del reporte
    const lineaReporte = lineasProduccion.find(l => l.nombre === reporteGenerado.linea_produccion || l.id === reporteGenerado.linea_produccion);
    
    if (!lineaReporte) {
      alert('⚠️ No se encontró la línea de producción del reporte');
      return;
    }

    // Obtener usuarios de producción para seleccionar
    try {
      const token = localStorage.getItem('erp_token');
      const usuariosResponse = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/usuarios-produccion`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!usuariosResponse.ok) {
        throw new Error('Error al obtener usuarios de producción');
      }

      const usuariosData = await usuariosResponse.json();
      const usuarios = usuariosData.usuarios || [];

      // Filtrar usuarios que pertenecen a esta línea de producción
      const usuariosEnLinea = usuarios.filter((u: any) => 
        u.linea_nombre === reporteGenerado.linea_produccion || 
        u.lineas_asignadas?.includes(lineaReporte.id)
      );

      if (usuariosEnLinea.length === 0) {
        alert(`⚠️ No se encontraron usuarios asignados a la línea "${reporteGenerado.linea_produccion}"`);
        return;
      }

      // Si hay solo un usuario, enviarlo directamente
      if (usuariosEnLinea.length === 1) {
        const usuarioDestino = usuariosEnLinea[0];
        await enviarReporteAUsuario(usuarioDestino.id, lineaReporte.id, reporteGenerado, usuarioDestino);
      } else {
        // Si hay múltiples usuarios, mostrar selector
        const usuarioSeleccionado = prompt(
          `Selecciona el usuario destino para "${reporteGenerado.linea_produccion}":\n\n` +
          usuariosEnLinea.map((u: any, index: number) => 
            `${index + 1}. ${u.nombre_completo} - ${u.email}`
          ).join('\n') +
          `\n\nIngresa el número (1-${usuariosEnLinea.length}):`
        );

        if (!usuarioSeleccionado) return;

        const indice = parseInt(usuarioSeleccionado) - 1;
        if (indice < 0 || indice >= usuariosEnLinea.length) {
          alert('⚠️ Selección inválida');
          return;
        }

        const usuarioDestino = usuariosEnLinea[indice];
        await enviarReporteAUsuario(usuarioDestino.id, lineaReporte.id, reporteGenerado, usuarioDestino);
      }
    } catch (error: any) {
      console.error('Error al enviar reporte:', error);
      alert(`❌ Error: ${error.message || 'No se pudo enviar el reporte'}`);
    }
  };

  const enviarReporteAUsuario = async (
    usuarioDestinoId: string,
    lineaId: string,
    reporte: ReporteGenerado,
    usuarioDestino: any
  ) => {
    try {
      const token = localStorage.getItem('erp_token');
      
      // Calcular cantidad producida promedio del reporte
      const cantidadProducida = reporte.cantidad_confeccionada || 0;
      const cantidadDefectuosa = 0; // No tenemos este dato en el reporte generado
      
      // Usar la fecha de fin como fecha del reporte
      const fechaReporte = reporte.fecha_fin || new Date().toISOString().split('T')[0];

      // Construir observaciones con la información del reporte
      const observaciones = `Reporte de producción generado\n` +
        `Ficha: ${reporte.numero_ficha}\n` +
        `Pedido: ${reporte.numero_pedido}\n` +
        `Cliente: ${reporte.cliente}\n` +
        `Cantidad Pedida: ${reporte.cantidad_pedida}\n` +
        `Cantidad Confeccionada: ${reporte.cantidad_confeccionada}\n` +
        `Promedio Diario: ${reporte.promedio_diario} prendas/día\n` +
        `Efectividad: ${reporte.efectividad_promedio}%\n` +
        `Estado: ${reporte.estado}\n` +
        `Fecha Inicio: ${reporte.fecha_inicio}\n` +
        `Fecha Fin: ${reporte.fecha_fin}`;

      const response = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/reportes-diarios/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_destino_id: usuarioDestinoId,
          linea_id: lineaId,
          fecha: fechaReporte,
          cantidad_producida: cantidadProducida,
          cantidad_defectuosa: cantidadDefectuosa,
          observaciones: observaciones,
          incidencias: `Estado del reporte: ${reporte.estado}`,
          pedido_relacionado: reporte.numero_ficha
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar el reporte');
      }

      const result = await response.json();
      alert(`✅ Reporte "${reporte.numero_ficha}" enviado exitosamente a:\n${usuarioDestino.nombre_completo} (${usuarioDestino.email})\n\nLínea: ${reporte.linea_produccion}`);
      
      console.log('✅ Reporte enviado:', result);
    } catch (error: any) {
      console.error('Error al enviar reporte:', error);
      throw error;
    }
  };

  const handleGenerarPDF = async () => {
    if (!reporteGenerado) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Encabezado
      pdf.setFillColor(26, 86, 50);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Cargar y agregar logo
      try {
        const logoImg = await loadImage('/assets/images/logos/arriba.png');
        if (logoImg) {
          // Calcular dimensiones del logo (más grande: 25px de alto)
          const logoHeight = 25;
          const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
          
          // Agregar fondo blanco redondeado
          const logoX = margin + 3;
          const logoY = 10;
          const padding = 5;
          
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(255, 255, 255);
          pdf.rect(logoX - padding, logoY - padding, logoWidth + (padding * 2), logoHeight + (padding * 2), 'F');
          
          // Agregar logo sobre el fondo blanco
          const canvas = document.createElement('canvas');
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(logoImg, 0, 0);
            const logoData = canvas.toDataURL('image/png');
            pdf.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);
          }
        }
      } catch (error) {
        console.log('Logo no disponible, continuando sin logo');
      }
      
      // Título a la derecha
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('REPORTE DE PRODUCCIÓN TEXTIL', pageWidth - margin, 25, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      
      yPosition = 60;

      // Información del pedido
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('INFORMACIÓN DEL PEDIDO', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      const infoPedido = [
        [`Cliente:`, reporteGenerado.cliente],
        [`Número de Ficha:`, reporteGenerado.numero_ficha],
        [`Número de Pedido:`, reporteGenerado.numero_pedido],
        [`Línea de Producción:`, reporteGenerado.linea_produccion],
        [`Fecha Inicio:`, new Date(reporteGenerado.fecha_inicio).toLocaleDateString('es-ES')],
        [`Fecha Fin:`, new Date(reporteGenerado.fecha_fin).toLocaleDateString('es-ES')],
        [`Tiempo Total:`, `${reporteGenerado.tiempo_total_dias} días`]
      ];

      infoPedido.forEach(([label, value]) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, margin + 80, yPosition);
        yPosition += 7;
      });

      yPosition += 8;

      // Resumen de Producción
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('RESUMEN DE PRODUCCIÓN', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      const porcentajeCumplimiento = Math.round((reporteGenerado.cantidad_confeccionada / reporteGenerado.cantidad_pedida) * 100);
      
      const resumen = [
        [`Cantidad Pedida:`, `${reporteGenerado.cantidad_pedida} prendas`],
        [`Cantidad Confeccionada:`, `${reporteGenerado.cantidad_confeccionada} prendas`],
        [`Cumplimiento:`, `${porcentajeCumplimiento}%`],
        [`Promedio Diario:`, `${reporteGenerado.promedio_diario} prendas/día`],
        [`Efectividad Promedio:`, `${reporteGenerado.efectividad_promedio}%`],
        [`Estado:`, reporteGenerado.estado === 'en_tiempo' ? 'EN TIEMPO' : 
                 reporteGenerado.estado === 'adelantado' ? 'ADELANTADO' : 'ATRASADO']
      ];

      resumen.forEach(([label, value]) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, margin + 80, yPosition);
        yPosition += 7;
      });

      yPosition += 8;

      // Capturar gráficos como imágenes
      const chartWidth = 85;
      const chartHeight = 60;

      if (chart1Ref.current && chart2Ref.current) {
        // Esperar un momento para que se rendericen completamente
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capturar gráfico 1 (Producción Diaria)
        const canvas1 = await html2canvas(chart1Ref.current, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true
        });
        const imgData1 = canvas1.toDataURL('image/png');

        // Capturar gráfico 2 (Efectividad)
        const canvas2 = await html2canvas(chart2Ref.current, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true
        });
        const imgData2 = canvas2.toDataURL('image/png');

        // Verificar si necesitamos una nueva página para los gráficos
        if (yPosition + chartHeight > 260) {
          pdf.addPage();
          yPosition = 20;
        }

        // Agregar títulos de gráficos
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('GRÁFICOS DE PRODUCCIÓN', margin, yPosition);
        yPosition += 10;

        // Agregar gráficos lado a lado
        pdf.addImage(imgData1, 'PNG', margin, yPosition, chartWidth, chartHeight, 'chart1');
        pdf.addImage(imgData2, 'PNG', margin + chartWidth + 5, yPosition, chartWidth, chartHeight, 'chart2');
        yPosition += chartHeight + 10;
      }

      // Verificar si necesitamos una nueva página para la tabla
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }

      // Producción Diaria
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('PRODUCCIÓN DIARIA DETALLADA', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('Fecha', margin, yPosition);
      pdf.text('Prendas', margin + 50, yPosition);
      pdf.text('Efectividad', margin + 90, yPosition);
      yPosition += 7;

      // Línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

      pdf.setFont(undefined, 'normal');
      reporteGenerado.produccion_datos.forEach(dia => {
        pdf.text(new Date(dia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), margin, yPosition);
        pdf.text(dia.cantidad.toString(), margin + 50, yPosition);
        pdf.text(`${dia.porcentaje_efectividad}%`, margin + 90, yPosition);
        yPosition += 8;
      });

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      yPosition = pageHeight - 25;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Este reporte fue generado automáticamente por el Sistema ERP Textil - Ingeniería', 
              pageWidth / 2, yPosition, { align: 'center' });

      const fileName = `Reporte_Produccion_${reporteGenerado.numero_ficha}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Guardar en el historial
      const documentoHistorial = {
        id: `rpt_${Date.now()}`,
        tipo: 'reporte' as const,
        fecha: new Date().toISOString(),
        cliente: reporteGenerado.cliente,
        ficha: reporteGenerado.numero_ficha,
        descripcion: `Reporte de Producción - ${reporteGenerado.cliente} - ${reporteGenerado.numero_ficha} - ${reporteGenerado.linea_produccion}`,
        datos: { ...reporteGenerado }
      };
      
      window.dispatchEvent(new CustomEvent('guardarDocumento', { detail: documentoHistorial }));
      
      alert('PDF generado con gráficos y guardado en el historial exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const generarNuevoReporte = () => {
    setMostrarFormulario(true);
    setReporteGenerado(null);
    setFormReporte({
      fecha_inicio: '',
      fecha_fin: '',
      numero_ficha: '',
      numero_pedido: '',
      cliente: '',
      linea_produccion: '',
      cantidad_pedida: '',
      cantidad_confeccionada: '',
      tiempo_produccion_dias: ''
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_tiempo':
        return 'bg-blue-100 text-blue-800';
      case 'adelantado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'en_tiempo':
        return 'En Tiempo ✅';
      case 'adelantado':
        return 'Adelantado ⚡';
      case 'atrasado':
        return 'Atrasado ⚠️';
      default:
        return estado;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📈 Reportes de Producción</h1>
        <p className="text-gray-600">Generar reportes detallados de producción textil.</p>
      </div>

      {mostrarFormulario ? (
        /* Formulario para Generar Reporte */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Generar Reporte de Producción</h2>

            <div className="space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-4">Información del Pedido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Ficha: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numero_ficha"
                      value={formReporte.numero_ficha}
                      onChange={handleFormChange}
                      placeholder="Ej: F-2024-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Pedido: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numero_pedido"
                      value={formReporte.numero_pedido}
                      onChange={handleFormChange}
                      placeholder="Ej: PED-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cliente"
                      value={formReporte.cliente}
                      onChange={handleFormChange}
                      placeholder="Ej: LACOSTE"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Línea de Producción: <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="linea_produccion"
                      value={formReporte.linea_produccion}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={loadingLineas}
                    >
                      <option value="">Seleccionar línea</option>
                      {lineasProduccion.map((linea) => (
                        <option key={linea.id} value={linea.id}>
                          {linea.nombre}
                          {linea.usuarios.length > 0 && ` (${linea.usuarios.join(', ')})`}
                        </option>
                      ))}
                    </select>
                    {loadingLineas && (
                      <p className="mt-1 text-xs text-gray-500">Cargando líneas...</p>
                    )}
                    {lineasProduccion.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        {lineasProduccion.length} línea(s) disponible(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Parámetros de Producción */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-4">Parámetros de Producción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Prendas Pedidas: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cantidad_pedida"
                      value={formReporte.cantidad_pedida}
                      onChange={handleFormChange}
                      placeholder="Ej: 1000"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cantidad solicitada en el pedido</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prendas Confeccionadas: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cantidad_confeccionada"
                      value={formReporte.cantidad_confeccionada}
                      onChange={handleFormChange}
                      placeholder="Ej: 950"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cantidad realmente producida</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de Producción (días):
                    </label>
                    <input
                      type="number"
                      name="tiempo_produccion_dias"
                      value={formReporte.tiempo_produccion_dias}
                      onChange={handleFormChange}
                      placeholder="Ej: 15"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Se calculará automáticamente según las fechas</p>
                  </div>
                </div>
              </div>

              {/* Fechas de Producción */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-4">Fechas de Producción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formReporte.fecha_inicio}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={formReporte.fecha_fin}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Generar */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={generarReporte}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                >
                  🚀 Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Visualización del Reporte Generado */
        <div className="space-y-6">
          {/* Acciones del Reporte */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Reporte: {reporteGenerado?.numero_ficha}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerarPDF}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📄 Generar PDF
              </button>
              <button
                onClick={handleEnviarReporte}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📧 Enviar a Producción
              </button>
              <button
                onClick={generarNuevoReporte}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Nuevo Reporte
              </button>
            </div>
          </div>

          {reporteGenerado && (
            <>
              {/* Resumen de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-2">Pedidas</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {reporteGenerado.cantidad_pedida}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">prendas</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-2">Confeccionadas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {reporteGenerado.cantidad_confeccionada}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round((reporteGenerado.cantidad_confeccionada / reporteGenerado.cantidad_pedida) * 100)}% cumplimiento
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-2">Promedio Diario</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {reporteGenerado.promedio_diario}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">prendas/día</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-2">Efectividad</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {reporteGenerado.efectividad_promedio}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className={`px-2 py-1 rounded-full ${getEstadoColor(reporteGenerado.estado)} text-xs`}>
                      {getEstadoTexto(reporteGenerado.estado)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Información del Pedido */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Pedido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Cliente:</span>
                    <p className="font-semibold text-gray-900">{reporteGenerado.cliente}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ficha:</span>
                    <p className="font-semibold text-gray-900">{reporteGenerado.numero_ficha}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Pedido:</span>
                    <p className="font-semibold text-gray-900">{reporteGenerado.numero_pedido}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Línea:</span>
                    <p className="font-semibold text-gray-900">{reporteGenerado.linea_produccion}</p>
                  </div>
                </div>
              </div>

              {/* Gráficos de Producción */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Producción Diaria */}
                <div ref={chart1Ref} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Producción Diaria</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reporteGenerado.produccion_datos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="fecha" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="cantidad" 
                          stroke="#1A5632" 
                          strokeWidth={3} 
                          name="Cantidad Prendas"
                          dot={{ fill: '#1A5632', strokeWidth: 2, r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Efectividad */}
                <div ref={chart2Ref} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Efectividad Diaria</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reporteGenerado.produccion_datos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="fecha" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                          formatter={(value: number) => [`${value}%`, 'Efectividad']}
                        />
                        <Legend />
                        <Bar dataKey="porcentaje_efectividad" name="Efectividad %" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tabla Detallada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Desglose Diario de Producción</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad de Prendas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Efectividad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reporteGenerado.produccion_datos.map((dia, index) => {
                        const diaEfectividad = dia.porcentaje_efectividad >= 90 ? 'bg-green-100 text-green-800' :
                                               dia.porcentaje_efectividad >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                               'bg-red-100 text-red-800';
                        const diaEstado = dia.porcentaje_efectividad >= 90 ? 'Óptimo' :
                                          dia.porcentaje_efectividad >= 80 ? 'Normal' :
                                          'Bajo';

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(dia.fecha).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {dia.cantidad} prendas
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {dia.porcentaje_efectividad}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${diaEfectividad}`}>
                                {diaEstado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IngenieriaReportesPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import API_BASE_URL_CORE from '../../config/api';

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

interface PedidoData {
  cliente: string;
  ficha: string;
  estilo_cliente: string;
  color: string;
  cantidad: string;
  linea_produccion: string;
  operacion: string;
  codigo_operacion: string;
  fecha_envio: string;
  fecha_recojo: string;
  especificacion: string;
}

interface RegistroProduccion {
  id: string;
  fecha: string;
  linea_id: string;
  linea_nombre: string;
  producto: string;
  cantidad: number;
  cantidad_objetivo: number;
  cantidad_defectuosa: number;
  eficiencia: number;
  calidad: number;
  notas: string | null;
  estado: string;
  timestamp: string;
}

interface LineaProduccion {
  id: string;
  nombre: string;
  status: string;
  usuarios: string[];
}

interface MiProduccionData {
  usuario: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  metricas: {
    totalProducido: number;
    totalOrdenes: number;
  };
  registros: RegistroProduccion[];
}

interface PedidoRecibido {
  id: string;
  numero_ficha: string;
  numero_pedido: string;
  cliente: string;
  cantidad: number;
  fecha_recepcion: string;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_envio: string | null;
  estado: string | null;
  linea_nombre: string | null;
  enviado_por_nombre: string | null;
}

interface ReporteDiario {
  id: string;
  fecha: string;
  cantidad_producida: number;
  cantidad_defectuosa: number;
  observaciones: string | null;
  incidencias: string | null;
  linea_nombre: string | null;
  fecha_creacion: string;
}

// Función helper para detectar si un reporte fue enviado por Ingeniería
const esReporteDeIngenieria = (observaciones: string | null): boolean => {
  if (!observaciones) return false;
  const obsLower = observaciones.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remover acentos para comparación
  return obsLower.includes('enviado por: ingenieria') || 
         obsLower.includes('enviado por ingenieria') ||
         obsLower.includes('ingenieria'); // Fallback más amplio
};

const UsuarioMiProduccionPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MiProduccionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineasProduccion, setLineasProduccion] = useState<LineaProduccion[]>([]);
  const [loadingLineas, setLoadingLineas] = useState(true);
  const [formData, setFormData] = useState<PedidoData>({
    cliente: '',
    ficha: '',
    estilo_cliente: '',
    color: '',
    cantidad: '',
    linea_produccion: '',
    operacion: '',
    codigo_operacion: '',
    fecha_envio: '',
    fecha_recojo: '',
    especificacion: ''
  });

  // Estados para los modales
  const [showEnviarReporte, setShowEnviarReporte] = useState(false);
  const [loadingModales, setLoadingModales] = useState(false);

  // Estados para pedidos recibidos y reportes
  const [pedidosRecibidos, setPedidosRecibidos] = useState<PedidoRecibido[]>([]);
  const [reportesEnviados, setReportesEnviados] = useState<ReporteDiario[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [loadingReportes, setLoadingReportes] = useState(false);

  // Formulario para enviar reporte
  const [reporteDiario, setReporteDiario] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cantidad_producida: '',
    cantidad_defectuosa: '',
    observaciones: '',
    incidencias: '',
    linea_produccion: '', // id de línea para relacionar con Ingeniería
    dueno_linea: '', // nombre del dueño de la línea
    numero_ficha_rel: '' // referencia al pedido/ficha recibido
  });

  useEffect(() => {
    const fetchMiProduccion = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(
          `${API_BASE_URL_CORE}/produccion/mi-produccion?usuario_id=${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener los datos de producción');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error al cargar producción:', err);
        setError('No se pudieron cargar los datos de producción');
      } finally {
        setLoading(false);
      }
    };

    fetchMiProduccion();
  }, [user?.id]);

  // Cargar líneas de producción
  useEffect(() => {
    const fetchLineas = async () => {
      try {
        setLoadingLineas(true);
        const response = await fetch(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Líneas recibidas del backend (Usuario Producción):', data.lineas.length);
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

  // Cargar pedidos recibidos
  useEffect(() => {
    const fetchPedidosRecibidos = async () => {
      if (!user?.id) return;

      try {
        setLoadingPedidos(true);
        const token = localStorage.getItem('erp_token');
        const response = await fetch(
          `${API_BASE_URL_CORE}/reportes-produccion/pedidos-recibidos/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setPedidosRecibidos(result.pedidos || []);
        }
      } catch (error) {
        console.error('❌ Error al cargar pedidos recibidos:', error);
      } finally {
        setLoadingPedidos(false);
      }
    };

    fetchPedidosRecibidos();
  }, [user?.id]);

  // Cargar reportes enviados
  const fetchReportesEnviados = async () => {
    if (!user?.id) {
      console.log('⚠️ [fetchReportesEnviados] No hay user.id disponible');
      return;
    }

    try {
      setLoadingReportes(true);
      const token = localStorage.getItem('erp_token');
      console.log('📤 [fetchReportesEnviados] Consultando reportes para usuario:', user.id);
      console.log('📤 [fetchReportesEnviados] Usuario completo:', user);
      
      const response = await fetch(
        `${API_BASE_URL_CORE}/reportes-produccion/reportes-diarios/usuario/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 [fetchReportesEnviados] Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Reportes recibidos del backend:', result.reportes?.length || 0);
        console.log('📊 Resultado completo:', result);
        
        // Verificar cada reporte y su detección
        if (result.reportes && result.reportes.length > 0) {
          result.reportes.forEach((reporte: ReporteDiario, index: number) => {
            const esDeIngenieria = esReporteDeIngenieria(reporte.observaciones);
            console.log(`   Reporte ${index + 1}:`, {
              id: reporte.id,
              fecha: reporte.fecha,
              usuario_id: reporte.usuario_id,
              observaciones: reporte.observaciones?.substring(0, 100),
              esDeIngenieria: esDeIngenieria
            });
          });
        } else {
          console.log('⚠️ No se recibieron reportes del backend');
        }
        
        setReportesEnviados(result.reportes || []);
      } else {
        console.error('❌ Error en respuesta del servidor:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Detalles del error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error al cargar reportes enviados:', error);
    } finally {
      setLoadingReportes(false);
    }
  };

  useEffect(() => {
    fetchReportesEnviados();
  }, [user?.id]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-700';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-700';
      case 'pendiente':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'en_proceso':
        return 'En Proceso';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReporteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReporteDiario(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Función para generar PDF de un pedido recibido
  const handleDescargarPDFReporte = async (reporte: ReporteDiario) => {
    try {
      console.log('📄 Generando PDF del reporte recibido:', reporte.id);

      const pdf = new jsPDF();
      
      // Configuración de estilos
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Función para agregar texto con saltos de línea automáticos
      const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, align: string = 'left') => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
        
        if (align === 'center') {
          pdf.text(lines, x, y, { align: 'center' });
        } else if (align === 'right') {
          pdf.text(lines, x, y, { align: 'right' });
        } else {
          pdf.text(lines, x, y);
        }
        return lines.length * lineHeight;
      };

      // Encabezado
      pdf.setFillColor(26, 86, 50); // Verde UIT
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Cargar y agregar logo
      try {
        const logoImg = await loadImage('/assets/images/logos/arriba.png');
        if (logoImg) {
          const logoHeight = 25;
          const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
          const logoX = margin + 3;
          const logoY = 10;
          const padding = 5;
          
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(255, 255, 255);
          pdf.rect(logoX - padding, logoY - padding, logoWidth + (padding * 2), logoHeight + (padding * 2), 'F');
          
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
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('REPORTE DE PRODUCCIÓN', pageWidth - margin, 25, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      
      yPosition = 60;

      // Información del reporte
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('DATOS DEL REPORTE', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      // Extraer información de las observaciones
      const observaciones = reporte.observaciones || '';
      
      // Buscar información estructurada en las observaciones
      const ficha = observaciones.match(/Ficha:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const pedido = observaciones.match(/Pedido:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const cliente = observaciones.match(/Cliente:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const cantidadPedida = observaciones.match(/Cantidad Pedida:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const cantidadConfeccionada = observaciones.match(/Cantidad Confeccionada:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const promedioDiario = observaciones.match(/Promedio Diario:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const efectividad = observaciones.match(/Efectividad:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const estado = observaciones.match(/Estado:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const fechaInicio = observaciones.match(/Fecha Inicio:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const fechaFin = observaciones.match(/Fecha Fin:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const duenoLinea = observaciones.match(/Dueño de la línea:\s*([^\n]+)/i)?.[1]?.trim() || '';
      const pedidoRelacionado = observaciones.match(/Pedido relacionado \(ficha\):\s*([^\n]+)/i)?.[1]?.trim() || '';

      const nombreLinea = reporte.linea_nombre || 'No especificada';
      const cantidadNeta = reporte.cantidad_producida - reporte.cantidad_defectuosa;
      const porcentajeCalidad = reporte.cantidad_producida > 0 
        ? Math.round((cantidadNeta / reporte.cantidad_producida) * 100) 
        : 0;

      // Campos del reporte
      const fields = [
        [`Fecha del Reporte:`, new Date(reporte.fecha).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })],
        [`Línea de Producción:`, nombreLinea],
      ];

      // Agregar campos del reporte generado si existen
      if (ficha) fields.push([`Ficha:`, ficha]);
      if (pedido) fields.push([`Pedido:`, pedido]);
      if (cliente) fields.push([`Cliente:`, cliente]);
      if (cantidadPedida) fields.push([`Cantidad Pedida:`, cantidadPedida]);
      if (cantidadConfeccionada) fields.push([`Cantidad Confeccionada:`, cantidadConfeccionada]);
      
      fields.push([`Cantidad Producida:`, reporte.cantidad_producida.toString()]);
      fields.push([`Cantidad Defectuosa:`, reporte.cantidad_defectuosa.toString()]);
      fields.push([`Cantidad Neta:`, cantidadNeta.toString()]);
      fields.push([`Porcentaje de Calidad:`, `${porcentajeCalidad}%`]);
      
      if (promedioDiario) fields.push([`Promedio Diario:`, promedioDiario]);
      if (efectividad) fields.push([`Efectividad:`, efectividad]);
      if (estado) fields.push([`Estado:`, estado]);
      if (fechaInicio) fields.push([`Fecha Inicio:`, fechaInicio]);
      if (fechaFin) fields.push([`Fecha Fin:`, fechaFin]);
      if (duenoLinea) fields.push([`Dueño de la Línea:`, duenoLinea]);
      if (pedidoRelacionado) fields.push([`Pedido Relacionado:`, pedidoRelacionado]);

      fields.forEach(([label, value]) => {
        if (value) {
          pdf.text(label, margin, yPosition);
          pdf.text(value, margin + 80, yPosition);
          yPosition += 7;
          
          // Verificar si necesitamos una nueva página
          if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
            pdf.addPage();
            yPosition = margin;
          }
        }
      });

      // Observaciones detalladas
      if (observaciones) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('OBSERVACIONES Y DETALLES:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        // Limpiar observaciones para mostrar solo lo relevante
        const observacionesLimpias = observaciones
          .split('\n')
          .filter(line => {
            const lower = line.toLowerCase();
            return !lower.includes('enviado por: ingeniería') && 
                   !lower.includes('enviado por: ingenieria');
          })
          .join('\n')
          .trim();
        
        if (observacionesLimpias) {
          const obsLines = pdf.splitTextToSize(observacionesLimpias, pageWidth - margin * 2);
          pdf.text(obsLines, margin, yPosition);
          yPosition += obsLines.length * lineHeight;
          
          // Verificar si necesitamos una nueva página
          if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
            pdf.addPage();
            yPosition = margin;
          }
        }
      }

      // Incidencias
      if (reporte.incidencias) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('INCIDENCIAS:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const incLines = pdf.splitTextToSize(reporte.incidencias, pageWidth - margin * 2);
        pdf.text(incLines, margin, yPosition);
        yPosition += incLines.length * lineHeight;
        
        // Verificar si necesitamos una nueva página
        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = margin;
        }
      }

      // Información del destinatario
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('INFORMACIÓN DE RECEPCIÓN', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Destinatario: ${user?.name || 'Usuario de Producción'}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Enviado por: Área de Ingeniería`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Fecha de recepción: ${new Date().toLocaleString('es-ES')}`, margin, yPosition);

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      yPosition = pageHeight - 30;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Este documento contiene el reporte de producción enviado por el área de Ingeniería.', 
              pageWidth / 2, yPosition, { align: 'center' });

      // Guardar el PDF
      const fechaReporte = new Date(reporte.fecha).toISOString().split('T')[0];
      const fileName = ficha 
        ? `Reporte_${ficha}_${fechaReporte}.pdf`
        : `Reporte_${reporte.id.substring(0, 8)}_${fechaReporte}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF del reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF del reporte:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const handleDescargarPDFPedido = async (pedido: PedidoRecibido) => {
    try {
      console.log('📄 Generando PDF del pedido:', pedido.numero_ficha);

      const pdf = new jsPDF();
      
      // Configuración de estilos
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Función para agregar texto con saltos de línea automáticos
      const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, align: string = 'left') => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
        
        if (align === 'center') {
          pdf.text(lines, x, y, { align: 'center' });
        } else if (align === 'right') {
          pdf.text(lines, x, y, { align: 'right' });
        } else {
          pdf.text(lines, x, y);
        }
        return lines.length * lineHeight;
      };

      // Encabezado
      pdf.setFillColor(26, 86, 50); // Verde UIT
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Cargar y agregar logo
      try {
        const logoImg = await loadImage('/assets/images/logos/arriba.png');
        if (logoImg) {
          const logoHeight = 25;
          const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
          const logoX = margin + 3;
          const logoY = 10;
          const padding = 5;
          
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(255, 255, 255);
          pdf.rect(logoX - padding, logoY - padding, logoWidth + (padding * 2), logoHeight + (padding * 2), 'F');
          
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
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('PEDIDO DE PRODUCCIÓN', pageWidth - margin, 25, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      
      yPosition = 60;

      // Información del pedido
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('DATOS DEL PEDIDO', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      // Extraer información de las observaciones (si están estructuradas)
      const observaciones = pedido.observaciones || '';
      const estiloCliente = observaciones.match(/Estilo Cliente:\s*([^\n]+)/i)?.[1] || '';
      const color = observaciones.match(/Color:\s*([^\n]+)/i)?.[1] || '';
      const operacion = observaciones.match(/Operación:\s*([^\n]+)/i)?.[1] || '';
      const codigoOperacion = observaciones.match(/Código Operación:\s*([^\n]+)/i)?.[1] || '';
      const fechaEnvio = observaciones.match(/Fecha Envío:\s*([^\n]+)/i)?.[1] || pedido.fecha_envio || '';
      const fechaRecojo = observaciones.match(/Fecha Recojo:\s*([^\n]+)/i)?.[1] || '';
      const especificacion = observaciones.split('\n').filter(line => 
        !line.match(/^(Estilo Cliente|Color|Operación|Código Operación|Fecha Envío|Fecha Recojo):/i)
      ).join('\n').trim();

      const nombreLinea = pedido.linea_nombre || 'No especificada';

      // Campos del pedido
      const fields = [
        [`Cliente:`, pedido.cliente],
        [`Ficha:`, pedido.numero_ficha],
        [`Pedido:`, pedido.numero_pedido],
        [`Cantidad:`, pedido.cantidad.toString()],
        [`Línea de Producción:`, nombreLinea],
        [`Fecha de Recepción:`, new Date(pedido.fecha_recepcion).toLocaleDateString('es-ES')],
        [`Fecha de Envío:`, fechaEnvio || (pedido.fecha_envio ? new Date(pedido.fecha_envio).toLocaleDateString('es-ES') : 'No especificada')],
        [`Estado:`, pedido.estado || 'pendiente'],
      ];

      // Agregar campos adicionales si existen
      if (estiloCliente) fields.push([`Estilo del Cliente:`, estiloCliente]);
      if (color) fields.push([`Color:`, color]);
      if (operacion) fields.push([`Operación:`, operacion]);
      if (codigoOperacion) fields.push([`Código de Operación:`, codigoOperacion]);
      if (fechaRecojo) fields.push([`Fecha de Recojo:`, fechaRecojo]);

      fields.forEach(([label, value]) => {
        if (value) {
          pdf.text(label, margin, yPosition);
          pdf.text(value, margin + 80, yPosition);
          yPosition += 7;
        }
      });

      // Especificaciones/Observaciones
      if (especificacion) {
        yPosition += 5;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('ESPECIFICACIONES:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const specLines = pdf.splitTextToSize(especificacion, pageWidth - margin * 2);
        pdf.text(specLines, margin, yPosition);
        yPosition += specLines.length * lineHeight;
      }

      // Información del destinatario
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('INFORMACIÓN DE ENTREGA', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Destinatario: ${nombreUsuario}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Enviado por: ${pedido.enviado_por_nombre || 'Ingeniería'}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Fecha de envío del sistema: ${pedido.fecha_envio ? new Date(pedido.fecha_envio).toLocaleString('es-ES') : 'No disponible'}`, margin, yPosition);

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      yPosition = pageHeight - 30;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Este documento contiene los detalles del pedido asignado por el área de Ingeniería.', 
              pageWidth / 2, yPosition, { align: 'center' });

      // Guardar el PDF
      const fileName = `Pedido_${pedido.numero_ficha}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const handleEnviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Error: No se pudo identificar al usuario');
      return;
    }

    setLoadingModales(true);
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/reportes-diarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: user.id,
          fecha: reporteDiario.fecha,
          cantidad_producida: parseInt(reporteDiario.cantidad_producida) || 0,
          cantidad_defectuosa: parseInt(reporteDiario.cantidad_defectuosa) || 0,
          // Enviar la línea si fue seleccionada; el backend ya soporta linea_id para consolidar métricas
          linea_id: reporteDiario.linea_produccion || formData.linea_produccion || null,
          // En observaciones, anexamos campos de organización para Ingeniería
          observaciones: (
            [
              reporteDiario.observaciones?.trim() || '',
              reporteDiario.dueno_linea ? `Dueño de la línea: ${reporteDiario.dueno_linea}` : '',
              reporteDiario.numero_ficha_rel ? `Pedido relacionado (ficha): ${reporteDiario.numero_ficha_rel}` : ''
            ]
              .filter(Boolean)
              .join(' | ')
          ) || null,
          incidencias: reporteDiario.incidencias || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar el reporte');
      }

      const result = await response.json();
      alert('✅ Reporte diario enviado exitosamente');
      setReporteDiario({
        fecha: new Date().toISOString().split('T')[0],
        cantidad_producida: '',
        cantidad_defectuosa: '',
        observaciones: '',
        incidencias: '',
        linea_produccion: '',
        dueno_linea: '',
        numero_ficha_rel: ''
      });
      setShowEnviarReporte(false);
      // Recargar reportes enviados
      if (user?.id) {
        const token = localStorage.getItem('erp_token');
        const reportesResponse = await fetch(
          `${API_BASE_URL_CORE}/reportes-produccion/reportes-diarios/usuario/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (reportesResponse.ok) {
          const reportesResult = await reportesResponse.json();
          setReportesEnviados(reportesResult.reportes || []);
        }
      }
    } catch (error: any) {
      console.error('Error al enviar reporte:', error);
      alert(`Error: ${error.message || 'No se pudo enviar el reporte'}`);
    } finally {
      setLoadingModales(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del pedido:', formData);
    // Aquí iría la lógica para guardar o enviar los datos
    alert('Pedido guardado exitosamente');
    // Limpiar el formulario después de guardar
    setFormData({
      cliente: '',
      ficha: '',
      estilo_cliente: '',
      color: '',
      cantidad: '',
      linea_produccion: '',
      operacion: '',
      codigo_operacion: '',
      fecha_envio: '',
      fecha_recojo: '',
      especificacion: ''
    });
  };

  const handleGeneratePDF = async () => {
    // Validar que hay datos
    if (!formData.cliente || !formData.ficha || !formData.cantidad) {
      alert('Por favor completa los campos obligatorios antes de generar el PDF');
      return;
    }

    console.log('Iniciando generación de PDF...');

    try {
      // Crear nuevo documento PDF
      const pdf = new jsPDF();
      
      // Configuración de estilos
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Encabezado
      pdf.setFillColor(26, 86, 50); // Verde UIT
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
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('ERP TEXTIL - ORDEN DE PRODUCCIÓN', pageWidth - margin, 25, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      
      yPosition = 60;

      // Datos del pedido
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('DATOS DEL PEDIDO', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      // Obtener el nombre de la línea seleccionada
      const lineaSeleccionada = lineasProduccion.find(l => l.id === formData.linea_produccion);
      const nombreLinea = lineaSeleccionada ? lineaSeleccionada.nombre : formData.linea_produccion;

      const fields = [
        [`Cliente:`, formData.cliente],
        [`Ficha:`, formData.ficha],
        [`Estilo del Cliente:`, formData.estilo_cliente],
        [`Color:`, formData.color],
        [`Cantidad:`, formData.cantidad],
        [`Línea de Producción:`, nombreLinea],
        [`Operación:`, formData.operacion],
        [`Código de Operación:`, formData.codigo_operacion],
        [`Fecha de Envío del Documento:`, formData.fecha_envio],
        [`Fecha de Recojo del Pedido:`, formData.fecha_recojo],
      ];

      fields.forEach(([label, value]) => {
        if (value) {
          pdf.text(label, margin, yPosition);
          pdf.text(value, margin + 80, yPosition);
          yPosition += 7;
        }
      });

      // Especificaciones
      if (formData.especificacion) {
        yPosition += 5;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('ESPECIFICACIONES:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const specLines = pdf.splitTextToSize(formData.especificacion, pageWidth - margin * 2);
        pdf.text(specLines, margin, yPosition);
        yPosition += specLines.length * lineHeight;
      }

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      yPosition = pageHeight - 30;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Este documento fue generado automáticamente por el Sistema ERP Textil', 
              pageWidth / 2, yPosition, { align: 'center' });

      // Guardar el PDF
      const fileName = `Orden_Produccion_${formData.ficha || 'Nueva'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Guardar en el historial
      const documentoHistorial = {
        id: `prod_${Date.now()}`,
        tipo: 'produccion' as const,
        fecha: new Date().toISOString(),
        cliente: formData.cliente,
        ficha: formData.ficha,
        descripcion: `Orden de Producción - ${formData.cliente} - ${formData.ficha} - ${nombreLinea}`,
        datos: { ...formData }
      };
      
      console.log('Disparando evento guardarDocumento:', documentoHistorial);
      window.dispatchEvent(new CustomEvent('guardarDocumento', { detail: documentoHistorial }));
      
      alert('PDF generado y guardado en el historial exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏭 Mi Producción</h1>
          <p className="text-gray-600">Registros recientes de tus actividades.</p>
        </div>
        <div className="flex items-center justify-center p-12">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏭 Mi Producción</h1>
          <p className="text-gray-600">Registros recientes de tus actividades.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calcular métricas reales basadas en pedidos y reportes
  const totalPedidosRecibidos = pedidosRecibidos.length;
  const totalReportesEnviados = reportesEnviados.length;
  const totalProducidoReal = reportesEnviados.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
  
  const metricas = {
    totalProducido: totalProducidoReal || data?.metricas?.totalProducido || 0,
    totalOrdenes: totalPedidosRecibidos || data?.metricas?.totalOrdenes || 0,
    totalReportes: totalReportesEnviados
  };
  const registros = data?.registros || [];
  const nombreUsuario = data?.usuario?.nombre || user?.name || 'N/A';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏭 Mi Producción</h1>
        <p className="text-gray-600">Registros recientes de tus actividades.</p>
      </div>

      {/* Información sobre pedidos */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Información:</strong> Los pedidos son enviados automáticamente por el área de Ingeniería. 
              Cuando recibas un pedido, aparecerá en la sección "Pedidos Recibidos de Ingeniería" más abajo. 
              No necesitas registrarlos manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* Acción rápida - Enviar Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div 
          onClick={() => setShowEnviarReporte(true)}
          className="card cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-2">📤 Enviar Reporte</h3>
              <p className="text-sm text-gray-600">
                Envía tu reporte de trabajo diario a Ingeniería
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total producido</p>
          <p className="text-2xl font-semibold text-emerald-700">{metricas.totalProducido.toLocaleString('es-PE')} und</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pedidos recibidos</p>
          <p className="text-2xl font-semibold text-indigo-700">{metricas.totalOrdenes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Reportes enviados</p>
          <p className="text-2xl font-semibold text-blue-700">{metricas.totalReportes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Usuario</p>
          <p className="text-2xl font-semibold text-blue-700">{nombreUsuario}</p>
        </div>
      </div>

      {/* Sección de Pedidos Recibidos (enviados por Ingeniería) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📥 Pedidos Recibidos de Ingeniería</h2>
        {loadingPedidos ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando pedidos...</p>
          </div>
        ) : pedidosRecibidos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay pedidos recibidos aún.</p>
            <p className="text-sm text-gray-400 mt-2">Los pedidos serán enviados automáticamente por el área de Ingeniería.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Fecha Envío</th>
                  <th className="py-3 pr-4 font-medium">Ficha</th>
                  <th className="py-3 pr-4 font-medium">Cliente</th>
                  <th className="py-3 pr-4 font-medium">Cantidad</th>
                  <th className="py-3 pr-4 font-medium">Línea</th>
                  <th className="py-3 pr-4 font-medium">Estado</th>
                  <th className="py-3 pr-4 font-medium">Observaciones</th>
                  <th className="py-3 pr-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecibidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      {pedido.fecha_envio ? new Date(pedido.fecha_envio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }) : '-'}
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold text-blue-600">{pedido.numero_ficha}</td>
                    <td className="py-3 pr-4">{pedido.cliente}</td>
                    <td className="py-3 pr-4 font-mono">{pedido.cantidad.toLocaleString('es-PE')}</td>
                    <td className="py-3 pr-4">{pedido.linea_nombre || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pedido.estado === 'completado' ? 'bg-green-100 text-green-700' :
                        pedido.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {pedido.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 max-w-xs">
                      <div className="truncate" title={pedido.observaciones || ''}>
                        {pedido.observaciones || '-'}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleDescargarPDFPedido(pedido)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        title="Descargar pedido en PDF"
                      >
                        <span>📄</span>
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de Reportes Recibidos de Ingeniería */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">📥 Reportes Recibidos del Área de Ingeniería</h2>
            <p className="text-sm text-gray-500 mt-1">
              Reportes que te ha enviado el área de Ingeniería para tu línea de producción
            </p>
          </div>
          <button
            onClick={fetchReportesEnviados}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            title="Refrescar reportes"
          >
            🔄 Actualizar
          </button>
        </div>
        {reportesEnviados.filter(r => esReporteDeIngenieria(r.observaciones)).length === 0 ? (
          <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
            <p className="text-gray-600 font-medium">No hay reportes recibidos de Ingeniería aún.</p>
            <p className="text-sm text-gray-500 mt-2">Los reportes aparecerán aquí cuando el área de Ingeniería te los envíe.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-green-50">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Línea</th>
                  <th className="py-3 pr-4 font-medium">Producido</th>
                  <th className="py-3 pr-4 font-medium">Defectuoso</th>
                  <th className="py-3 pr-4 font-medium">Neto</th>
                  <th className="py-3 pr-4 font-medium">Observaciones</th>
                  <th className="py-3 pr-4 font-medium">Incidencias</th>
                  <th className="py-3 pr-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportesEnviados
                  .filter(reporte => esReporteDeIngenieria(reporte.observaciones))
                  .map((reporte) => (
                    <tr 
                      key={reporte.id} 
                      className="border-b border-gray-100 hover:bg-green-50 bg-green-50/50"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {new Date(reporte.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4">{reporte.linea_nombre || '-'}</td>
                      <td className="py-3 pr-4 font-mono text-green-600 font-semibold">
                        {reporte.cantidad_producida.toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-600">
                        {reporte.cantidad_defectuosa.toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 pr-4 font-mono font-semibold text-blue-600">
                        {(reporte.cantidad_producida - reporte.cantidad_defectuosa).toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 text-xs max-w-xs" title={reporte.observaciones || ''}>
                        <div className="whitespace-pre-wrap line-clamp-2">
                          {reporte.observaciones || '-'}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs max-w-xs" title={reporte.incidencias || ''}>
                        <div className="whitespace-pre-wrap line-clamp-2">
                          {reporte.incidencias || '-'}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => handleDescargarPDFReporte(reporte)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                          title="Descargar reporte como PDF"
                        >
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de Mis Reportes Enviados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">📊 Mis Reportes Enviados</h2>
            <p className="text-sm text-gray-500 mt-1">
              Reportes que tú has creado y enviado
            </p>
          </div>
          <button
            onClick={fetchReportesEnviados}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="Refrescar reportes"
          >
            🔄 Actualizar
          </button>
        </div>
        {loadingReportes ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando reportes...</p>
          </div>
        ) : reportesEnviados.filter(r => !esReporteDeIngenieria(r.observaciones)).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No has enviado reportes aún.</p>
            <p className="text-sm text-gray-400 mt-2">Haz clic en "Enviar Reporte" para crear uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Línea</th>
                  <th className="py-3 pr-4 font-medium">Producido</th>
                  <th className="py-3 pr-4 font-medium">Defectuoso</th>
                  <th className="py-3 pr-4 font-medium">Neto</th>
                  <th className="py-3 pr-4 font-medium">Observaciones</th>
                  <th className="py-3 pr-4 font-medium">Incidencias</th>
                </tr>
              </thead>
              <tbody>
                {reportesEnviados
                  .filter(reporte => !esReporteDeIngenieria(reporte.observaciones))
                  .map((reporte) => (
                    <tr 
                      key={reporte.id} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4">
                        {new Date(reporte.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4">{reporte.linea_nombre || '-'}</td>
                      <td className="py-3 pr-4 font-mono text-green-600">{reporte.cantidad_producida.toLocaleString('es-PE')}</td>
                      <td className="py-3 pr-4 font-mono text-red-600">{reporte.cantidad_defectuosa.toLocaleString('es-PE')}</td>
                      <td className="py-3 pr-4 font-mono font-semibold text-blue-600">
                        {(reporte.cantidad_producida - reporte.cantidad_defectuosa).toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs max-w-xs truncate" title={reporte.observaciones || ''}>
                        {reporte.observaciones || '-'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs max-w-xs truncate" title={reporte.incidencias || ''}>
                        {reporte.incidencias || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Mis registros</h2>
        {registros.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay registros de producción aún.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Línea</th>
                  <th className="py-3 pr-4 font-medium">Producto</th>
                  <th className="py-3 pr-4 font-medium">Cantidad</th>
                  <th className="py-3 pr-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      {new Date(r.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="py-3 pr-4">{r.linea_nombre}</td>
                    <td className="py-3 pr-4">{r.producto}</td>
                    <td className="py-3 pr-4 font-mono">{r.cantidad.toLocaleString('es-PE')}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEstadoColor(r.estado)}`}>
                        {getEstadoTexto(r.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal Enviar Reporte */}
      {showEnviarReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📤 Enviar Reporte Diario</h2>
                <button
                  onClick={() => setShowEnviarReporte(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEnviarReporte} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={reporteDiario.fecha}
                      onChange={handleReporteChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* Línea de Producción (para asociar el reporte) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Línea de Producción:
                    </label>
                    <select
                      name="linea_produccion"
                      value={reporteDiario.linea_produccion}
                      onChange={handleReporteChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar línea</option>
                      {lineasProduccion.map((linea) => (
                        <option key={linea.id} value={linea.id}>
                          {linea.nombre}
                          {linea.usuarios.length > 0 && ` (${linea.usuarios.join(', ')})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dueño de la Línea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dueño de la Línea:
                    </label>
                    <input
                      type="text"
                      name="dueno_linea"
                      value={reporteDiario.dueno_linea}
                      onChange={handleReporteChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nombre del responsable de la línea"
                    />
                  </div>

                  {/* Pedido/Ficha relacionado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pedido relacionado (ficha): <span className="text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <select
                      name="numero_ficha_rel"
                      value={reporteDiario.numero_ficha_rel}
                      onChange={(e) => {
                        const pedidoSeleccionado = pedidosRecibidos.find(p => p.numero_ficha === e.target.value);
                        setReporteDiario(prev => ({ 
                          ...prev, 
                          numero_ficha_rel: e.target.value,
                          // Auto-completar línea si el pedido tiene una línea asociada
                          linea_produccion: pedidoSeleccionado ? prev.linea_produccion : prev.linea_produccion
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar pedido recibido (opcional)</option>
                      {pedidosRecibidos.map((pedido) => (
                        <option key={pedido.id} value={pedido.numero_ficha}>
                          {pedido.numero_ficha} - {pedido.cliente} ({pedido.cantidad} und)
                        </option>
                      ))}
                    </select>
                    {pedidosRecibidos.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500">No hay pedidos recibidos. Primero recibe un pedido.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Producida: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cantidad_producida"
                      value={reporteDiario.cantidad_producida}
                      onChange={handleReporteChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Unidades"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Defectuosa:
                    </label>
                    <input
                      type="number"
                      name="cantidad_defectuosa"
                      value={reporteDiario.cantidad_defectuosa}
                      onChange={handleReporteChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Unidades"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del Trabajo:
                  </label>
                  <textarea
                    name="observaciones"
                    value={reporteDiario.observaciones}
                    onChange={handleReporteChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe el trabajo realizado durante el día..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incidencias o Problemas:
                  </label>
                  <textarea
                    name="incidencias"
                    value={reporteDiario.incidencias}
                    onChange={handleReporteChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Reporta cualquier incidencia o problema encontrado..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loadingModales}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingModales ? '⏳ Enviando...' : '✅ Enviar Reporte'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEnviarReporte(false)}
                    disabled={loadingModales}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioMiProduccionPage;



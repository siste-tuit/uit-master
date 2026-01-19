import React, { useState, useEffect } from 'react';
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

interface LineaProduccion {
  id: string;
  nombre: string;
  status: string;
  usuarios: string[];
}

interface UsuarioProduccion {
  id: string;
  email: string;
  nombre_completo: string;
  avatar: string | null;
  linea_id: string | null;
  linea_nombre: string | null;
  lineas_asignadas: string | null;
}

// Lista estática de los 13 usuarios de producción (fallback si el backend no responde)
const USUARIOS_PRODUCCION_ESTATICOS: Omit<UsuarioProduccion, 'id' | 'linea_id' | 'linea_nombre' | 'lineas_asignadas'>[] = [
  { email: 'AyC@textil.com', nombre_completo: 'Ana García', avatar: null },
  { email: 'AyC2@textil.com', nombre_completo: 'Carlos Mendoza', avatar: null },
  { email: 'AyC3@textil.com', nombre_completo: 'Carmen Torres', avatar: null },
  { email: 'AyC4@textil.com', nombre_completo: 'Carmen Vega', avatar: null },
  { email: 'DyM@textil.com', nombre_completo: 'Fernando Díaz', avatar: null },
  { email: 'Elenatex@textil.com', nombre_completo: 'Juan Pérez', avatar: null },
  { email: 'Emanuel@textil.com', nombre_completo: 'Luis Sánchez', avatar: null },
  { email: 'Emanuel2@textil.com', nombre_completo: 'María López', avatar: null },
  { email: 'JflStyle@textil.com', nombre_completo: 'Miguel Herrera', avatar: null },
  { email: 'Juanazea@textil.com', nombre_completo: 'Patricia López', avatar: null },
  { email: 'Myl@textil.com', nombre_completo: 'Pedro Martínez', avatar: null },
  { email: 'Myl2@textil.com', nombre_completo: 'Roberto Torres', avatar: null },
  { email: 'Velasquez@textil.com', nombre_completo: 'Sandra Morales', avatar: null },
];

const IngenieriaProduccionPage: React.FC = () => {
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

  const [lineasProduccion, setLineasProduccion] = useState<LineaProduccion[]>([]);
  const [loadingLineas, setLoadingLineas] = useState(true);
  const [usuariosProduccion, setUsuariosProduccion] = useState<UsuarioProduccion[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        setLoadingLineas(true);
        const response = await fetch(`${API_BASE_URL_CORE}/produccion/lineas-con-usuarios`);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Líneas recibidas del backend:', data.lineas.length);
          console.log('📋 Lista completa de líneas:', data.lineas);
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

  // Cargar usuarios de producción
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        const token = localStorage.getItem('erp_token');
        
        try {
          const response = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/usuarios-produccion`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('👥 Usuarios de producción recibidos del backend:', data.usuarios?.length || 0);
            
            // Filtrar solo los 13 usuarios de producción
            const correosPermitidos = [
              'AyC@textil.com', 'AyC2@textil.com', 'AyC3@textil.com', 'AyC4@textil.com',
              'DyM@textil.com', 'Elenatex@textil.com', 'Emanuel@textil.com', 'Emanuel2@textil.com',
              'JflStyle@textil.com', 'Juanazea@textil.com', 'Myl@textil.com', 'Myl2@textil.com',
              'Velasquez@textil.com'
            ];
            
            const usuariosFiltrados = (data.usuarios || []).filter((u: UsuarioProduccion) => 
              correosPermitidos.includes(u.email)
            );
            
            // Combinar con usuarios estáticos para asegurar que siempre tengamos todos
            const usuariosCombinados = correosPermitidos.map(correo => {
              const usuarioBackend = usuariosFiltrados.find((u: UsuarioProduccion) => u.email === correo);
              const usuarioEstatico = USUARIOS_PRODUCCION_ESTATICOS.find(u => u.email === correo);
              
              return usuarioBackend || {
                id: `static-${correo}`, // ID temporal para usuarios estáticos
                email: correo,
                nombre_completo: usuarioEstatico?.nombre_completo || correo,
                avatar: null,
                linea_id: null,
                linea_nombre: null,
                lineas_asignadas: null
              };
            });
            
            setUsuariosProduccion(usuariosCombinados);
            console.log('✅ Usuarios cargados:', usuariosCombinados.length);
          } else {
            console.warn('⚠️ Error al cargar usuarios del backend, usando lista estática');
            // Usar lista estática como fallback
            const usuariosEstaticosCompletos = USUARIOS_PRODUCCION_ESTATICOS.map((u, index) => ({
              ...u,
              id: `static-${index}`,
              linea_id: null,
              linea_nombre: null,
              lineas_asignadas: null
            }));
            setUsuariosProduccion(usuariosEstaticosCompletos);
          }
        } catch (fetchError) {
          console.warn('⚠️ Error de conexión con el backend, usando lista estática:', fetchError);
          // Usar lista estática como fallback
          const usuariosEstaticosCompletos = USUARIOS_PRODUCCION_ESTATICOS.map((u, index) => ({
            ...u,
            id: `static-${index}`,
            linea_id: null,
            linea_nombre: null,
            lineas_asignadas: null
          }));
          setUsuariosProduccion(usuariosEstaticosCompletos);
        }
      } catch (error) {
        console.error('❌ Error general al cargar usuarios:', error);
        // Fallback a lista estática
        const usuariosEstaticosCompletos = USUARIOS_PRODUCCION_ESTATICOS.map((u, index) => ({
          ...u,
          id: `static-${index}`,
          linea_id: null,
          linea_nombre: null,
          lineas_asignadas: null
        }));
        setUsuariosProduccion(usuariosEstaticosCompletos);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuarioSeleccionado) {
      alert('⚠️ Por favor selecciona un usuario de producción para enviar el pedido');
      return;
    }

    if (!formData.cliente || !formData.ficha || !formData.cantidad || !formData.linea_produccion) {
      alert('⚠️ Por favor completa los campos obligatorios: Cliente, Ficha, Cantidad y Línea de Producción');
      return;
    }

    const usuarioDestino = usuariosProduccion.find(u => u.id === usuarioSeleccionado);
    
    // Si el ID es estático (empieza con "static-"), necesitamos obtener el ID real del backend
    let usuarioDestinoId = usuarioSeleccionado;
    
    if (usuarioSeleccionado.startsWith('static-')) {
      // Intentar obtener el ID real del usuario por email
      try {
        const token = localStorage.getItem('erp_token');
        const usuariosResponse = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/usuarios-produccion`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json();
          const usuarioReal = usuariosData.usuarios?.find((u: UsuarioProduccion) => u.email === usuarioDestino?.email);
          if (usuarioReal) {
            usuarioDestinoId = usuarioReal.id;
          } else {
            alert('⚠️ No se pudo encontrar el usuario en el sistema. Por favor, verifica que el usuario esté creado en la base de datos.');
            return;
          }
        }
      } catch (error) {
        console.error('Error al obtener ID del usuario:', error);
        alert('⚠️ No se pudo verificar el usuario. Por favor, verifica la conexión con el servidor.');
        return;
      }
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`${API_BASE_URL_CORE}/reportes-produccion/pedidos-recibidos/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_destino_id: usuarioDestinoId,
          numero_ficha: formData.ficha,
          numero_pedido: formData.ficha,
          cliente: formData.cliente,
          cantidad: parseInt(formData.cantidad),
          fecha_recepcion: new Date().toISOString().split('T')[0],
          observaciones: formData.especificacion || '',
          estilo_cliente: formData.estilo_cliente || '',
          color: formData.color || '',
          linea_produccion: formData.linea_produccion,
          operacion: formData.operacion || '',
          codigo_operacion: formData.codigo_operacion || '',
          fecha_envio: formData.fecha_envio || '',
          fecha_recojo: formData.fecha_recojo || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar el pedido');
      }

      const result = await response.json();
      alert(`✅ Pedido enviado exitosamente a ${usuarioDestino?.nombre_completo || 'usuario'} (${usuarioDestino?.email})`);
      
      // Limpiar formulario
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
      setUsuarioSeleccionado('');
    } catch (error: any) {
      console.error('Error al enviar pedido:', error);
      alert(`❌ Error: ${error.message || 'No se pudo enviar el pedido'}`);
    } finally {
      setEnviando(false);
    }
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

      // Función para agregar texto con saltos de línea automáticos
      const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, align: string = 'left') => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏭 Producción</h1>
        <p className="text-gray-600">Gestión de pedidos y líneas de producción.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Enviar Pedido a Usuario de Producción</h2>

          <div className="space-y-4">
            {/* Selección de Usuario de Producción */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-bold text-blue-900 mb-2">
                👤 Usuario de Producción Destino: <span className="text-red-500">*</span>
              </label>
              {loadingUsuarios ? (
                <p className="text-sm text-gray-500">Cargando usuarios...</p>
              ) : (
                <select
                  value={usuarioSeleccionado}
                  onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Selecciona un usuario de producción --</option>
                  {usuariosProduccion.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre_completo} - {usuario.email} {usuario.linea_nombre ? `(${usuario.linea_nombre})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {usuarioSeleccionado && (
                <p className="mt-2 text-sm text-blue-700">
                  ✅ Pedido será enviado a: <strong>{usuariosProduccion.find(u => u.id === usuarioSeleccionado)?.nombre_completo}</strong> ({usuariosProduccion.find(u => u.id === usuarioSeleccionado)?.email})
                </p>
              )}
              {usuariosProduccion.length === 0 && !loadingUsuarios && (
                <p className="mt-2 text-sm text-yellow-600">
                  ⚠️ No se encontraron usuarios de producción. Contacta al administrador del sistema.
                </p>
              )}
              {usuariosProduccion.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  📋 {usuariosProduccion.length} usuario(s) de producción disponible(s)
                </p>
              )}
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente:
              </label>
              <select
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar cliente</option>
                <option value="confecciones-modernas">Confecciones Modernas S.A.S</option>
                <option value="lacoste">LACOSTE</option>
                <option value="lands-end">LANDS END</option>
                <option value="marmaxx">MARMAXX</option>
                <option value="moda-express">Moda Express</option>
                <option value="original-favorites">ORIGINAL FAVORITES</option>
                <option value="paramount-apparel">PARAMOUNT APPAREAL INT. INC.</option>
                <option value="textiles-del-sur">Textiles del Sur</option>
              </select>
            </div>

            {/* Ficha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ficha:
              </label>
              <input
                type="text"
                name="ficha"
                value={formData.ficha}
                onChange={handleChange}
                placeholder="Número de ficha o referencia"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Estilo del Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilo del Cliente:
              </label>
              <input
                type="text"
                name="estilo_cliente"
                value={formData.estilo_cliente}
                onChange={handleChange}
                placeholder="Ej: Casual, Formal, Deportivo, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color:
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ej: Azul, Rojo, Verde, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad:
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="Ingresa la cantidad"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Línea de Producción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Línea de Producción:
              </label>
              <select
                name="linea_produccion"
                value={formData.linea_produccion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              {lineasProduccion.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {lineasProduccion.length} línea(s) disponible(s)
                </p>
              )}
              {loadingLineas && (
                <p className="mt-1 text-xs text-gray-500">Cargando líneas...</p>
              )}
            </div>

            {/* Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operación:
              </label>
              <select
                name="operacion"
                value={formData.operacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar operación</option>
                <option value="acentado-te-tapete">Acentado te tapete</option>
                <option value="asentar-abertura">Asentar abertura</option>
                <option value="asentar-vuelta-sisa">Asentar vuelta sisa</option>
                <option value="basta-faldon-mangas">Basta faldon y mangas</option>
                <option value="limpieza">Limpieza</option>
                <option value="orillar-vuelta">Orillar vuelta</option>
                <option value="recogido">Recogido</option>
                <option value="bordeado-cuello">Bordeado de cuello</option>
                <option value="cerrado-costado">Cerrado de costado</option>
                <option value="cerrado-costado-manga-larga">Cerrado de costado manga larga</option>
                <option value="cerrado-cuello">Cerrado de cuello</option>
                <option value="cerrado-mangas">Cerrado de mangas</option>
                <option value="cerrado-sisa-faldon">Cerrado sisa faldón</option>
                <option value="fijado-cuello">Fijado de cuello</option>
                <option value="fijado-loop">Fijado de loop</option>
                <option value="fijado-puntas-cuello">Fijado puntas cuello</option>
                <option value="fijar-vuelta-sisas">Fijar vuelta sisas</option>
                <option value="manual">Manual</option>
                <option value="p-cuellos">P/ cuellos/v</option>
                <option value="pegado-cuello-redondo">Pegado de cuello redondo</option>
                <option value="pegado-mangas">Pegado de mangas</option>
                <option value="pegado-tapete">Pegado de tapete</option>
                <option value="pegado-vuelta">Pegado vuelta</option>
                <option value="pespuntar-borde">Pespuntar borde</option>
                <option value="pespuntar-cuello">Pespuntar cuello</option>
                <option value="pespuntar-vuelta-escote">Pespuntar vuelta escote</option>
                <option value="piquetear-costado">Piquetear costado</option>
                <option value="recubierto-cuello">Recubierto de cuello</option>
                <option value="remalle">Remalle</option>
                <option value="union-hombros">Unión de hombros</option>
                <option value="unir-vueltas">Unir vueltas</option>
                <option value="inspeccion">Inspección</option>
                <option value="corta-loop">Corta de loop</option>
                <option value="etiqueta-compleja">Etiqueta compleja</option>
                <option value="etiquetas">Etiquetas</option>
                <option value="preparado-cuello">Preparado de cuello</option>
                <option value="atraque-aberturas">Atraque aberturas</option>
                <option value="atraque-puntas-tapete">Atraque de puntas tapete</option>
                <option value="atraque-puno-cuello">Atraque de puño y cuello</option>
              </select>
            </div>

            {/* Código de Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Operación:
              </label>
              <input
                type="text"
                name="codigo_operacion"
                value={formData.codigo_operacion}
                onChange={handleChange}
                placeholder="Ej: OP-001, A1B2, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Fecha de Envío */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Envío del Documento:
              </label>
              <input
                type="date"
                name="fecha_envio"
                value={formData.fecha_envio}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Fecha de Recojo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Recojo del Pedido:
              </label>
              <input
                type="date"
                name="fecha_recojo"
                value={formData.fecha_recojo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Especificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificación:
              </label>
              <textarea
                name="especificacion"
                value={formData.especificacion}
                onChange={handleChange}
                rows={4}
                placeholder="Escribir especificaciones técnicas, detalles del producto, instrucciones especiales, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={enviando || !usuarioSeleccionado}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {enviando ? '⏳ Enviando...' : '📤 Enviar Pedido a Usuario'}
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📄 Generar PDF
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default IngenieriaProduccionPage;


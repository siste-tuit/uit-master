import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Enviar flujo de salida desde Ingeniería a Sistemas
export const enviarFlujoSalida = async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const userId = req.user.id; // Usuario de Ingeniería que envía
    const { usuario_sistemas_id, filtros, filas } = req.body;

    // Validaciones
    if (!usuario_sistemas_id) {
      return res.status(400).json({ message: 'Debe especificar el usuario de Sistemas destinatario' });
    }

    if (!filtros || !filas || !Array.isArray(filas) || filas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar filtros y al menos una fila válida' });
    }

    // Validar que el usuario destinatario sea de Sistemas
    const [usuariosSistemas] = await conn.query(
      `SELECT u.id, u.nombre_completo, u.email, u.rol_id 
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = ? AND r.nombre = 'sistemas' AND u.is_active = TRUE`,
      [usuario_sistemas_id]
    );

    if (usuariosSistemas.length === 0) {
      return res.status(400).json({ message: 'El usuario destinatario no es válido o no pertenece a Sistemas' });
    }

    // Obtener información del usuario de Ingeniería
    const [usuarioIngenieria] = await conn.query(
      'SELECT nombre_completo, email FROM usuarios WHERE id = ?',
      [userId]
    );

    if (usuarioIngenieria.length === 0) {
      return res.status(404).json({ message: 'Usuario de Ingeniería no encontrado' });
    }

    // Filtrar filas válidas (con datos completos)
    const filasValidas = filas.filter(fila => {
      return fila.anio && fila.mes && fila.semana && fila.dia && 
             fila.fecha && fila.linea && fila.ficha && 
             fila.prendasEnviadas && parseInt(fila.prendasEnviadas) > 0;
    });

    if (filasValidas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar al menos una fila con datos completos' });
    }

    // Crear el flujo
    const flujoId = uuidv4();
    await conn.query(
      `INSERT INTO flujos_salida 
       (id, usuario_sistemas_id, usuario_ingenieria_id, usuario_ingenieria_nombre, usuario_ingenieria_email, 
        filtros, filas, total_filas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        flujoId,
        usuario_sistemas_id,
        userId,
        usuarioIngenieria[0].nombre_completo,
        usuarioIngenieria[0].email,
        JSON.stringify(filtros),
        JSON.stringify(filasValidas),
        filasValidas.length
      ]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      message: 'Flujo de salida enviado exitosamente',
      id: flujoId,
      total_filas: filasValidas.length
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('❌ Error al enviar flujo de salida:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al enviar flujo de salida',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener flujos recibidos por el usuario de Sistemas
export const getFlujosRecibidos = async (req, res) => {
  try {
    const userId = req.user.id; // Usuario de Sistemas

    const { estado, fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        id,
        usuario_ingenieria_id,
        usuario_ingenieria_nombre as enviado_por,
        usuario_ingenieria_email as enviado_por_email,
        filtros,
        filas,
        total_filas,
        estado,
        fecha_envio,
        fecha_revision,
        fecha_procesado,
        observaciones,
        created_at
      FROM flujos_salida
      WHERE usuario_sistemas_id = ?
    `;

    const params = [userId];

    if (estado && estado !== 'todos') {
      query += ' AND estado = ?';
      params.push(estado);
    }

    if (fecha_inicio) {
      query += ' AND DATE(fecha_envio) >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND DATE(fecha_envio) <= ?';
      params.push(fecha_fin);
    }

    query += ' ORDER BY fecha_envio DESC';

    const [flujos] = await pool.query(query, params);

    // Parsear JSON fields
    const flujosParseados = flujos.map(flujo => ({
      ...flujo,
      filtros: typeof flujo.filtros === 'string' ? JSON.parse(flujo.filtros) : flujo.filtros,
      filas: typeof flujo.filas === 'string' ? JSON.parse(flujo.filas) : flujo.filas,
      fecha_envio: flujo.fecha_envio
    }));

    res.json({
      flujos: flujosParseados,
      total: flujosParseados.length
    });
  } catch (error) {
    console.error('❌ Error al obtener flujos recibidos:', error);
    res.status(500).json({ 
      message: 'Error al obtener flujos recibidos',
      error: error.message 
    });
  }
};

// Actualizar estado de un flujo
export const actualizarEstadoFlujo = async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user.id; // Usuario de Sistemas

    if (!['pendiente', 'revisado', 'procesado'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    // Verificar que el flujo pertenece al usuario de Sistemas
    const [flujos] = await conn.query(
      'SELECT id, estado FROM flujos_salida WHERE id = ? AND usuario_sistemas_id = ?',
      [id, userId]
    );

    if (flujos.length === 0) {
      return res.status(404).json({ message: 'Flujo no encontrado o no tienes permisos' });
    }

    // Actualizar estado
    const updateFields = ['estado = ?'];
    const updateParams = [estado];

    if (estado === 'revisado' && flujos[0].estado === 'pendiente') {
      updateFields.push('fecha_revision = CURRENT_TIMESTAMP');
    }

    if (estado === 'procesado') {
      updateFields.push('fecha_procesado = CURRENT_TIMESTAMP');
    }

    updateParams.push(id);

    await conn.query(
      `UPDATE flujos_salida 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      updateParams
    );

    await conn.commit();
    conn.release();

    res.json({
      message: 'Estado actualizado exitosamente',
      id,
      estado
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('❌ Error al actualizar estado del flujo:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estado',
      error: error.message 
    });
  }
};

// Obtener usuarios de Sistemas (para que Ingeniería pueda seleccionar)
export const getUsuariosSistemas = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.nombre_completo, u.email, u.avatar
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE r.nombre = 'sistemas' AND u.is_active = TRUE
       ORDER BY u.nombre_completo`
    );

    res.json({
      usuarios: usuarios
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios de Sistemas:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios de Sistemas',
      error: error.message 
    });
  }
};


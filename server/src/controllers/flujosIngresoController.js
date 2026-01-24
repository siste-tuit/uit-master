import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Registrar flujo de ingreso desde Ingeniería
export const enviarFlujoIngreso = async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const userId = req.user.id;
    const { filtros, filas } = req.body;

    if (!filtros || !filas || !Array.isArray(filas) || filas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar filtros y al menos una fila válida' });
    }

    const [usuarioIngenieria] = await conn.query(
      'SELECT nombre_completo, email FROM usuarios WHERE id = ?',
      [userId]
    );

    if (usuarioIngenieria.length === 0) {
      return res.status(404).json({ message: 'Usuario de Ingeniería no encontrado' });
    }

    const filasValidas = filas.filter(fila => {
      return (
        fila.fecha &&
        fila.linea &&
        fila.ficha &&
        fila.cliente &&
        fila.prendas &&
        parseInt(fila.prendas) > 0
      );
    });

    if (filasValidas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar al menos una fila con datos completos' });
    }

    const flujoId = uuidv4();
    await conn.query(
      `INSERT INTO flujos_ingreso
       (id, usuario_ingenieria_id, usuario_ingenieria_nombre, usuario_ingenieria_email, filtros, filas, total_filas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        flujoId,
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
      message: 'Flujo de ingreso registrado exitosamente',
      id: flujoId,
      total_filas: filasValidas.length
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('❌ Error al registrar flujo de ingreso:', error);
    res.status(500).json({
      message: 'Error al registrar flujo de ingreso',
      error: error.message
    });
  }
};

// Obtener flujos de ingreso (Ingeniería / Gerencia)
export const getFlujosIngreso = async (req, res) => {
  try {
    const { linea, fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT
        id,
        usuario_ingenieria_id,
        usuario_ingenieria_nombre as creado_por,
        usuario_ingenieria_email as creado_por_email,
        filtros,
        filas,
        total_filas,
        fecha_envio,
        created_at
      FROM flujos_ingreso
      WHERE 1=1
    `;
    const params = [];

    if (linea) {
      query += ' AND JSON_EXTRACT(filtros, "$.linea") = ?';
      params.push(linea);
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

    const flujosParseados = flujos.map(flujo => ({
      ...flujo,
      filtros: typeof flujo.filtros === 'string' ? JSON.parse(flujo.filtros) : flujo.filtros,
      filas: typeof flujo.filas === 'string' ? JSON.parse(flujo.filas) : flujo.filas,
      fecha_envio: flujo.fecha_envio
    }));

    res.json({ flujos: flujosParseados, total: flujosParseados.length });
  } catch (error) {
    console.error('❌ Error al obtener flujos de ingreso:', error);
    res.status(500).json({
      message: 'Error al obtener flujos de ingreso',
      error: error.message
    });
  }
};

// controllers/ordenController.js

import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Obtener todas las Órdenes de Trabajo (OTs)
export const getOrdenesTrabajo = async (req, res) => {
    try {
        // Consulta avanzada que obtiene los detalles de la orden Y CADA REPUESTO asociado
        const [rows] = await pool.query(
            `SELECT 
                ot.id, ot.equipo_id, ot.titulo, ot.descripcion, ot.tipo, ot.estado, ot.prioridad, ot.tiempo_estimado_h, 
                ot.asignado_a, ot.fecha_vencimiento,
                e.nombre as equipo_nombre,
                u.nombre_completo as asignado_a_nombre,
                r.nombre as repuesto_nombre,
                otr.cantidad_requerida
             FROM ordenes_trabajo ot
             JOIN equipos e ON ot.equipo_id = e.id
             LEFT JOIN usuarios u ON ot.asignado_a = u.id
             LEFT JOIN ot_repuestos otr ON ot.id = otr.ot_id
             LEFT JOIN repuestos r ON otr.repuesto_id = r.id
             ORDER BY ot.fecha_vencimiento ASC`
        );

        const ordenesMap = new Map();

        for (const row of rows) {
            const otId = row.id;

            if (!ordenesMap.has(otId)) {
                // 1. Inicializar la OT con datos base
                ordenesMap.set(otId, {
                    // Copiamos todas las propiedades del row excepto las de repuesto
                    id: row.id,
                    equipo_id: row.equipo_id,
                    titulo: row.titulo,
                    descripcion: row.descripcion,
                    tipo: row.tipo,
                    estado: row.estado,
                    prioridad: row.prioridad,
                    tiempo_estimado_h: row.tiempo_estimado_h,
                    asignado_a: row.asignado_a,
                    fecha_vencimiento: row.fecha_vencimiento,
                    equipo_nombre: row.equipo_nombre,
                    asignado_a_nombre: row.asignado_a_nombre,

                    total_repuestos: 0,
                    repuestos_necesarios: [] // Array que contendrá los chips
                });
            }

            const orden = ordenesMap.get(otId);

            // 2. Si hay un repuesto en esta fila, agrégalo al array
            if (row.repuesto_nombre) {
                // Usamos las propiedades DIRECTAMENTE de la fila, que SÍ existen
                orden.repuestos_necesarios.push({
                    repuesto_nombre: row.repuesto_nombre, // <-- Aseguramos el nombre
                    cantidad_requerida: row.cantidad_requerida
                });

                // 3. Contar el número de repuestos distintos (si el array creció)
                orden.total_repuestos = orden.repuestos_necesarios.length;
            }
        }

        // Convertir el Map a un Array para enviarlo al frontend
        const result = Array.from(ordenesMap.values());

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener OTs:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener una OT por ID (incluyendo repuestos)
export const getOrdenTrabajoById = async (req, res) => {
    const conn = await pool.getConnection(); // Usamos una conexión para transacciones/múltiples queries
    try {
        const { id } = req.params;

        // 1. Obtener datos de la OT
        const [otRows] = await conn.query(
            `SELECT 
                ot.*, 
                e.nombre as equipo_nombre,
                u.nombre_completo as asignado_a_nombre
             FROM ordenes_trabajo ot
             JOIN equipos e ON ot.equipo_id = e.id
             LEFT JOIN usuarios u ON ot.asignado_a = u.id
             WHERE ot.id = ?`,
            [id]
        );

        if (otRows.length === 0) {
            conn.release();
            return res.status(404).json({ message: 'Orden de Trabajo no encontrada.' });
        }
        const ordenTrabajo = otRows[0];

        // 2. Obtener repuestos necesarios (YA ESTABA BIEN, solo devuelve los datos del detalle)
        const [repuestosRows] = await conn.query(
            `SELECT 
                otr.cantidad_requerida,
                otr.cantidad_utilizada,
                r.id as repuesto_id,
                r.nombre as repuesto_nombre,
                r.codigo as repuesto_codigo
             FROM ot_repuestos otr
             JOIN repuestos r ON otr.repuesto_id = r.id
             WHERE otr.ot_id = ?`,
            [id]
        );

        ordenTrabajo.repuestos_necesarios = repuestosRows;

        conn.release();
        res.status(200).json(ordenTrabajo);
    } catch (error) {
        conn.release();
        console.error('Error al obtener OT:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear una nueva OT (SIN CAMBIOS RELEVANTES)
export const createOrdenTrabajo = async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const { equipo_id, titulo, descripcion, tipo, estado, prioridad, tiempo_estimado_h, asignado_a, fecha_vencimiento, repuestos } = req.body;

        // 1. Insertar la OT
        const otId = uuidv4();
        await conn.query(
            `INSERT INTO ordenes_trabajo 
             (id, equipo_id, titulo, descripcion, tipo, estado, prioridad, tiempo_estimado_h, asignado_a, fecha_vencimiento)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [otId, equipo_id, titulo, descripcion, tipo, estado, prioridad, tiempo_estimado_h, asignado_a || null, fecha_vencimiento || null]
        );

        // 2. Insertar repuestos (si los hay)
        if (repuestos && repuestos.length > 0) {
            const repuestosData = repuestos.map(r => [otId, r.repuesto_id, r.cantidad_requerida, 0]); // Añadimos 0 para cantidad_utilizada
            await conn.query(
                `INSERT INTO ot_repuestos (ot_id, repuesto_id, cantidad_requerida, cantidad_utilizada) VALUES ?`,
                [repuestosData]
            );
        }

        await conn.commit();
        conn.release();
        res.status(201).json({
            message: 'Orden de Trabajo creada exitosamente',
            id: otId
        });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('Error al crear OT:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar una OT existente (SIN CAMBIOS RELEVANTES)
export const updateOrdenTrabajo = async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo, estado, prioridad, tiempo_estimado_h, asignado_a, fecha_vencimiento, notas_finales, repuestos } = req.body;

        // 1. Actualizar la OT
        const [result] = await conn.query(
            `UPDATE ordenes_trabajo SET 
             titulo = ?, descripcion = ?, tipo = ?, estado = ?, prioridad = ?, 
             tiempo_estimado_h = ?, asignado_a = ?, fecha_vencimiento = ?, notas_finales = ?,
             fecha_finalizacion = CASE WHEN estado = 'COMPLETADA' THEN NOW() ELSE fecha_finalizacion END
             WHERE id = ?`,
            [titulo, descripcion, tipo, estado, prioridad, tiempo_estimado_h, asignado_a || null, fecha_vencimiento || null, notas_finales || null, id]
        );

        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ message: 'Orden de Trabajo no encontrada para actualizar.' });
        }

        // 2. Manejar repuestos (Eliminar y Reinsertar/Actualizar)
        if (repuestos) {
            await conn.query("DELETE FROM ot_repuestos WHERE ot_id = ?", [id]);

            if (repuestos.length > 0) {
                const repuestosData = repuestos.map(r => [id, r.repuesto_id, r.cantidad_requerida, r.cantidad_utilizada]);
                await conn.query(
                    `INSERT INTO ot_repuestos (ot_id, repuesto_id, cantidad_requerida, cantidad_utilizada) VALUES ?`,
                    [repuestosData]
                );
            }
        }

        await conn.commit();
        conn.release();
        res.status(200).json({ message: 'Orden de Trabajo actualizada exitosamente.' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('Error al actualizar OT:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar una OT (SIN CAMBIOS)
export const deleteOrdenTrabajo = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM ordenes_trabajo WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden de Trabajo no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Orden de Trabajo eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar OT:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
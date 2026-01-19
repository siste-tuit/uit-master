// controllers/calendarioController.js

import { pool } from '../config/db.js';

// Obtener eventos del calendario (filtrado por rango de fechas opcional)
export const getEventosCalendario = async (req, res) => {
    try {
        const { start_date, end_date } = req.query; // Filtro opcional

        let query = `
            SELECT 
                cm.*, 
                e.nombre as equipo_nombre,
                e.linea_produccion
             FROM calendario_mantenimiento cm
             JOIN equipos e ON cm.equipo_id = e.id
        `;
        const params = [];

        if (start_date && end_date) {
            query += ` WHERE cm.fecha_programada BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY cm.fecha_programada ASC`;

        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener eventos de calendario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener evento por ID
export const getEventoCalendarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT 
                cm.*, 
                e.nombre as equipo_nombre
             FROM calendario_mantenimiento cm
             JOIN equipos e ON cm.equipo_id = e.id
             WHERE cm.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Evento de calendario no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener evento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear un nuevo evento
export const createEventoCalendario = async (req, res) => {
    try {
        const { equipo_id, nombre_evento, descripcion, tipo, prioridad, fecha_programada, hora_inicio, hora_fin, ot_id } = req.body;

        const [result] = await pool.query(
            `INSERT INTO calendario_mantenimiento 
             (id, equipo_id, nombre_evento, descripcion, tipo, prioridad, fecha_programada, hora_inicio, hora_fin, ot_id)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [equipo_id, nombre_evento, descripcion, tipo, prioridad, fecha_programada, hora_inicio || null, hora_fin || null, ot_id || null]
        );

        res.status(201).json({
            message: 'Evento creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar un evento existente
export const updateEventoCalendario = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipo_id, nombre_evento, descripcion, tipo, prioridad, fecha_programada, hora_inicio, hora_fin, estado, ot_id } = req.body;

        const [result] = await pool.query(
            `UPDATE calendario_mantenimiento SET 
             equipo_id = ?, nombre_evento = ?, descripcion = ?, tipo = ?, prioridad = ?, 
             fecha_programada = ?, hora_inicio = ?, hora_fin = ?, estado = ?, ot_id = ?
             WHERE id = ?`,
            [equipo_id, nombre_evento, descripcion, tipo, prioridad, fecha_programada, hora_inicio || null, hora_fin || null, estado, ot_id || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Evento actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar un evento
export const deleteEventoCalendario = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM calendario_mantenimiento WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Evento eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
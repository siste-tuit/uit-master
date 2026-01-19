// controllers/equipoController.js

import { pool } from '../config/db.js';

// Obtener todos los equipos
export const getEquipos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                e.*, 
                u.nombre_completo as responsable_nombre
             FROM equipos e
             LEFT JOIN usuarios u ON e.responsable_id = u.id`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener un equipo por ID
export const getEquipoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT 
                e.*, 
                u.nombre_completo as responsable_nombre
             FROM equipos e
             LEFT JOIN usuarios u ON e.responsable_id = u.id
             WHERE e.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear un nuevo equipo
export const createEquipo = async (req, res) => {
    try {
        const { codigo, nombre, descripcion, estado, linea_produccion, horas_operacion, responsable_id, ultimo_mantenimiento, proximo_mantenimiento, ubicacion } = req.body;

        const [result] = await pool.query(
            `INSERT INTO equipos 
             (id, codigo, nombre, descripcion, estado, linea_produccion, horas_operacion, responsable_id, ultimo_mantenimiento, proximo_mantenimiento, ubicacion)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, nombre, descripcion, estado, linea_produccion, horas_operacion, responsable_id || null, ultimo_mantenimiento || null, proximo_mantenimiento || null, ubicacion]
        );

        res.status(201).json({
            message: 'Equipo creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar un equipo existente
export const updateEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, descripcion, estado, linea_produccion, horas_operacion, responsable_id, ultimo_mantenimiento, proximo_mantenimiento, ubicacion } = req.body;

        const [result] = await pool.query(
            `UPDATE equipos SET 
             codigo = ?, nombre = ?, descripcion = ?, estado = ?, linea_produccion = ?, 
             horas_operacion = ?, responsable_id = ?, ultimo_mantenimiento = ?, 
             proximo_mantenimiento = ?, ubicacion = ?
             WHERE id = ?`,
            [codigo, nombre, descripcion, estado, linea_produccion, horas_operacion, responsable_id || null, ultimo_mantenimiento || null, proximo_mantenimiento || null, ubicacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Equipo actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar un equipo
export const deleteEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM equipos WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Equipo eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
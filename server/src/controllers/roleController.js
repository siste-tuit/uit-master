// controllers/roleController.js

import { pool } from '../config/db.js';

/**
 * [GET] Listar todos los roles
 */
export const getAllRoles = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, nombre 
            FROM roles
            ORDER BY id
        `);

        // Retornamos los roles en un formato simple
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error interno del servidor al listar roles.' });
    }
};
// Controlador para gestión de trabajadores
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * [GET] Obtener todos los trabajadores de un usuario
 */
export const getTrabajadoresByUsuario = async (req, res) => {
    try {
        const { id } = req.user; // ID del usuario autenticado

        const [trabajadores] = await pool.query(
            `SELECT 
                id,
                usuario_id,
                nombre_completo,
                dni,
                telefono,
                cargo,
                area,
                fecha_ingreso,
                is_activo,
                created_at,
                updated_at
            FROM trabajadores
            WHERE usuario_id = ?
            ORDER BY nombre_completo`,
            [id]
        );

        res.status(200).json({
            success: true,
            trabajadores: trabajadores
        });
    } catch (error) {
        console.error('Error al obtener trabajadores:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [POST] Crear un nuevo trabajador
 */
export const createTrabajador = async (req, res) => {
    try {
        const { id } = req.user;
        const { nombre_completo, dni, telefono, cargo, area, fecha_ingreso } = req.body;

        // Validar que no exceda el límite de 15 trabajadores activos
        const [count] = await pool.query(
            `SELECT COUNT(*) as total FROM trabajadores WHERE usuario_id = ? AND is_activo = TRUE`,
            [id]
        );

        if (count[0].total >= 15) {
            return res.status(400).json({
                success: false,
                message: 'Has alcanzado el límite máximo de 15 trabajadores activos.'
            });
        }

        // Validar campos requeridos
        if (!nombre_completo || nombre_completo.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre completo es obligatorio.'
            });
        }

        const trabajadorId = uuidv4();

        await pool.query(
            `INSERT INTO trabajadores 
            (id, usuario_id, nombre_completo, dni, telefono, cargo, area, fecha_ingreso, is_activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [trabajadorId, id, nombre_completo.trim(), dni || null, telefono || null, cargo || null, area || null, fecha_ingreso || null]
        );

        // Obtener el trabajador creado
        const [trabajador] = await pool.query(
            `SELECT * FROM trabajadores WHERE id = ?`,
            [trabajadorId]
        );

        res.status(201).json({
            success: true,
            message: 'Trabajador creado exitosamente.',
            trabajador: trabajador[0]
        });
    } catch (error) {
        console.error('Error al crear trabajador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [PUT] Actualizar un trabajador
 */
export const updateTrabajador = async (req, res) => {
    try {
        const { id } = req.user;
        const { trabajadorId } = req.params;
        const { nombre_completo, dni, telefono, cargo, area, fecha_ingreso, is_activo } = req.body;

        // Verificar que el trabajador pertenece al usuario
        const [trabajador] = await pool.query(
            `SELECT * FROM trabajadores WHERE id = ? AND usuario_id = ?`,
            [trabajadorId, id]
        );

        if (trabajador.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trabajador no encontrado.'
            });
        }

        // Si se está activando y ya tiene 15 activos, verificar
        if (is_activo === true && trabajador[0].is_activo === false) {
            const [count] = await pool.query(
                `SELECT COUNT(*) as total FROM trabajadores WHERE usuario_id = ? AND is_activo = TRUE`,
                [id]
            );

            if (count[0].total >= 15) {
                return res.status(400).json({
                    success: false,
                    message: 'Has alcanzado el límite máximo de 15 trabajadores activos.'
                });
            }
        }

        await pool.query(
            `UPDATE trabajadores SET
                nombre_completo = ?,
                dni = ?,
                telefono = ?,
                cargo = ?,
                area = ?,
                fecha_ingreso = ?,
                is_activo = ?,
                updated_at = NOW()
            WHERE id = ? AND usuario_id = ?`,
            [
                nombre_completo?.trim() || trabajador[0].nombre_completo,
                dni !== undefined ? dni : trabajador[0].dni,
                telefono !== undefined ? telefono : trabajador[0].telefono,
                cargo !== undefined ? cargo : trabajador[0].cargo,
                area !== undefined ? area : trabajador[0].area,
                fecha_ingreso !== undefined ? fecha_ingreso : trabajador[0].fecha_ingreso,
                is_activo !== undefined ? is_activo : trabajador[0].is_activo,
                trabajadorId,
                id
            ]
        );

        // Obtener el trabajador actualizado
        const [updated] = await pool.query(
            `SELECT * FROM trabajadores WHERE id = ?`,
            [trabajadorId]
        );

        res.status(200).json({
            success: true,
            message: 'Trabajador actualizado exitosamente.',
            trabajador: updated[0]
        });
    } catch (error) {
        console.error('Error al actualizar trabajador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [DELETE] Eliminar un trabajador (soft delete)
 */
export const deleteTrabajador = async (req, res) => {
    try {
        const { id } = req.user;
        const { trabajadorId } = req.params;

        // Verificar que el trabajador pertenece al usuario
        const [trabajador] = await pool.query(
            `SELECT * FROM trabajadores WHERE id = ? AND usuario_id = ?`,
            [trabajadorId, id]
        );

        if (trabajador.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trabajador no encontrado.'
            });
        }

        // Soft delete: marcar como inactivo
        await pool.query(
            `UPDATE trabajadores SET is_activo = FALSE, updated_at = NOW() WHERE id = ?`,
            [trabajadorId]
        );

        res.status(200).json({
            success: true,
            message: 'Trabajador eliminado exitosamente.'
        });
    } catch (error) {
        console.error('Error al eliminar trabajador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};


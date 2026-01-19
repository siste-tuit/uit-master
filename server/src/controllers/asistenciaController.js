// Controlador para gestión de asistencia de trabajadores
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * [GET] Obtener registros de asistencia de trabajadores de un usuario
 */
export const getRegistrosAsistencia = async (req, res) => {
    try {
        const { id } = req.user;
        const { fecha, trabajadorId } = req.query;

        let query = `
            SELECT 
                ra.id,
                ra.trabajador_id,
                ra.usuario_id,
                ra.fecha,
                ra.hora_entrada,
                ra.hora_refrigerio_salida,
                ra.hora_refrigerio_llegada,
                ra.hora_salida,
                ra.horas_trabajadas,
                ra.observaciones,
                ra.created_at,
                ra.updated_at,
                t.nombre_completo as trabajador_nombre,
                t.dni as trabajador_dni,
                t.cargo as trabajador_cargo
            FROM registros_asistencia ra
            INNER JOIN trabajadores t ON ra.trabajador_id = t.id
            WHERE ra.usuario_id = ? AND t.usuario_id = ?
        `;

        const params = [id, id];

        if (fecha) {
            query += ` AND ra.fecha = ?`;
            params.push(fecha);
        }

        if (trabajadorId) {
            query += ` AND ra.trabajador_id = ?`;
            params.push(trabajadorId);
        }

        query += ` ORDER BY ra.fecha DESC, t.nombre_completo`;

        const [registros] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            registros: registros
        });
    } catch (error) {
        console.error('Error al obtener registros de asistencia:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [GET] Obtener registros de asistencia globales (solo sistemas)
 */
export const getRegistrosAsistenciaGlobal = async (req, res) => {
    try {
        const { fecha, usuarioId, usuarioEmail, area } = req.query;

        let query = `
            SELECT 
                ra.id,
                ra.trabajador_id,
                ra.usuario_id,
                ra.fecha,
                ra.hora_entrada,
                ra.hora_refrigerio_salida,
                ra.hora_refrigerio_llegada,
                ra.hora_salida,
                ra.horas_trabajadas,
                ra.observaciones,
                ra.created_at,
                ra.updated_at,
                t.nombre_completo as trabajador_nombre,
                t.dni as trabajador_dni,
                t.cargo as trabajador_cargo,
                t.area as trabajador_area,
                u.email as usuario_email,
                u.nombre_completo as usuario_nombre
            FROM registros_asistencia ra
            INNER JOIN trabajadores t ON ra.trabajador_id = t.id
            INNER JOIN usuarios u ON ra.usuario_id = u.id
            WHERE 1 = 1
        `;

        const params = [];

        if (fecha) {
            query += ` AND ra.fecha = ?`;
            params.push(fecha);
        }

        if (usuarioId) {
            query += ` AND ra.usuario_id = ?`;
            params.push(usuarioId);
        }

        if (usuarioEmail) {
            query += ` AND u.email = ?`;
            params.push(usuarioEmail);
        }

        if (area) {
            query += ` AND t.area = ?`;
            params.push(area);
        }

        query += ` ORDER BY ra.fecha DESC, u.email, t.nombre_completo`;

        const [registros] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            registros
        });
    } catch (error) {
        console.error('Error al obtener registros de asistencia global:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [POST] Crear o actualizar registro de asistencia
 */
export const createOrUpdateRegistroAsistencia = async (req, res) => {
    try {
        const { id } = req.user;
        const { trabajadorId, fecha, hora_entrada, hora_refrigerio_salida, hora_refrigerio_llegada, hora_salida, observaciones } = req.body;

        // Validar campos requeridos
        if (!trabajadorId || !fecha) {
            return res.status(400).json({
                success: false,
                message: 'El trabajador y la fecha son obligatorios.'
            });
        }

        // Verificar que el trabajador pertenece al usuario
        const [trabajador] = await pool.query(
            `SELECT * FROM trabajadores WHERE id = ? AND usuario_id = ? AND is_activo = TRUE`,
            [trabajadorId, id]
        );

        if (trabajador.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trabajador no encontrado o inactivo.'
            });
        }

        // Verificar si ya existe un registro para esta fecha
        const [existing] = await pool.query(
            `SELECT * FROM registros_asistencia WHERE trabajador_id = ? AND fecha = ?`,
            [trabajadorId, fecha]
        );

        // Calcular horas trabajadas
        let horas_trabajadas = null;
        if (hora_entrada && hora_salida) {
            const entrada = new Date(`2000-01-01 ${hora_entrada}`);
            const salida = new Date(`2000-01-01 ${hora_salida}`);
            let diffMs = salida - entrada;

            // Restar tiempo de refrigerio si está registrado
            if (hora_refrigerio_salida && hora_refrigerio_llegada) {
                const refSalida = new Date(`2000-01-01 ${hora_refrigerio_salida}`);
                const refLlegada = new Date(`2000-01-01 ${hora_refrigerio_llegada}`);
                const refDiffMs = refLlegada - refSalida;
                diffMs -= refDiffMs;
            }

            horas_trabajadas = (diffMs / (1000 * 60 * 60)).toFixed(2);
        }

        if (existing.length > 0) {
            // Actualizar registro existente
            await pool.query(
                `UPDATE registros_asistencia SET
                    hora_entrada = ?,
                    hora_refrigerio_salida = ?,
                    hora_refrigerio_llegada = ?,
                    hora_salida = ?,
                    horas_trabajadas = ?,
                    observaciones = ?,
                    updated_at = NOW()
                WHERE id = ?`,
                [
                    hora_entrada || existing[0].hora_entrada,
                    hora_refrigerio_salida || existing[0].hora_refrigerio_salida,
                    hora_refrigerio_llegada || existing[0].hora_refrigerio_llegada,
                    hora_salida || existing[0].hora_salida,
                    horas_trabajadas || existing[0].horas_trabajadas,
                    observaciones || existing[0].observaciones,
                    existing[0].id
                ]
            );

            const [updated] = await pool.query(
                `SELECT 
                    ra.*,
                    t.nombre_completo as trabajador_nombre,
                    t.dni as trabajador_dni,
                    t.cargo as trabajador_cargo
                FROM registros_asistencia ra
                INNER JOIN trabajadores t ON ra.trabajador_id = t.id
                WHERE ra.id = ?`,
                [existing[0].id]
            );

            res.status(200).json({
                success: true,
                message: 'Registro de asistencia actualizado exitosamente.',
                registro: updated[0]
            });
        } else {
            // Crear nuevo registro
            const registroId = uuidv4();

            await pool.query(
                `INSERT INTO registros_asistencia 
                (id, trabajador_id, usuario_id, fecha, hora_entrada, hora_refrigerio_salida, hora_refrigerio_llegada, hora_salida, horas_trabajadas, observaciones)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    registroId,
                    trabajadorId,
                    id,
                    fecha,
                    hora_entrada || null,
                    hora_refrigerio_salida || null,
                    hora_refrigerio_llegada || null,
                    hora_salida || null,
                    horas_trabajadas || null,
                    observaciones || null
                ]
            );

            const [newRegistro] = await pool.query(
                `SELECT 
                    ra.*,
                    t.nombre_completo as trabajador_nombre,
                    t.dni as trabajador_dni,
                    t.cargo as trabajador_cargo
                FROM registros_asistencia ra
                INNER JOIN trabajadores t ON ra.trabajador_id = t.id
                WHERE ra.id = ?`,
                [registroId]
            );

            res.status(201).json({
                success: true,
                message: 'Registro de asistencia creado exitosamente.',
                registro: newRegistro[0]
            });
        }
    } catch (error) {
        console.error('Error al crear/actualizar registro de asistencia:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * [GET] Obtener resumen de asistencia por fecha
 */
export const getResumenAsistencia = async (req, res) => {
    try {
        const { id } = req.user;
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({
                success: false,
                message: 'La fecha es obligatoria.'
            });
        }

        const [resumen] = await pool.query(
            `SELECT 
                t.id as trabajador_id,
                t.nombre_completo,
                t.dni,
                t.cargo,
                ra.hora_entrada,
                ra.hora_refrigerio_salida,
                ra.hora_refrigerio_llegada,
                ra.hora_salida,
                ra.horas_trabajadas,
                CASE 
                    WHEN ra.hora_entrada IS NOT NULL THEN 'Presente'
                    ELSE 'Ausente'
                END as estado
            FROM trabajadores t
            LEFT JOIN registros_asistencia ra ON t.id = ra.trabajador_id AND ra.fecha = ?
            WHERE t.usuario_id = ? AND t.is_activo = TRUE
            ORDER BY t.nombre_completo`,
            [fecha, id]
        );

        res.status(200).json({
            success: true,
            fecha: fecha,
            resumen: resumen
        });
    } catch (error) {
        console.error('Error al obtener resumen de asistencia:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};


// src/controllers/logsController.js
import { pool } from "../config/db.js";

/**
 * ✅ Obtener todos los logs con filtros opcionales
 * Query params soportados:
 *  - nivel=ERROR|WARNING|INFO|DEBUG
 *  - fuente=auth|database|api|frontend|system|security
 *  - fecha_inicio=YYYY-MM-DD
 *  - fecha_fin=YYYY-MM-DD
 * Ejemplo: /api/logs?nivel=ERROR&fuente=security
 */
export const getLogs = async (req, res) => {
    try {
        const { nivel, fuente, fecha_inicio, fecha_fin } = req.query;
        const conditions = [];
        const values = [];

        if (nivel) {
            conditions.push("nivel = ?");
            values.push(nivel);
        }

        if (fuente) {
            conditions.push("fuente = ?");
            values.push(fuente);
        }

        if (fecha_inicio && fecha_fin) {
            conditions.push("timestamp BETWEEN ? AND ?");
            values.push(fecha_inicio, fecha_fin);
        } else if (fecha_inicio) {
            conditions.push("timestamp >= ?");
            values.push(fecha_inicio);
        } else if (fecha_fin) {
            conditions.push("timestamp <= ?");
            values.push(fecha_fin);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `
      SELECT 
        id,
        DATE_FORMAT(timestamp, '%d/%m/%Y, %H:%i:%s') AS timestamp,
        nivel,
        fuente,
        mensaje,
        stack_trace,
        usuario_id,
        ip
      FROM logs
      ${where}
      ORDER BY timestamp DESC
      LIMIT 500;
    `;

        const [rows] = await pool.query(sql, values);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener logs:", error);
        res.status(500).json({ message: "Error al obtener logs" });
    }
};

/**
 * ✅ Insertar un nuevo log
 * Body esperado:
 * {
 *   "nivel": "ERROR",
 *   "fuente": "security",
 *   "mensaje": "Error de permisos insuficientes",
 *   "stack_trace": "Error en línea 45 del archivo auth.js",
 *   "usuario_id": "user-3",
 *   "ip": "192.168.1.250"
 * }
 */
export const createLog = async (req, res) => {
    try {
        const { nivel, fuente, mensaje, stack_trace, usuario_id, ip } = req.body;

        if (!nivel || !fuente || !mensaje) {
            return res.status(400).json({ message: "nivel, fuente y mensaje son obligatorios" });
        }

        const sql = `
      INSERT INTO logs (nivel, fuente, mensaje, stack_trace, usuario_id, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        await pool.query(sql, [nivel, fuente, mensaje, stack_trace, usuario_id, ip]);
        res.status(201).json({ message: "Log registrado correctamente" });
    } catch (error) {
        console.error("❌ Error al crear log:", error);
        res.status(500).json({ message: "Error al crear log" });
    }
};

/**
 * ✅ Obtener resumen de logs para dashboard
 * Devuelve totales por nivel y total general.
 */
export const getResumenLogs = async (req, res) => {
    try {
        const sql = `
      SELECT
        COUNT(*) AS total,
        SUM(nivel = 'ERROR') AS errores,
        SUM(nivel = 'WARNING') AS advertencias,
        SUM(nivel = 'INFO') AS informacion,
        SUM(nivel = 'DEBUG') AS debug
      FROM logs;
    `;
        const [rows] = await pool.query(sql);
        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener resumen de logs:", error);
        res.status(500).json({ message: "Error al obtener resumen de logs" });
    }
};

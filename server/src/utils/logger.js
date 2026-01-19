// src/utils/logger.js
import { pool } from "../config/db.js";

export async function logEvent(nivel, fuente, mensaje, stack_trace = null, usuario_id = null, ip = null) {
    try {
        await pool.query(
            "INSERT INTO logs (nivel, fuente, mensaje, stack_trace, usuario_id, ip) VALUES (?, ?, ?, ?, ?, ?)",
            [nivel, fuente, mensaje, stack_trace, usuario_id, ip]
        );
    } catch (error) {
        console.error("❌ Error al registrar log:", error);
    }
}

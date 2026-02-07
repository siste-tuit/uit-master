import { pool } from "../config/db.js";

export const getConfiguracionFacturas = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM configuracion_facturas LIMIT 1`);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Configuración de facturas no encontrada." });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener configuración de facturas:", error);
        res.status(500).json({ message: "Error al obtener configuración de facturas." });
    }
};

export const updateConfiguracionFacturas = async (req, res) => {
    try {
        const {
            nombre_empresa,
            direccion_empresa,
            ruc_empresa,
            logo_url,
            info_pago,
            notas_pie,
            igv_porcentaje
        } = req.body;

        // Validaciones básicas
        if (!nombre_empresa || !igv_porcentaje) {
            return res.status(400).json({ message: "Nombre de empresa y porcentaje de IGV son obligatorios." });
        }

        const parsedIgvPorcentaje = parseFloat(igv_porcentaje);
        if (isNaN(parsedIgvPorcentaje) || parsedIgvPorcentaje < 0 || parsedIgvPorcentaje > 1) { // IGV as a percentage (e.g., 0.18)
            return res.status(400).json({ message: "Porcentaje de IGV inválido. Debe ser un valor entre 0 y 1." });
        }

        // Intentar actualizar si existe (id 1, asumiendo una única fila de configuración)
        const [result] = await pool.query(
            `UPDATE configuracion_facturas SET
             nombre_empresa = ?,
             direccion_empresa = ?,
             ruc_empresa = ?,
             logo_url = ?,
             info_pago = ?,
             notas_pie = ?,
             igv_porcentaje = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = 1`, // Asumimos que siempre es el ID 1 para la única fila de configuración
            [
                nombre_empresa,
                direccion_empresa || null,
                ruc_empresa || null,
                logo_url || null,
                info_pago || null,
                notas_pie || null,
                parsedIgvPorcentaje
            ]
        );

        if (result.affectedRows === 0) {
            // Si no se actualizó (no existía la fila con ID 1), la insertamos
            await pool.query(
                `INSERT INTO configuracion_facturas
                 (id, nombre_empresa, direccion_empresa, ruc_empresa, logo_url, info_pago, notas_pie, igv_porcentaje)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?)`, 
                [
                    nombre_empresa,
                    direccion_empresa || null,
                    ruc_empresa || null,
                    logo_url || null,
                    info_pago || null,
                    notas_pie || null,
                    parsedIgvPorcentaje
                ]
            );
        }

        res.status(200).json({ message: "Configuración de facturas actualizada exitosamente." });
    } catch (error) {
        console.error("❌ Error al actualizar configuración de facturas:", error);
        res.status(500).json({ message: "Error al actualizar configuración de facturas." });
    }
};

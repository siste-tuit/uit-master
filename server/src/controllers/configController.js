import { pool } from "../config/db.js";

// ✅ Obtener la configuración (solo 1 registro)
export const getConfiguracion = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM configuracion_empresa LIMIT 1");
        if (rows.length === 0) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener configuración:", error);
        res.status(500).json({ message: "Error al obtener configuración" });
    }
};

// ✅ Actualizar la configuración
export const updateConfiguracion = async (req, res) => {
    try {
        const {
            nombre,
            ruc,
            direccion,
            telefono,
            email,
            moneda,
            logo_url,
            zona_horaria,
            politica_contrasena,
            forzar_2fa,
            bloqueo_ips,
        } = req.body;

        const query = `
      UPDATE configuracion_empresa
      SET 
        nombre = ?, 
        ruc = ?, 
        direccion = ?, 
        telefono = ?, 
        email = ?, 
        moneda = ?, 
        logo_url = ?, 
        zona_horaria = ?, 
        politica_contrasena = ?, 
        forzar_2fa = ?, 
        bloqueo_ips = ?, 
        updatedAt = NOW()
      WHERE id = 1
    `;

        const [result] = await pool.query(query, [
            nombre,
            ruc,
            direccion,
            telefono,
            email,
            moneda,
            logo_url,
            zona_horaria,
            politica_contrasena,
            forzar_2fa ? 1 : 0,
            bloqueo_ips ? 1 : 0,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Configuración no encontrada" });
        }

        res.json({ message: "✅ Configuración actualizada correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar configuración:", error);
        res.status(500).json({ message: "Error al actualizar configuración" });
    }
};

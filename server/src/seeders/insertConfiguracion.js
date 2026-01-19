// src/migraciones/insertConfiguracionEmpresa.js
import { pool } from "../config/db.js";

async function insertConfiguracionEmpresa() {
    console.log("🚀 Iniciando inserción de configuración de la empresa...");

    const data = {
        id: 1, // siempre será 1 para evitar múltiples registros
        nombre: "Unión Innova Textil",
        ruc: "206141194619",
        direccion: "Av. Pedro Moreno Lote 2 OTR . Barrio cercado ( Grifo Green), Chincha Alta, Peru",
        telefono: "+51 987 654 321",
        email: "unioninnovatextil@gmail.com",
        moneda: "PEN",
        logo_url: "/assets/logo.png",
        zona_horaria: "America/Lima",
        politica_contrasena: "mínimo 8 caracteres, una mayúscula, un número y un símbolo",
        forzar_2fa: 0,
        bloqueo_ips: 0,
    };

    try {
        const query = `
      INSERT INTO configuracion_empresa 
      (id, nombre, ruc, direccion, telefono, email, moneda, logo_url, zona_horaria, politica_contrasena, forzar_2fa, bloqueo_ips, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        ruc = VALUES(ruc),
        direccion = VALUES(direccion),
        telefono = VALUES(telefono),
        email = VALUES(email),
        moneda = VALUES(moneda),
        logo_url = VALUES(logo_url),
        zona_horaria = VALUES(zona_horaria),
        politica_contrasena = VALUES(politica_contrasena),
        forzar_2fa = VALUES(forzar_2fa),
        bloqueo_ips = VALUES(bloqueo_ips),
        updatedAt = NOW();
    `;

        const [result] = await pool.query(query, [
            data.id,
            data.nombre,
            data.ruc,
            data.direccion,
            data.telefono,
            data.email,
            data.moneda,
            data.logo_url,
            data.zona_horaria,
            data.politica_contrasena,
            data.forzar_2fa,
            data.bloqueo_ips,
        ]);

        console.log(`✅ Configuración de empresa insertada/actualizada (filas afectadas: ${result.affectedRows})`);
    } catch (error) {
        console.error("❌ Error al insertar configuración de empresa:", error);
    } finally {
        process.exit(0);
    }
}

insertConfiguracionEmpresa();

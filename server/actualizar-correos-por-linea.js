// Script para actualizar los correos de usuarios según sus líneas de producción
import { pool } from "./src/config/db.js";

async function actualizarCorreosPorLinea() {
    try {
        console.log('🔄 Actualizando correos de usuarios según sus líneas de producción...\n');

        // Mapeo de líneas a correos
        const mapeoLineasCorreos = {
            'A&C - CHINCHA GREEN': 'AyC@textil.com',
            'A&C 2 - CHINCHA GREEN': 'AyC2@textil.com',
            'A&C 3 - CHINCHA GREEN': 'AyC3@textil.com',
            'A&C 4 - CHINCHA GREEN': 'AyC4@textil.com',
            'D&M - CHINCHA GREEN': 'DyM@textil.com',
            'ELENA TEX - CHINCHA GREEN': 'Elenatex@textil.com',
            'EMANUEL - CHINCHA GREEN': 'Emanuel@textil.com',
            'EMANUEL 2 - CHINCHA GREEN': 'Emanuel2@textil.com',
            'JFL STYLE - CHINCHA GREEN': 'JflStyle@textil.com',
            'JUANA ZEA - CHINCHA GREEN': 'Juanazea@textil.com',
            'M&L - CHINCHA GREEN': 'Myl@textil.com',
            'M&L 2 - CHINCHA GREEN': 'Myl2@textil.com',
            'VELASQUEZ - CHINCHA GREEN': 'Velasquez@textil.com'
        };

        // Obtener usuarios con sus líneas asignadas
        const [asignaciones] = await pool.query(
            `SELECT 
                u.id,
                u.nombre_completo,
                u.email as email_actual,
                lp.nombre as linea_nombre
             FROM usuarios u
             INNER JOIN linea_usuario lu ON u.id = lu.usuario_id AND lu.is_activo = TRUE
             INNER JOIN lineas_produccion lp ON lu.linea_id = lp.id
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE r.nombre = 'usuarios'
             ORDER BY lp.nombre`
        );

        console.log(`📊 Encontradas ${asignaciones.length} asignaciones\n`);

        // Actualizar cada usuario con su nuevo correo basado en su línea
        for (const asignacion of asignaciones) {
            const nuevoEmail = mapeoLineasCorreos[asignacion.linea_nombre];
            
            if (!nuevoEmail) {
                console.log(`⚠️  No se encontró correo para línea: ${asignacion.linea_nombre}`);
                continue;
            }

            await pool.query(
                "UPDATE usuarios SET email = ?, updated_at = NOW() WHERE id = ?",
                [nuevoEmail, asignacion.id]
            );
            
            console.log(`✅ ${asignacion.nombre_completo}`);
            console.log(`   Línea: ${asignacion.linea_nombre}`);
            console.log(`   Correo anterior: ${asignacion.email_actual}`);
            console.log(`   Correo nuevo: ${nuevoEmail}\n`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ ${asignaciones.length} usuarios actualizados exitosamente`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

actualizarCorreosPorLinea();


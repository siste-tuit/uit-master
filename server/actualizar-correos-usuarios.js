// Script para actualizar los correos de los usuarios de producción
import { pool } from "./src/config/db.js";

async function actualizarCorreos() {
    try {
        console.log('🔄 Actualizando correos de usuarios de producción...\n');

        // Obtener todos los usuarios de producción ordenados por nombre
        const [usuarios] = await pool.query(
            `SELECT u.id, u.nombre_completo, u.email, r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE r.nombre = 'usuarios'
             ORDER BY u.nombre_completo`
        );

        console.log(`📊 Encontrados ${usuarios.length} usuarios de producción\n`);

        // Actualizar cada usuario con su nuevo correo
        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            const nuevoEmail = `usuariolinea${i + 1}@textil.com`;
            
            await pool.query(
                "UPDATE usuarios SET email = ?, updated_at = NOW() WHERE id = ?",
                [nuevoEmail, usuario.id]
            );
            
            console.log(`✅ ${usuario.nombre_completo}`);
            console.log(`   Correo anterior: ${usuario.email}`);
            console.log(`   Correo nuevo: ${nuevoEmail}\n`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ ${usuarios.length} usuarios actualizados exitosamente`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

actualizarCorreos();


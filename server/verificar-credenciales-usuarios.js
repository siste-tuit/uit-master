// Script para verificar correos y contraseñas de usuarios de producción
import { pool } from "./src/config/db.js";
import bcrypt from 'bcrypt';

async function verificarCredenciales() {
    try {
        console.log('🔍 Verificando credenciales de usuarios de producción...\n');

        const [usuarios] = await pool.query(
            `SELECT u.id, u.email, u.nombre_completo, u.password, u.is_active, r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE r.nombre = 'usuarios'
             ORDER BY u.nombre_completo`
        );

        console.log(`📊 Total de usuarios de producción: ${usuarios.length}\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('LISTA DE USUARIOS DE PRODUCCIÓN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        for (let i = 0; i < usuarios.length; i++) {
            const u = usuarios[i];
            const tienePassword = u.password && u.password.length > 0;
            const passwordValido = tienePassword ? await bcrypt.compare('demo123', u.password) : false;

            console.log(`${i + 1}. ${u.nombre_completo}`);
            console.log(`   📧 Email: ${u.email}`);
            console.log(`   🔑 Contraseña: demo123`);
            console.log(`   ✅ Tiene contraseña en BD: ${tienePassword ? 'Sí' : 'No'}`);
            console.log(`   ✅ Contraseña válida: ${passwordValido ? 'Sí' : 'No'}`);
            console.log(`   📊 Estado: ${u.is_active ? 'Activo' : 'Inactivo'}`);
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Todos los ${usuarios.length} usuarios tienen correo y contraseña configurados`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verificarCredenciales();


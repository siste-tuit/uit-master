// Script para resetear TODAS las contraseñas a 'demo123'
import bcrypt from 'bcrypt';
import { pool } from './src/config/db.js';

const SALT_ROUNDS = 10;
const PASSWORD_PLAINTEXT = 'demo123';

async function resetearPasswordDemo123() {
    try {
        console.log('🔐 Reseteando TODAS las contraseñas a "demo123"...\n');
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(PASSWORD_PLAINTEXT, SALT_ROUNDS);
        console.log(`Hash generado para "${PASSWORD_PLAINTEXT}"\n`);

        // Actualizar TODOS los usuarios
        const [result] = await pool.query(
            `UPDATE usuarios 
             SET password = ?, updated_at = NOW()
             WHERE is_active = TRUE`
        , [hashedPassword]);

        console.log(`✅ Se actualizaron las contraseñas de ${result.affectedRows} usuarios exitosamente.\n`);
        console.log('📋 Todos los usuarios activos ahora tienen la contraseña: demo123\n');

        // Mostrar lista de usuarios actualizados
        const [usuarios] = await pool.query(
            `SELECT u.email, u.nombre_completo, r.nombre as rol 
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.is_active = TRUE
             ORDER BY u.email`
        );

        console.log('Usuarios actualizados:');
        console.log('━'.repeat(60));
        usuarios.forEach(u => {
            console.log(`  ${u.email} - ${u.nombre_completo} (${u.rol || 'sin rol'})`);
        });
        console.log('━'.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetearPasswordDemo123();

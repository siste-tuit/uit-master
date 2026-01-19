// Script para verificar el rol de un usuario específico
import { pool } from "./src/config/db.js";

const emailUsuario = process.argv[2] || 'Elenatex@textil.com'; // Por defecto verifica Elenatex

async function verificarRolUsuario() {
    try {
        console.log(`🔍 Verificando rol del usuario: ${emailUsuario}\n`);

        const [usuarios] = await pool.query(
            `SELECT 
                u.id,
                u.email,
                u.nombre_completo,
                u.is_active,
                u.rol_id,
                r.id as role_table_id,
                r.nombre as role_nombre,
                r.descripcion as role_descripcion
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.email = ?`,
            [emailUsuario]
        );

        if (usuarios.length === 0) {
            console.log(`❌ No se encontró el usuario con email: ${emailUsuario}`);
            return;
        }

        const usuario = usuarios[0];

        console.log(`✅ Usuario encontrado:`);
        console.log(`   ID: ${usuario.id}`);
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Nombre: ${usuario.nombre_completo}`);
        console.log(`   Activo: ${usuario.is_active ? 'Sí' : 'No'}`);
        console.log(`   Rol ID: ${usuario.rol_id || 'NULL'}`);
        
        if (usuario.role_nombre) {
            console.log(`   ✅ Rol asignado: "${usuario.role_nombre}"`);
            console.log(`   Descripción: ${usuario.role_descripcion}`);
        } else {
            console.log(`   ❌ PROBLEMA: El usuario NO tiene un rol asignado (rol_id es NULL o el rol no existe)`);
        }

        // Verificar si el rol coincide con "usuarios"
        if (usuario.role_nombre === 'usuarios') {
            console.log(`\n✅ El usuario tiene el rol correcto "usuarios" para acceder a los recursos de producción.`);
        } else {
            console.log(`\n⚠️  El usuario tiene el rol "${usuario.role_nombre}" pero se espera "usuarios" para acceder a los recursos de producción.`);
        }

    } catch (error) {
        console.error('❌ Error al verificar rol:', error);
    } finally {
        process.exit(0);
    }
}

verificarRolUsuario();


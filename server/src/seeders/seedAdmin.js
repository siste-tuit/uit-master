// migraciones/insertAdminUser.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; // Asegúrate de que esta ruta a tu pool de MySQL sea correcta
import { v4 as uuidv4 } from 'uuid'; // Necesitas instalar 'uuid' si aún no lo tienes: npm install uuid

// ⚠️ IMPORTANTE: Asegúrate de tener bcrypt y uuid instalados:
// npm install bcrypt uuid

const SALT_ROUNDS = 10;
const ADMIN_PASSWORD_PLAINTEXT = 'demo123'; // ⬅️ La contraseña que usarás para loguearte
const ADMIN_EMAIL = 'admin@textil.com';

async function insertAdminUser() {
    console.log('--- Iniciando inserción de usuario administrador ---');
    let connection;

    try {
        // 1. Generar el Hash de la Contraseña
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD_PLAINTEXT, SALT_ROUNDS);
        console.log(`Hash generado para "${ADMIN_PASSWORD_PLAINTEXT}": ${hashedPassword.substring(0, 30)}...`);

        // 2. Obtener la ID del Rol 'administrador'
        // Esto asume que ya ejecutaste la migración de la tabla 'roles'
        const [roles] = await pool.query(
            "SELECT id FROM roles WHERE nombre = 'administrador'"
        );

        if (roles.length === 0) {
            console.error("Error: No se encontró el rol 'administrador' en la base de datos.");
            return;
        }

        const adminRoleId = roles[0].id;
        const userId = uuidv4(); // Generamos un UUID para el campo ID

        // 3. Ejecutar la sentencia de inserción
        const query = `
            INSERT INTO usuarios 
            (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                nombre_completo = VALUES(nombre_completo), 
                password = VALUES(password),
                updated_at = NOW();
        `; // Usamos ON DUPLICATE KEY UPDATE para que el script sea re-ejecutable

        const [result] = await pool.query(query, [
            userId,
            ADMIN_EMAIL,
            hashedPassword,
            'Carlos Mendoza',
            adminRoleId,
            'Administración',
            '👔',
            true
        ]);
        console.log(`✅ Usuario administrador (${ADMIN_EMAIL}) insertado/actualizado exitosamente.`);
        console.log(`   Filas afectadas: ${result.affectedRows}`);

    } catch (error) {
        console.error('❌ Error fatal durante la migración del usuario admin:', error);
    } finally {
        if (connection) connection.release();
        // Si quieres que el script termine completamente, asegúrate de cerrar el pool 
        // o ejecutar esto como un script independiente.
    }
}

// Ejecutar la función de migración
insertAdminUser();
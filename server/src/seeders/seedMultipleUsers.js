// src/seeders/seedMultipleUsers.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;
const PASSWORD_PLAINTEXT = 'demo123'; // Contraseña para todos los usuarios de ejemplo

// Definir usuarios a crear
const USUARIOS_EJEMPLO = [
    {
        nombre_completo: 'Carlos Mendoza',
        email: 'admin@textil.com',
        rol: 'administrador',
        departamento: 'Administración',
        avatar: '👔'
    },
    {
        nombre_completo: 'María López',
        email: 'contabilidad@textil.com',
        rol: 'contabilidad',
        departamento: 'Contabilidad',
        avatar: '💼'
    },
    {
        nombre_completo: 'Juan Pérez',
        email: 'gerencia@textil.com',
        rol: 'gerencia',
        departamento: 'Gerencia',
        avatar: '📊'
    },
    {
        nombre_completo: 'Ana García',
        email: 'sistemas@textil.com',
        rol: 'sistemas',
        departamento: 'Sistemas',
        avatar: '💻'
    },
    {
        nombre_completo: 'Daniel . P',
        email: 'ingenieria@textil.com',
        rol: 'ingenieria',
        departamento: 'Ingeniería',
        avatar: '⚙️'
    },
    {
        nombre_completo: 'Pedro Martínez',
        email: 'mantenimiento@textil.com',
        rol: 'mantenimiento',
        departamento: 'Mantenimiento',
        avatar: '🔧'
    },
    {
        nombre_completo: 'Carmen Torres',
        email: 'usuario@textil.com',
        rol: 'usuarios',
        departamento: 'Producción',
        avatar: '👷'
    }
];

async function insertMultipleUsers() {
    console.log('--- Iniciando inserción de múltiples usuarios de ejemplo ---');
    
    try {
        // Hashear la contraseña una sola vez
        const hashedPassword = await bcrypt.hash(PASSWORD_PLAINTEXT, SALT_ROUNDS);
        console.log(`Hash generado para "${PASSWORD_PLAINTEXT}": ${hashedPassword.substring(0, 30)}...`);

        let inserted = 0;

        for (const usuario of USUARIOS_EJEMPLO) {
            // 1. Obtener el ID del rol
            const [roles] = await pool.query(
                "SELECT id FROM roles WHERE nombre = ?",
                [usuario.rol]
            );

            if (roles.length === 0) {
                console.error(`❌ Error: No se encontró el rol '${usuario.rol}' en la base de datos.`);
                continue;
            }

            const roleId = roles[0].id;
            const userId = uuidv4();

            // 2. Insertar el usuario
            const query = `
                INSERT INTO usuarios 
                (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    nombre_completo = VALUES(nombre_completo), 
                    password = VALUES(password),
                    rol_id = VALUES(rol_id),
                    departamento = VALUES(departamento),
                    avatar = VALUES(avatar),
                    updated_at = NOW();
            `;

            await pool.query(query, [
                userId,
                usuario.email,
                hashedPassword,
                usuario.nombre_completo,
                roleId,
                usuario.departamento,
                usuario.avatar,
                true
            ]);

            console.log(`✅ Usuario '${usuario.nombre_completo}' (${usuario.email}) - ${usuario.rol} insertado/actualizado.`);
            inserted++;
        }

        console.log(`\n🎉 Se insertaron/actualizaron ${inserted} usuarios exitosamente.`);
        console.log('\n📋 Resumen de credenciales:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        USUARIOS_EJEMPLO.forEach(u => {
            console.log(`   ${u.avatar} ${u.nombre_completo}`);
            console.log(`      Email: ${u.email}`);
            console.log(`      Contraseña: ${PASSWORD_PLAINTEXT}`);
            console.log(`      Rol: ${u.rol}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error fatal durante la inserción de usuarios:', error);
    } finally {
        process.exit(0);
    }
}

insertMultipleUsers();


// Script para crear 13 usuarios de producción
import bcrypt from 'bcrypt';
import { pool } from "./src/config/db.js";
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 10;
const PASSWORD_PLAINTEXT = 'demo123';

// Lista de 13 usuarios de producción (correos corresponden a sus líneas de producción)
const usuariosProduccion = [
    { nombre: 'Ana García', email: 'AyC@textil.com' }, // A&C - CHINCHA GREEN
    { nombre: 'Carlos Mendoza', email: 'AyC2@textil.com' }, // A&C 2 - CHINCHA GREEN
    { nombre: 'Carmen Torres', email: 'AyC3@textil.com' }, // A&C 3 - CHINCHA GREEN
    { nombre: 'Carmen Vega', email: 'AyC4@textil.com' }, // A&C 4 - CHINCHA GREEN
    { nombre: 'Fernando Díaz', email: 'DyM@textil.com' }, // D&M - CHINCHA GREEN
    { nombre: 'Juan Pérez', email: 'Elenatex@textil.com' }, // ELENA TEX - CHINCHA GREEN
    { nombre: 'Luis Sánchez', email: 'Emanuel@textil.com' }, // EMANUEL - CHINCHA GREEN
    { nombre: 'María López', email: 'Emanuel2@textil.com' }, // EMANUEL 2 - CHINCHA GREEN
    { nombre: 'Miguel Herrera', email: 'JflStyle@textil.com' }, // JFL STYLE - CHINCHA GREEN
    { nombre: 'Patricia López', email: 'Juanazea@textil.com' }, // JUANA ZEA - CHINCHA GREEN
    { nombre: 'Pedro Martínez', email: 'Myl@textil.com' }, // M&L - CHINCHA GREEN
    { nombre: 'Roberto Torres', email: 'Myl2@textil.com' }, // M&L 2 - CHINCHA GREEN
    { nombre: 'Sandra Morales', email: 'Velasquez@textil.com' } // VELASQUEZ - CHINCHA GREEN
];

async function crearUsuariosProduccion() {
    try {
        console.log('🌱 Creando usuarios de producción...\n');

        // Obtener el ID del rol 'usuarios'
        const [roles] = await pool.query(
            "SELECT id FROM roles WHERE nombre = 'usuarios'"
        );

        if (roles.length === 0) {
            console.error('❌ Error: No se encontró el rol "usuarios"');
            process.exit(1);
        }

        const rolUsuariosId = roles[0].id;
        const hashedPassword = await bcrypt.hash(PASSWORD_PLAINTEXT, SALT_ROUNDS);

        let creados = 0;
        let actualizados = 0;

        for (const usuario of usuariosProduccion) {
            // Verificar si el usuario ya existe
            const [existentes] = await pool.query(
                "SELECT id, nombre_completo FROM usuarios WHERE email = ?",
                [usuario.email]
            );

            if (existentes.length > 0) {
                // Actualizar usuario existente
                await pool.query(
                    `UPDATE usuarios 
                     SET nombre_completo = ?, 
                         rol_id = ?, 
                         departamento = 'Producción',
                         is_active = TRUE,
                         updated_at = NOW()
                     WHERE email = ?`,
                    [usuario.nombre, rolUsuariosId, usuario.email]
                );
                console.log(`✅ Actualizado: ${usuario.nombre} (${usuario.email})`);
                actualizados++;
            } else {
                // Crear nuevo usuario
                const userId = randomUUID();
                await pool.query(
                    `INSERT INTO usuarios 
                     (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active) 
                     VALUES (?, ?, ?, ?, ?, 'Producción', '👷', TRUE)`,
                    [userId, usuario.email, hashedPassword, usuario.nombre, rolUsuariosId]
                );
                console.log(`✅ Creado: ${usuario.nombre} (${usuario.email})`);
                creados++;
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`  Usuarios creados: ${creados}`);
        console.log(`  Usuarios actualizados: ${actualizados}`);
        console.log(`  Total procesados: ${usuariosProduccion.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

crearUsuariosProduccion();


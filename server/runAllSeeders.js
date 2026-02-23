// Script unificado para ejecutar TODOS los seeders del sistema
// Uso: node runAllSeeders.js

import { pool } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function runAllSeeders() {
    let connection;
    try {
        console.log('🌱 Iniciando ejecución de TODOS los seeders...\n');

        // Usar una conexión única para todos los seeders
        connection = await pool.getConnection();

        // 1. Insertar Roles (debe ser primero)
        console.log('📋 Ejecutando seeders de ROLES...');
        await runRolesSeeder(connection);
        console.log('✅ Seeders ROLES completados\n');

        // 2. Insertar Departamentos
        console.log('🏢 Ejecutando seeders de DEPARTAMENTOS...');
        await runDepartamentosSeeder(connection);
        console.log('✅ Seeders DEPARTAMENTOS completados\n');

        // 3. Insertar Configuración de Empresa
        console.log('⚙️ Ejecutando seeders de CONFIGURACIÓN...');
        await runConfiguracionSeeder(connection);
        console.log('✅ Seeders CONFIGURACIÓN completados\n');

        // 4. Insertar Usuarios (depende de roles)
        console.log('👥 Ejecutando seeders de USUARIOS...');
        await runUsersSeeder(connection);
        console.log('✅ Seeders USUARIOS completados\n');

        // 5. Insertar Líneas de Producción (depende de usuarios)
        console.log('🏭 Ejecutando seeders de PRODUCCIÓN...');
        await runProduccionSeeder(connection);
        console.log('✅ Seeders PRODUCCIÓN completados\n');

        // 6. Insertar Inventario (depende de productos)
        console.log('📦 Ejecutando seeders de INVENTARIO...');
        await runInventarioSeeder(connection);
        console.log('✅ Seeders INVENTARIO completados\n');

        console.log('\n🎉 ¡TODOS los seeders ejecutados exitosamente!');
        console.log('✅ El sistema está listo con datos iniciales.\n');

    } catch (error) {
        console.error('❌ Error ejecutando seeders:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
    }
}

// Funciones de seeders individuales
async function runRolesSeeder(connection) {
    const ROLES = [
        { nombre: 'administrador', descripcion: 'Acceso completo a todos los módulos del sistema', dashboard_path: '/administracion/dashboard' },
        { nombre: 'contabilidad', descripcion: 'Gestión financiera y facturación', dashboard_path: '/contabilidad/dashboard' },
        { nombre: 'gerencia', descripcion: 'Dashboards y métricas estratégicas', dashboard_path: '/gerencia/production' },
        { nombre: 'usuarios', descripcion: 'Registro de producción y consulta de stock', dashboard_path: '/produccion/dashboard' },
        { nombre: 'sistemas', descripcion: 'Gestión de incidencias y configuración del sistema', dashboard_path: '/sistemas/dashboard' },
        { nombre: 'ingenieria', descripcion: 'Gestión de ingeniería y proyectos', dashboard_path: '/ingenieria/dashboard' },
        { nombre: 'mantenimiento', descripcion: 'Gestión de equipos y mantenimiento', dashboard_path: '/mantenimiento/dashboard' },
        { nombre: 'produccion', descripcion: 'Control de producción y órdenes', dashboard_path: '/produccion/dashboard' }
    ];

    for (const rol of ROLES) {
        await connection.query(
            `INSERT INTO roles (nombre, descripcion, dashboard_path)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                 descripcion = VALUES(descripcion), 
                 dashboard_path = VALUES(dashboard_path)`,
            [rol.nombre, rol.descripcion, rol.dashboard_path]
        );
    }
}

async function runDepartamentosSeeder(connection) {
    const DEPARTAMENTOS = [
        { nombre: 'Administración', descripcion: 'Departamento de administración general' },
        { nombre: 'Contabilidad', descripcion: 'Departamento de contabilidad y finanzas' },
        { nombre: 'Gerencia', descripcion: 'Gerencia general' },
        { nombre: 'Producción', descripcion: 'Departamento de producción' },
        { nombre: 'Sistemas', descripcion: 'Departamento de sistemas e IT' },
        { nombre: 'Ingeniería', descripcion: 'Departamento de ingeniería' },
        { nombre: 'Mantenimiento', descripcion: 'Departamento de mantenimiento' }
    ];

    for (const dept of DEPARTAMENTOS) {
        await connection.query(
            `INSERT INTO departamentos (nombre, descripcion)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)`,
            [dept.nombre, dept.descripcion]
        );
    }
}

async function runConfiguracionSeeder(connection) {
    await connection.query(
        `INSERT INTO configuracion_empresa 
         (nombre, ruc, direccion, telefono, email, moneda, zona_horaria)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
             nombre = VALUES(nombre),
             ruc = VALUES(ruc),
             direccion = VALUES(direccion),
             telefono = VALUES(telefono),
             email = VALUES(email)`,
        ['UIT Textil', '20123456789', 'Lima, Perú', '+51 999 999 999', 'info@uit.com', 'PEN', 'America/Lima']
    );
}

async function runUsersSeeder(connection) {
    const bcrypt = await import('bcrypt');
    const { v4: uuidv4 } = await import('uuid');
    
    const SALT_ROUNDS = 10;
    const PASSWORD_PLAINTEXT_DEFAULT = 'demo123';
    const PASSWORDS = {
        'admin@textil.com': 'Adm226....',
        'contabilidad@textil.com': 'Ctd620...',
        'sistemas@textil.com': 'siS2026...',
        'gerencia@textil.com': 'geR202...',
        'ingenieria@textil.com': 'inG226...',
        'mantenimiento@textil.com': 'MAT266...',
        'usuario@textil.com': 'demo123',
        'hover.rojas@textil.com': 'Hov226...',
        'maycol@textil.com': 'Myc226...',
        'alicia@textil.com': 'Alc226...',
        'elena@textil.com': 'Ele226...',
        'rosa@textil.com': 'Ros226...',
        'alfredo@textil.com': 'Alf226...',
        'eduardo@textil.com': 'Edu226...',
        'juana@textil.com': 'Jun226...',
        'alisson@textil.com': 'Als226...'
    };

    const USUARIOS = [
        { nombre_completo: 'Carlos Mendoza', email: 'admin@textil.com', rol: 'administrador', departamento: 'Administración', avatar: '👔' },
        { nombre_completo: 'María López', email: 'contabilidad@textil.com', rol: 'contabilidad', departamento: 'Contabilidad', avatar: '💼' },
        { nombre_completo: 'Juan Pérez', email: 'gerencia@textil.com', rol: 'gerencia', departamento: 'Gerencia', avatar: '📊' },
        { nombre_completo: 'Ana García', email: 'sistemas@textil.com', rol: 'sistemas', departamento: 'Sistemas', avatar: '💻' },
        { nombre_completo: 'Daniel P.', email: 'ingenieria@textil.com', rol: 'ingenieria', departamento: 'Ingeniería', avatar: '⚙️' },
        { nombre_completo: 'Pedro Martínez', email: 'mantenimiento@textil.com', rol: 'mantenimiento', departamento: 'Mantenimiento', avatar: '🔧' },
        { nombre_completo: 'Carmen Torres', email: 'usuario@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Hover Rojas', email: 'hover.rojas@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Maycol', email: 'maycol@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Alicia', email: 'alicia@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Elena', email: 'elena@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Rosa', email: 'rosa@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Alfredo', email: 'alfredo@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Eduardo', email: 'eduardo@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Juana', email: 'juana@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
        { nombre_completo: 'Alisson', email: 'alisson@textil.com', rol: 'usuarios', departamento: 'Producción', avatar: '👷' }
    ];

    for (const usuario of USUARIOS) {
        const plainPassword = PASSWORDS[usuario.email] || PASSWORD_PLAINTEXT_DEFAULT;
        const hashedPassword = await bcrypt.default.hash(plainPassword, SALT_ROUNDS);

        // Obtener el ID del rol
        const [roles] = await connection.query(
            "SELECT id FROM roles WHERE nombre = ?",
            [usuario.rol]
        );

        if (roles.length === 0) {
            console.error(`❌ Error: No se encontró el rol '${usuario.rol}'`);
            continue;
        }

        const roleId = roles[0].id;
        const userId = uuidv4();

        await connection.query(
            `INSERT INTO usuarios 
             (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
                 nombre_completo = VALUES(nombre_completo), 
                 password = VALUES(password),
                 rol_id = VALUES(rol_id),
                 departamento = VALUES(departamento),
                 avatar = VALUES(avatar),
                 updated_at = NOW()`,
            [userId, usuario.email, hashedPassword, usuario.nombre_completo, roleId, usuario.departamento, usuario.avatar, true]
        );
    }
}

async function runProduccionSeeder(connection) {
    // Obtener usuario de ingeniería
    const [usuarios] = await connection.query(
        "SELECT id FROM usuarios WHERE email = 'ingenieria@textil.com'"
    );

    if (usuarios.length === 0) {
        console.log('⚠️ Usuario de ingeniería no encontrado. Saltando seeders de producción.');
        return;
    }

    const { v4: uuidv4 } = await import('uuid');
    
    const lineas = [
        { nombre: 'A&C - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA WHITE', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA BLACK', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA BLUE', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA RED', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA YELLOW', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA ORANGE', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA PURPLE', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA PINK', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA BROWN', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA GRAY', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA NAVY', objetivo: 2000, status: 'activa' },
        { nombre: 'A&C - CHINCHA BEIGE', objetivo: 2000, status: 'activa' }
    ];

    for (const linea of lineas) {
        const lineaId = uuidv4();
        await connection.query(
            `INSERT INTO lineas_produccion (id, nombre, objetivo_diario, status)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                 nombre = VALUES(nombre),
                 objetivo_diario = VALUES(objetivo_diario),
                 status = VALUES(status)`,
            [lineaId, linea.nombre, linea.objetivo, linea.status]
        );
    }
}

async function runInventarioSeeder(connection) {
    // Este seeder puede requerir productos existentes
    // Por ahora lo dejamos básico
    console.log('📦 Inventario: Seeder básico completado (requiere productos para datos completos)');
}

// Ejecutar todos los seeders
runAllSeeders()
    .then(() => {
        console.log('✅ Proceso completado exitosamente.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

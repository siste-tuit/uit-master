// Script para verificar usuarios específicos y sus roles
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const usuariosAVerificar = [
    'hover.rojas@textil.com',
    'maycol@textil.com',
    'alicia@textil.com',
    'elena@textil.com',
    'rosa@textil.com',
    'alfredo@textil.com',
    'eduardo@textil.com',
    'juana@textil.com',
    'alisson@textil.com'
];

// Roles válidos en el sistema
const rolesValidos = [
    'administrador',
    'sistemas',
    'mantenimiento',
    'contabilidad',
    'gerencia',
    'ingenieria',
    'usuarios',
    'produccion' // Este se mapea a 'usuarios' en el frontend
];

async function verificarUsuarios() {
    let connection;
    
    try {
        // Crear conexión
        const sslOptions = process.env.DB_SSL === 'true'
            ? {
                  ssl: {
                      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
                  }
              }
            : {};

        connection = process.env.DB_URL
            ? await mysql.createConnection({
                  uri: process.env.DB_URL,
                  ...sslOptions
              })
            : await mysql.createConnection({
                  host: process.env.DB_HOST,
                  port: parseInt(process.env.DB_PORT || '3306'),
                  user: process.env.DB_USER,
                  password: process.env.DB_PASS,
                  database: process.env.DB_NAME,
                  ...sslOptions
              });

        console.log('✅ Conectado a la base de datos\n');
        console.log('='.repeat(80));
        console.log('VERIFICACIÓN DE USUARIOS');
        console.log('='.repeat(80));
        console.log();

        // Obtener todos los roles disponibles
        const [roles] = await connection.query('SELECT id, nombre, descripcion FROM roles');
        console.log('📋 Roles disponibles en el sistema:');
        roles.forEach(rol => {
            console.log(`   - ${rol.nombre} (ID: ${rol.id}): ${rol.descripcion}`);
        });
        console.log();

        // Verificar cada usuario
        const resultados = [];
        
        for (const email of usuariosAVerificar) {
            const [rows] = await connection.query(
                `SELECT 
                    u.id,
                    u.email,
                    u.nombre_completo,
                    u.is_active,
                    u.rol_id,
                    r.nombre as rol_nombre,
                    r.dashboard_path,
                    u.departamento,
                    u.created_at,
                    u.last_login
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.email = ?`,
                [email]
            );

            const usuario = rows[0];
            
            if (!usuario) {
                resultados.push({
                    email,
                    existe: false,
                    problema: 'Usuario no existe en la base de datos'
                });
                console.log(`❌ ${email}: NO EXISTE`);
            } else {
                const rolValido = rolesValidos.includes(usuario.rol_nombre?.toLowerCase());
                const activo = usuario.is_active === 1 || usuario.is_active === true;
                
                let problemas = [];
                if (!activo) problemas.push('Usuario INACTIVO');
                if (!usuario.rol_nombre) problemas.push('Sin rol asignado');
                if (!rolValido && usuario.rol_nombre) {
                    problemas.push(`Rol inválido: "${usuario.rol_nombre}" (no está en roleModules)`);
                }
                
                resultados.push({
                    email,
                    existe: true,
                    nombre: usuario.nombre_completo,
                    rol: usuario.rol_nombre,
                    rol_id: usuario.rol_id,
                    activo,
                    rol_valido: rolValido,
                    problemas: problemas.length > 0 ? problemas : null,
                    departamento: usuario.departamento,
                    last_login: usuario.last_login
                });

                if (problemas.length > 0) {
                    console.log(`⚠️  ${email}:`);
                    console.log(`   Nombre: ${usuario.nombre_completo}`);
                    console.log(`   Rol: ${usuario.rol_nombre || 'SIN ROL'} (ID: ${usuario.rol_id || 'N/A'})`);
                    console.log(`   Estado: ${activo ? 'ACTIVO' : 'INACTIVO'}`);
                    problemas.forEach(p => console.log(`   ⚠️  ${p}`));
                } else {
                    console.log(`✅ ${email}: OK`);
                    console.log(`   Nombre: ${usuario.nombre_completo}`);
                    console.log(`   Rol: ${usuario.rol_nombre} (ID: ${usuario.rol_id})`);
                    console.log(`   Estado: ACTIVO`);
                }
            }
            console.log();
        }

        // Resumen
        console.log('='.repeat(80));
        console.log('RESUMEN');
        console.log('='.repeat(80));
        
        const noExisten = resultados.filter(r => !r.existe);
        const conProblemas = resultados.filter(r => r.existe && r.problemas);
        const ok = resultados.filter(r => r.existe && !r.problemas);

        console.log(`Total usuarios verificados: ${resultados.length}`);
        console.log(`✅ Usuarios OK: ${ok.length}`);
        console.log(`⚠️  Usuarios con problemas: ${conProblemas.length}`);
        console.log(`❌ Usuarios que no existen: ${noExisten.length}`);
        console.log();

        if (conProblemas.length > 0) {
            console.log('USUARIOS CON PROBLEMAS:');
            conProblemas.forEach(u => {
                console.log(`\n📧 ${u.email}`);
                console.log(`   Nombre: ${u.nombre}`);
                console.log(`   Rol actual: ${u.rol || 'SIN ROL'}`);
                u.problemas?.forEach(p => console.log(`   ⚠️  ${p}`));
            });
        }

        if (noExisten.length > 0) {
            console.log('\nUSUARIOS QUE NO EXISTEN:');
            noExisten.forEach(u => {
                console.log(`   - ${u.email}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Conexión cerrada');
        }
    }
}

verificarUsuarios();

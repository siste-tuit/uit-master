// Script para verificar que los usuarios de producción estén en la base de datos
import { pool } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const correosEsperados = [
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

async function verificarUsuariosProduccion() {
    try {
        console.log('🔍 Verificando usuarios de producción en la base de datos...\n');

        // Verificar que existe el rol 'usuarios'
        const [roles] = await pool.query(`SELECT id, nombre FROM roles WHERE nombre = 'usuarios'`);
        
        if (roles.length === 0) {
            console.error('❌ ERROR: El rol "usuarios" no existe en la base de datos');
            console.log('💡 Solución: Necesitas crear el rol "usuarios" primero');
            return;
        }

        const rolId = roles[0].id;
        console.log(`✅ Rol "usuarios" encontrado (ID: ${rolId})\n`);

        // Obtener todos los usuarios con rol 'usuarios'
        const [usuarios] = await pool.query(
            `SELECT u.id, u.email, u.nombre_completo, u.is_active, r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE r.nombre = 'usuarios'
             ORDER BY u.email`
        );

        console.log(`📊 Total de usuarios con rol "usuarios": ${usuarios.length}\n`);

        // Verificar usuarios activos
        const usuariosActivos = usuarios.filter(u => u.is_active);
        console.log(`✅ Usuarios activos: ${usuariosActivos.length}`);
        console.log(`❌ Usuarios inactivos: ${usuarios.length - usuariosActivos.length}\n`);

        // Verificar correos esperados
        const correosEncontrados = usuarios.map(u => u.email);
        const faltantes = correosEsperados.filter(c => !correosEncontrados.includes(c));
        const encontrados = correosEsperados.filter(c => correosEncontrados.includes(c));

        console.log('📋 Verificación de correos esperados:');
        console.log(`✅ Encontrados: ${encontrados.length}/${correosEsperados.length}`);
        console.log(`❌ Faltantes: ${faltantes.length}/${correosEsperados.length}\n`);

        if (encontrados.length > 0) {
            console.log('✅ Usuarios encontrados:');
            encontrados.forEach(correo => {
                const usuario = usuarios.find(u => u.email === correo);
                const estado = usuario.is_active ? '✅ ACTIVO' : '❌ INACTIVO';
                console.log(`   ${estado} - ${correo} (${usuario.nombre_completo})`);
            });
        }

        if (faltantes.length > 0) {
            console.log('\n❌ Usuarios faltantes:');
            faltantes.forEach(correo => {
                console.log(`   - ${correo}`);
            });
            console.log('\n💡 Solución: Ejecuta el script crear-usuarios-produccion.js para crear los usuarios faltantes');
        }

        // Mostrar usuarios que no están en la lista esperada
        const usuariosInesperados = usuarios.filter(u => !correosEsperados.includes(u.email));
        if (usuariosInesperados.length > 0) {
            console.log('\n⚠️ Usuarios adicionales (no en la lista esperada):');
            usuariosInesperados.forEach(u => {
                console.log(`   - ${u.email} (${u.nombre_completo}) - ${u.is_active ? 'ACTIVO' : 'INACTIVO'}`);
            });
        }

        // Verificar asignaciones a líneas de producción
        console.log('\n🔗 Verificando asignaciones a líneas de producción:');
        const [asignaciones] = await pool.query(
            `SELECT u.email, u.nombre_completo, lp.nombre as linea_nombre, lu.is_activo
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             LEFT JOIN linea_usuario lu ON u.id = lu.usuario_id
             LEFT JOIN lineas_produccion lp ON lu.linea_id = lp.id
             WHERE r.nombre = 'usuarios' AND u.email IN (${correosEsperados.map(() => '?').join(',')})
             ORDER BY u.email`,
            correosEsperados
        );

        const usuariosConLinea = asignaciones.filter(a => a.linea_nombre && a.is_activo);
        console.log(`✅ Usuarios asignados a líneas: ${usuariosConLinea.length}`);

        if (usuariosConLinea.length < encontrados.length) {
            console.log('⚠️ Algunos usuarios no tienen línea asignada:');
            encontrados.forEach(correo => {
                const tieneLinea = asignaciones.find(a => a.email === correo && a.linea_nombre && a.is_activo);
                if (!tieneLinea) {
                    console.log(`   - ${correo} no tiene línea asignada`);
                }
            });
        }

        console.log('\n📊 Resumen final:');
        console.log(`   Total usuarios esperados: ${correosEsperados.length}`);
        console.log(`   Usuarios encontrados: ${encontrados.length}`);
        console.log(`   Usuarios activos: ${usuariosActivos.length}`);
        console.log(`   Usuarios con línea asignada: ${usuariosConLinea.length}`);
        
        if (faltantes.length === 0 && usuariosActivos.length === correosEsperados.length && usuariosConLinea.length === correosEsperados.length) {
            console.log('\n✅ ¡PERFECTO! Todos los usuarios de producción están creados, activos y asignados a líneas.');
        } else {
            console.log('\n⚠️ Hay problemas que deben resolverse antes de que el sistema funcione correctamente.');
        }

    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    } finally {
        await pool.end();
    }
}

verificarUsuariosProduccion();


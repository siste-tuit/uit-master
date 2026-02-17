// Script para verificar el estado de los usuarios de producción
import { pool } from "./src/config/db.js";

const usuariosProduccion = [
    { nombre: 'Hover Rojas', email: 'hover.rojas@textil.com' },
    { nombre: 'Maycol', email: 'maycol@textil.com' },
    { nombre: 'Alicia', email: 'alicia@textil.com' },
    { nombre: 'Elena', email: 'elena@textil.com' },
    { nombre: 'Rosa', email: 'rosa@textil.com' },
    { nombre: 'Alfredo', email: 'alfredo@textil.com' },
    { nombre: 'Eduardo', email: 'eduardo@textil.com' },
    { nombre: 'Juana', email: 'juana@textil.com' },
    { nombre: 'Alisson', email: 'alisson@textil.com' }
];

async function verificarUsuariosProduccion() {
    try {
        console.log('🔍 Verificando usuarios de producción...\n');

        for (const usuario of usuariosProduccion) {
            // Verificar si el usuario existe
            const [usuarios] = await pool.query(
                `SELECT u.id, u.nombre_completo, u.email, r.nombre as rol, u.is_activo
                 FROM usuarios u
                 LEFT JOIN roles r ON u.rol_id = r.id
                 WHERE u.email = ?`,
                [usuario.email]
            );

            if (usuarios.length === 0) {
                console.log(`❌ ${usuario.email} - NO EXISTE`);
            } else {
                const user = usuarios[0];
                const estado = user.is_activo ? '✅ ACTIVO' : '⚠️ INACTIVO';
                const rol = user.rol || 'SIN ROL';
                
                // Verificar si tiene línea asignada
                const [lineas] = await pool.query(
                    `SELECT lp.nombre as linea_nombre
                     FROM linea_usuario lu
                     INNER JOIN lineas_produccion lp ON lu.linea_id = lp.id
                     WHERE lu.usuario_id = ? AND lu.is_activo = TRUE
                     LIMIT 1`,
                    [user.id]
                );

                const linea = lineas.length > 0 ? lineas[0].linea_nombre : 'SIN LÍNEA ASIGNADA';

                console.log(`${estado} ${usuario.email}`);
                console.log(`   Nombre: ${user.nombre_completo}`);
                console.log(`   Rol: ${rol}`);
                console.log(`   Línea: ${linea}`);
                
                // Verificar pedidos recibidos
                const [pedidos] = await pool.query(
                    `SELECT COUNT(*) as total FROM pedidos_recibidos WHERE usuario_id = ?`,
                    [user.id]
                );
                
                // Verificar reportes enviados
                const [reportes] = await pool.query(
                    `SELECT COUNT(*) as total FROM reportes_diarios WHERE usuario_id = ?`,
                    [user.id]
                );

                console.log(`   Pedidos recibidos: ${pedidos[0].total}`);
                console.log(`   Reportes enviados: ${reportes[0].total}`);
                console.log('');
            }
        }

        console.log('\n✅ Verificación completada');
    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    } finally {
        process.exit(0);
    }
}

verificarUsuariosProduccion();

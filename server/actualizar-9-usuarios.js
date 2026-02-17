/**
 * Script: Reducir a 9 usuarios de producción y actualizar nombres/correos
 * - Elimina 4 usuarios (los últimos 4 de la lista actual)
 * - Actualiza los 9 restantes con los nuevos nombres y correos
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const NUEVOS_NOMBRES = [
    'Hover Rojas',
    'Maycol',
    'Alicia',
    'Elena',
    'Rosa',
    'Alfredo',
    'Eduardo',
    'Juana',
    'Alisson'
];

// Correos nuevos (mismo orden que los nombres)
const NUEVOS_CORREOS = [
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

const EMAILS_ACTUALES_13 = [
    'AyC@textil.com',
    'AyC2@textil.com',
    'AyC3@textil.com',
    'AyC4@textil.com',
    'DyM@textil.com',
    'Elenatex@textil.com',
    'Emanuel@textil.com',
    'Emanuel2@textil.com',
    'JflStyle@textil.com',
    'Juanazea@textil.com',
    'Myl@textil.com',
    'Myl2@textil.com',
    'Velasquez@textil.com'
];

async function main() {
    let connection;
    try {
        const sslOptions = process.env.DB_SSL === 'true'
            ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
            : {};

        connection = process.env.DB_URL
            ? await mysql.createConnection({ uri: process.env.DB_URL, ...sslOptions })
            : await mysql.createConnection({
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                ...sslOptions
            });

        console.log('✅ Conectado a la base de datos\n');

        // 1) Obtener los 13 usuarios en el orden fijo de la lista
        const [rows] = await connection.query(
            `SELECT id, email, nombre_completo, rol_id FROM usuarios WHERE email IN (${EMAILS_ACTUALES_13.map(() => '?').join(',')})`,
            EMAILS_ACTUALES_13
        );
        // Ordenar en el mismo orden que EMAILS_ACTUALES_13
        const orderMap = new Map(EMAILS_ACTUALES_13.map((e, i) => [e, i]));
        rows.sort((a, b) => (orderMap.get(a.email) ?? 99) - (orderMap.get(b.email) ?? 99));

        if (rows.length !== 13) {
            console.error(`❌ Se esperaban 13 usuarios, se encontraron ${rows.length}. Abortando.`);
            process.exit(1);
        }

        const usuariosAMantener = rows.slice(0, 9);  // Primeros 9
        const usuariosAEliminar = rows.slice(9, 13); // Últimos 4

        const idsAEliminar = usuariosAEliminar.map(u => u.id);
        const idAdminFallback = usuariosAMantener[0].id; // Para reasignar facturas/logs si hace falta

        console.log('📋 Usuarios a MANTENER (9) y actualizar:');
        usuariosAMantener.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.nombre_completo}) → ${NUEVOS_NOMBRES[i]} <${NUEVOS_CORREOS[i]}>`);
        });
        console.log('\n📋 Usuarios a ELIMINAR (4):');
        usuariosAEliminar.forEach(u => console.log(`   - ${u.email} (${u.nombre_completo})`));
        console.log('');

        // 2) Evitar RESTRICT: reasignar facturas, registros_financieros y logs de los 4 que se borran (si las tablas existen)
        const reasignarSiExiste = async (nombreTabla, columnaId, ids) => {
            try {
                const [r] = await connection.query(
                    `SELECT COUNT(*) as c FROM ${nombreTabla} WHERE ${columnaId} IN (?)`,
                    [ids]
                );
                if (r[0].c > 0) {
                    await connection.query(
                        `UPDATE ${nombreTabla} SET ${columnaId} = ? WHERE ${columnaId} IN (?)`,
                        [idAdminFallback, ids]
                    );
                    console.log(`   ✅ Reasignados ${r[0].c} registros en ${nombreTabla}.`);
                }
            } catch (e) {
                if (e.code === 'ER_NO_SUCH_TABLE') return;
                throw e;
            }
        };
        await reasignarSiExiste('facturas', 'user_id', idsAEliminar);
        await reasignarSiExiste('registros_financieros', 'usuario_id', idsAEliminar);
        await reasignarSiExiste('logs', 'usuario_id', idsAEliminar);

        // 3) Eliminar los 4 usuarios (CASCADE eliminará trabajadores, asistencia, reportes, pedidos)
        for (const u of usuariosAEliminar) {
            await connection.query('DELETE FROM usuarios WHERE id = ?', [u.id]);
            console.log(`   🗑️ Eliminado: ${u.email}`);
        }
        console.log('');

        // 4) Actualizar los 9 restantes: nombre_completo y email
        for (let i = 0; i < usuariosAMantener.length; i++) {
            const usuario = usuariosAMantener[i];
            const nuevoNombre = NUEVOS_NOMBRES[i];
            const nuevoEmail = NUEVOS_CORREOS[i];
            await connection.query(
                'UPDATE usuarios SET nombre_completo = ?, email = ? WHERE id = ?',
                [nuevoNombre, nuevoEmail, usuario.id]
            );
            console.log(`   ✏️ Actualizado: ${usuario.email} → ${nuevoNombre} <${nuevoEmail}>`);
        }

        console.log('\n✅ Listo. Quedan 9 usuarios con los nuevos nombres y correos.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

main();

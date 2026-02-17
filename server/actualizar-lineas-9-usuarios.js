/**
 * Asigna los 9 usuarios de producción a todas las líneas de producción
 * y desactiva asignaciones de usuarios que no estén en la lista.
 * Ejecutar: node actualizar-lineas-9-usuarios.js
 */
import { pool } from './src/config/db.js';
import { randomUUID } from 'crypto';

const EMAILS_9_USUARIOS = [
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

async function actualizarLineasCon9Usuarios() {
  try {
    console.log('🔍 Obteniendo los 9 usuarios de producción por email...\n');
    const placeholders = EMAILS_9_USUARIOS.map(() => '?').join(', ');
    const [usuarios] = await pool.query(
      `SELECT id, nombre_completo, email FROM usuarios WHERE email IN (${placeholders}) AND is_active = TRUE`,
      EMAILS_9_USUARIOS
    );

    if (usuarios.length === 0) {
      console.log('⚠️ No se encontró ninguno de los 9 usuarios. Crea primero los usuarios (crear-usuarios-produccion.js).');
      process.exit(1);
    }

    console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => console.log(`   - ${u.nombre_completo} (${u.email})`));
    const idsNueve = usuarios.map(u => u.id);

    console.log('\n🔍 Obteniendo todas las líneas de producción...');
    const [lineas] = await pool.query(
      'SELECT id, nombre FROM lineas_produccion ORDER BY nombre'
    );
    if (lineas.length === 0) {
      console.log('⚠️ No hay líneas de producción. Ejecuta antes el seed de producción.');
      process.exit(1);
    }
    console.log(`✅ Líneas encontradas: ${lineas.length}\n`);

    console.log('🧹 Desactivando asignaciones de usuarios que NO son de los 9...');
    const [desactivados] = await pool.query(
      `UPDATE linea_usuario SET is_activo = FALSE WHERE usuario_id NOT IN (${idsNueve.map(() => '?').join(', ')})`,
      idsNueve
    );
    console.log(`   Filas actualizadas (is_activo = FALSE): ${desactivados.affectedRows}\n`);

    console.log('📌 Asignando los 9 usuarios a cada línea...');
    let insertadas = 0;
    let activadas = 0;

    for (const linea of lineas) {
      for (const usuario of usuarios) {
        const [existentes] = await pool.query(
          'SELECT id, is_activo FROM linea_usuario WHERE linea_id = ? AND usuario_id = ?',
          [linea.id, usuario.id]
        );
        if (existentes.length > 0) {
          if (!existentes[0].is_activo) {
            await pool.query('UPDATE linea_usuario SET is_activo = TRUE WHERE id = ?', [existentes[0].id]);
            activadas++;
          }
        } else {
          await pool.query(
            'INSERT INTO linea_usuario (id, linea_id, usuario_id, is_activo) VALUES (?, ?, ?, TRUE)',
            [randomUUID(), linea.id, usuario.id]
          );
          insertadas++;
        }
      }
    }

    console.log(`   Nuevas asignaciones: ${insertadas}`);
    console.log(`   Reactivadas: ${activadas}`);
    console.log('\n✅ Cada línea tiene ahora los ' + usuarios.length + ' usuarios de producción asignados.');
    console.log('   En el dashboard de Ingeniería verás "Usuarios: ..." con sus nombres en cada línea.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

actualizarLineasCon9Usuarios();

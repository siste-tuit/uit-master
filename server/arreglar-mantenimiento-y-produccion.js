/**
 * Crea o actualiza el usuario de mantenimiento y los 9 de producción
 * con las contraseñas correctas. Ejecutar en Render Shell: node arreglar-mantenimiento-y-produccion.js
 */
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './src/config/db.js';

const SALT_ROUNDS = 10;

const MANTENIMIENTO = {
  nombre_completo: 'Pedro Martínez',
  email: 'mantenimiento@textil.com',
  rol: 'mantenimiento',
  departamento: 'Mantenimiento',
  avatar: '🔧',
  password: 'MAT266...'
};

const PRODUCCION = [
  { nombre_completo: 'Hover Rojas', email: 'hover.rojas@textil.com', password: 'Hov226...' },
  { nombre_completo: 'Maycol', email: 'maycol@textil.com', password: 'Myc226...' },
  { nombre_completo: 'Alicia', email: 'alicia@textil.com', password: 'Alc226...' },
  { nombre_completo: 'Elena', email: 'elena@textil.com', password: 'Ele226...' },
  { nombre_completo: 'Rosa', email: 'rosa@textil.com', password: 'Ros226...' },
  { nombre_completo: 'Alfredo', email: 'alfredo@textil.com', password: 'Alf226...' },
  { nombre_completo: 'Eduardo', email: 'eduardo@textil.com', password: 'Edu226...' },
  { nombre_completo: 'Juana', email: 'juana@textil.com', password: 'Jun226...' },
  { nombre_completo: 'Alisson', email: 'alisson@textil.com', password: 'Als226...' }
];

async function main() {
  let connection;
  try {
    console.log('🔧 Arreglando usuario mantenimiento y 9 de producción...\n');
    connection = await pool.getConnection();

    const [rolesMant] = await connection.query("SELECT id FROM roles WHERE nombre = ?", [MANTENIMIENTO.rol]);
    const [rolesUsu] = await connection.query("SELECT id FROM roles WHERE nombre = ?", ['usuarios']);
    if (rolesMant.length === 0 || rolesUsu.length === 0) {
      console.error('❌ No se encontraron los roles. Ejecuta antes: npm run seed:all');
      process.exit(1);
    }
    const roleMantId = rolesMant[0].id;
    const roleUsuId = rolesUsu[0].id;

    const hashMant = await bcrypt.hash(MANTENIMIENTO.password, SALT_ROUNDS);
    await connection.query(
      `INSERT INTO usuarios (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
       ON DUPLICATE KEY UPDATE
         password = VALUES(password),
         nombre_completo = VALUES(nombre_completo),
         rol_id = VALUES(rol_id),
         departamento = VALUES(departamento),
         avatar = VALUES(avatar),
         is_active = TRUE,
         updated_at = NOW()`,
      [uuidv4(), MANTENIMIENTO.email, hashMant, MANTENIMIENTO.nombre_completo, roleMantId, MANTENIMIENTO.departamento, MANTENIMIENTO.avatar]
    );
    console.log('✅ Mantenimiento:', MANTENIMIENTO.email);

    for (const u of PRODUCCION) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await connection.query(
        `INSERT INTO usuarios (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login)
         VALUES (?, ?, ?, ?, ?, 'Producción', '👷', TRUE, NOW())
         ON DUPLICATE KEY UPDATE
           password = VALUES(password),
           nombre_completo = VALUES(nombre_completo),
           rol_id = VALUES(rol_id),
           departamento = VALUES(departamento),
           is_active = TRUE,
           updated_at = NOW()`,
        [uuidv4(), u.email, hash, u.nombre_completo, roleUsuId]
      );
      console.log('✅ Producción:', u.email);
    }

    console.log('\n🎉 Listo. Ya puedes entrar con esas cuentas.');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

main();

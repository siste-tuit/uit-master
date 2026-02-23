import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

dotenv.config();

// Mapa de nuevas contraseñas por email
const PASSWORDS = {
  'admin@textil.com': 'Adm226....',
  'contabilidad@textil.com': 'Ctd620...',
  'sistemas@textil.com': 'siS2026...',
  'gerencia@textil.com': 'geR202...',
  'ingenieria@textil.com': 'inG226...',
  'mantenimiento@textil.com': 'MAT266...',
  'hover.rojas@textil.com': 'Hov226...',
  'maycol@textil.com': 'Myc226...',
  'alicia@textil.com': 'Alc226...',
  'elena@textil.com': 'Ele226...',
  'rosa@textil.com': 'Ros226...',
  'alfredo@textil.com': 'Alf226...',
  'eduardo@textil.com': 'Edu226...',
  'juana@textil.com': 'Jun226...',
  'alisson@textil.com': 'Als226...',
};

// Datos para crear usuarios que no existan (mantenimiento + 9 producción)
const USUARIOS_A_CREAR = {
  'mantenimiento@textil.com': { nombre_completo: 'Pedro Martínez', rol: 'mantenimiento', departamento: 'Mantenimiento', avatar: '🔧' },
  'hover.rojas@textil.com': { nombre_completo: 'Hover Rojas', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'maycol@textil.com': { nombre_completo: 'Maycol', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'alicia@textil.com': { nombre_completo: 'Alicia', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'elena@textil.com': { nombre_completo: 'Elena', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'rosa@textil.com': { nombre_completo: 'Rosa', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'alfredo@textil.com': { nombre_completo: 'Alfredo', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'eduardo@textil.com': { nombre_completo: 'Eduardo', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'juana@textil.com': { nombre_completo: 'Juana', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
  'alisson@textil.com': { nombre_completo: 'Alisson', rol: 'usuarios', departamento: 'Producción', avatar: '👷' },
};

const SALT_ROUNDS = 10;

async function updateUserPasswords() {
  console.log('🔐 Actualizando contraseñas y creando usuarios faltantes...\n');

  try {
    for (const [email, plainPassword] of Object.entries(PASSWORDS)) {
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

      const [updateResult] = await pool.query(
        `UPDATE usuarios SET password = ?, updated_at = NOW() WHERE email = ?`,
        [hashedPassword, email]
      );

      if (updateResult.affectedRows > 0) {
        console.log(`✅ Contraseña actualizada: ${email}`);
      } else if (USUARIOS_A_CREAR[email]) {
        const datos = USUARIOS_A_CREAR[email];
        const [roles] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [datos.rol]);
        if (roles.length === 0) {
          console.log(`⚠️ Rol "${datos.rol}" no existe. Ejecuta antes: npm run seed:all`);
          continue;
        }
        await pool.query(
          `INSERT INTO usuarios (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active, last_login)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
          [uuidv4(), email, hashedPassword, datos.nombre_completo, roles[0].id, datos.departamento, datos.avatar]
        );
        console.log(`✅ Usuario creado: ${email}`);
      } else {
        console.log(`⚠️ No encontrado (y no en lista de creación): ${email}`);
      }
    }

    console.log('\n🎉 Listo. Ya puedes entrar con mantenimiento y los 9 de producción.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateUserPasswords();


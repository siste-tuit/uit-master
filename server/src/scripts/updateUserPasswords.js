import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
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

  // Usuarios de producción (todos con la misma contraseña fuerte por ahora)
  'hover.rojas@textil.com': 'Hov226...',
  'maycol@textil.com': 'Myc226...',
  'alicia@textil.com': 'Alc226...',
  'elena@textil.com': 'Ele226...',
  'rosa@textil.com': 'Ros226...',
  'alfredo@textil.com': 'Alf226...',
  'eduardo@textil.com': 'Edu226...',
  'juana@textil.com': 'Jun226...',
  'alisson@textil.com': 'Als226...',
  // usuario@textil.com mantiene la contraseña actual (por defecto demo123) salvo que se defina aquí.
};

const SALT_ROUNDS = 10;

async function updateUserPasswords() {
  console.log('🔐 Iniciando actualización de contraseñas de usuarios clave...\n');

  try {
    for (const [email, plainPassword] of Object.entries(PASSWORDS)) {
      console.log(`➡️  Actualizando contraseña para: ${email}`);

      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

      const [result] = await pool.query(
        `
        UPDATE usuarios
        SET password = ?, updated_at = NOW()
        WHERE email = ?
      `,
        [hashedPassword, email]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ Contraseña actualizada para ${email}`);
      } else {
        console.log(`⚠️ No se encontró usuario con email ${email} (no se actualizó nada).`);
      }
    }

    console.log('\n🎉 Actualización de contraseñas finalizada.');
  } catch (error) {
    console.error('❌ Error actualizando contraseñas:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateUserPasswords();


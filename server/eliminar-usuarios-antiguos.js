// Script para eliminar o desactivar usuarios antiguos de producción
// que ya no deben existir (los 13 con correos antiguos como AyC@textil.com, etc.)
import { pool } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Lista de correos antiguos que deben eliminarse o desactivarse
const EMAILS_ANTIGUOS = [
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

// Opción: 'eliminar' o 'desactivar'
const ACCION = process.env.ACCION_USUARIOS_ANTIGUOS || 'desactivar';

async function eliminarODesactivarUsuariosAntiguos() {
  console.log(`🔍 Buscando usuarios antiguos para ${ACCION === 'eliminar' ? 'eliminar' : 'desactivar'}...\n`);

  try {
    // Obtener usuarios que coinciden con los correos antiguos
    const placeholders = EMAILS_ANTIGUOS.map(() => '?').join(',');
    const [usuarios] = await pool.query(
      `SELECT id, email, nombre_completo, is_active 
       FROM usuarios 
       WHERE email IN (${placeholders})`,
      EMAILS_ANTIGUOS
    );

    if (usuarios.length === 0) {
      console.log('✅ No se encontraron usuarios antiguos. Ya están eliminados o no existen.');
      return;
    }

    console.log(`📋 Encontrados ${usuarios.length} usuarios antiguos:\n`);
    usuarios.forEach(u => {
      console.log(`   - ${u.email} (${u.nombre_completo}) - Estado actual: ${u.is_active ? 'ACTIVO' : 'INACTIVO'}`);
    });
    console.log('');

    if (ACCION === 'eliminar') {
      console.log('🗑️  ELIMINANDO usuarios antiguos...\n');
      
      for (const usuario of usuarios) {
        await pool.query('DELETE FROM usuarios WHERE id = ?', [usuario.id]);
        console.log(`   ✅ Eliminado: ${usuario.email}`);
      }
      
      console.log(`\n✅ ${usuarios.length} usuarios antiguos eliminados exitosamente.`);
    } else {
      console.log('🔒 DESACTIVANDO usuarios antiguos...\n');
      
      for (const usuario of usuarios) {
        await pool.query(
          'UPDATE usuarios SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
          [usuario.id]
        );
        console.log(`   ✅ Desactivado: ${usuario.email}`);
      }
      
      console.log(`\n✅ ${usuarios.length} usuarios antiguos desactivados exitosamente.`);
      console.log('   (Ya no podrán iniciar sesión, pero sus datos históricos se mantienen)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

eliminarODesactivarUsuariosAntiguos();

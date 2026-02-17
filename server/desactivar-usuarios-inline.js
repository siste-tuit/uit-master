// Script simplificado para ejecutar inline en Render
// Evita caracteres especiales que bash interpreta mal
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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

async function desactivarUsuariosAntiguos() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      } : undefined
    });

    console.log('Buscando usuarios antiguos...\n');

    const placeholders = EMAILS_ANTIGUOS.map(() => '?').join(',');
    const [usuariosAntes] = await connection.query(
      `SELECT id, email, nombre_completo, is_active 
       FROM usuarios 
       WHERE email IN (${placeholders})`,
      EMAILS_ANTIGUOS
    );

    if (usuariosAntes.length === 0) {
      console.log('No se encontraron usuarios antiguos.');
      await connection.end();
      process.exit(0);
    }

    console.log(`Encontrados ${usuariosAntes.length} usuarios:\n`);
    usuariosAntes.forEach(u => {
      const estado = u.is_active ? 'ACTIVO (1)' : 'INACTIVO (0)';
      console.log(`   - ${u.email} - Estado: ${estado}`);
    });
    console.log('\nDesactivando usuarios...\n');
    
    const [result] = await connection.query(
      `UPDATE usuarios 
       SET is_active = 0, updated_at = NOW() 
       WHERE email IN (${placeholders})`,
      EMAILS_ANTIGUOS
    );

    console.log(`UPDATE ejecutado. Filas afectadas: ${result.affectedRows}\n`);

    console.log('Verificando estado después del UPDATE...\n');
    const [usuariosDespues] = await connection.query(
      `SELECT id, email, nombre_completo, is_active 
       FROM usuarios 
       WHERE email IN (${placeholders})`,
      EMAILS_ANTIGUOS
    );

    console.log('Estado final de usuarios antiguos:\n');
    usuariosDespues.forEach(u => {
      const estado = u.is_active ? 'ACTIVO (1) - NO DESACTIVADO' : 'INACTIVO (0) - DESACTIVADO';
      console.log(`   - ${u.email}: ${estado}`);
    });

    const activos = usuariosDespues.filter(u => u.is_active === 1 || u.is_active === true).length;
    const inactivos = usuariosDespues.filter(u => u.is_active === 0 || u.is_active === false).length;

    console.log(`\nResumen:`);
    console.log(`   - Total usuarios antiguos: ${usuariosDespues.length}`);
    console.log(`   - Desactivados correctamente: ${inactivos}`);
    console.log(`   - Aun activos (error): ${activos}`);

    if (activos === 0) {
      console.log(`\nTodos los usuarios antiguos fueron desactivados exitosamente.`);
      console.log(`(Ya no podran iniciar sesion con demo123)`);
    } else {
      console.log(`\nADVERTENCIA: ${activos} usuarios aun estan activos.`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

desactivarUsuariosAntiguos();

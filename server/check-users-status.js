// Script para verificar el estado de usuarios específicos
import pool from "./src/config/db.js";

const emailsToCheck = [
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

async function checkUsersStatus() {
  try {
    console.log('🔍 Verificando estado de usuarios...\n');
    
    const placeholders = emailsToCheck.map(() => '?').join(',');
    const [users] = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.nombre_completo as name,
        u.is_active,
        r.nombre as role,
        u.departamento,
        u.last_login
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.email IN (${placeholders})
      ORDER BY u.email`,
      emailsToCheck
    );

    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);
    console.log('='.repeat(80));
    
    const foundEmails = new Set(users.map(u => u.email.toLowerCase()));
    const notFoundEmails = emailsToCheck.filter(email => !foundEmails.has(email.toLowerCase()));
    
    // Mostrar usuarios encontrados
    users.forEach((user, index) => {
      const status = user.is_active ? '✅ ACTIVO' : '❌ INACTIVO';
      const lastLogin = user.last_login 
        ? new Date(user.last_login).toLocaleString('es-ES')
        : 'Nunca';
      
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Estado: ${status}`);
      console.log(`   Nombre: ${user.name || 'N/A'}`);
      console.log(`   Rol: ${user.role || 'N/A'}`);
      console.log(`   Departamento: ${user.departamento || 'N/A'}`);
      console.log(`   Último login: ${lastLogin}`);
    });
    
    // Mostrar usuarios no encontrados
    if (notFoundEmails.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('\n⚠️  Usuarios NO encontrados en la base de datos:');
      notFoundEmails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
      });
    }
    
    // Resumen
    const activeCount = users.filter(u => u.is_active).length;
    const inactiveCount = users.filter(u => !u.is_active).length;
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`   ✅ Activos: ${activeCount}`);
    console.log(`   ❌ Inactivos: ${inactiveCount}`);
    console.log(`   🔍 No encontrados: ${notFoundEmails.length}`);
    console.log(`   📝 Total consultados: ${emailsToCheck.length}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
    process.exit(1);
  }
}

checkUsersStatus();


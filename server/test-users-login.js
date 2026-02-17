// Script para verificar que todos los usuarios pueden hacer login correctamente
import pool from "./src/config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo';

const emailsToCheck = [
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

// Contraseñas comunes a probar (según documentación, la contraseña es demo123)
const commonPasswords = [
  'demo123',  // Contraseña por defecto según CREDENCIALES_USUARIOS.md
  '123456',
  'password',
  'Password123',
  'textil123',
  'Textil123',
  'admin123',
  'Admin123'
];

async function testUserLogin(email, password) {
  try {
    // 1. Buscar el usuario por email
    const [rows] = await pool.query(
      `SELECT 
        u.id, u.email, u.password, u.nombre_completo as name, u.departamento, u.avatar, u.is_active, 
        r.nombre as role, r.dashboard_path 
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    const user = rows[0];

    // 2. Verificar si el usuario está activo
    if (!user.is_active) {
      return {
        success: false,
        error: 'Usuario inactivo'
      };
    }

    // 3. Comparar la contraseña hasheada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Contraseña incorrecta',
        hasPassword: true
      };
    }

    // 4. Generar el Token Web JSON (JWT) para verificar que funciona
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.departamento
      },
      token: token.substring(0, 20) + '...' // Solo mostrar primeros caracteres
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testAllUsers() {
  console.log('🔍 Verificando que todos los usuarios funcionen correctamente...\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const email of emailsToCheck) {
    console.log(`\n📧 Probando: ${email}`);
    
    let loginSuccess = false;
    let testedPassword = null;
    let error = null;
    
    // Probar con contraseñas comunes
    for (const password of commonPasswords) {
      const result = await testUserLogin(email, password);
      
      if (result.success) {
        loginSuccess = true;
        testedPassword = password;
        console.log(`   ✅ Login exitoso con contraseña: "${password}"`);
        console.log(`   👤 Usuario: ${result.user.name}`);
        console.log(`   🎭 Rol: ${result.user.role}`);
        console.log(`   🏢 Departamento: ${result.user.department}`);
        break;
      } else if (result.hasPassword) {
        // Tiene contraseña pero no es ninguna de las comunes
        error = 'Contraseña no es ninguna de las comunes probadas';
      } else {
        error = result.error;
      }
    }
    
    if (!loginSuccess) {
      console.log(`   ❌ No se pudo hacer login`);
      console.log(`   ⚠️  Razón: ${error || 'Contraseña no coincide con ninguna común'}`);
    }
    
    results.push({
      email,
      success: loginSuccess,
      password: testedPassword,
      error: error
    });
  }
  
  // Resumen
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMEN DE VERIFICACIÓN:\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Usuarios con login exitoso: ${successful}`);
  console.log(`❌ Usuarios con problemas: ${failed}`);
  console.log(`📝 Total verificados: ${results.length}\n`);
  
  if (failed > 0) {
    console.log('⚠️  USUARIOS CON PROBLEMAS:\n');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.email}`);
      console.log(`      Problema: ${result.error || 'No se pudo hacer login'}\n`);
    });
  }
  
  // Verificar estructura de datos
  console.log('='.repeat(80));
  console.log('\n🔍 Verificando estructura de datos de usuarios...\n');
  
  const [users] = await pool.query(
    `SELECT 
      u.id,
      u.email,
      u.nombre_completo,
      u.is_active,
      u.password IS NOT NULL as has_password,
      LENGTH(u.password) as password_length,
      r.nombre as role,
      r.dashboard_path
    FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
    WHERE u.email IN (${emailsToCheck.map(() => '?').join(',')})
    ORDER BY u.email`,
    emailsToCheck
  );
  
  users.forEach((user, index) => {
    const issues = [];
    if (!user.has_password) issues.push('Sin contraseña');
    if (!user.is_active) issues.push('Inactivo');
    if (!user.role) issues.push('Sin rol asignado');
    if (!user.dashboard_path) issues.push('Sin dashboard_path');
    
    const status = issues.length === 0 ? '✅ OK' : `⚠️  ${issues.join(', ')}`;
    console.log(`${index + 1}. ${user.email} - ${status}`);
  });
  
  process.exit(0);
}

testAllUsers().catch(error => {
  console.error('❌ Error al verificar usuarios:', error);
  process.exit(1);
});


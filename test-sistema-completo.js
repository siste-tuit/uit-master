// Script de pruebas exhaustivas del sistema
// Verifica que todo funcione correctamente antes del despliegue

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'uit'
};

const TESTS = {
  conexion_db: false,
  tablas_existentes: false,
  usuarios_activos: false,
  roles_configurados: false,
  endpoints_criticos: false
};

async function testConexionDB() {
  console.log('🔍 Test 1: Conexión a Base de Datos...');
  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    TESTS.conexion_db = true;
    console.log('✅ Conexión a BD exitosa\n');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error.message);
    return false;
  }
}

async function testTablasExistentes() {
  console.log('🔍 Test 2: Verificando tablas críticas...');
  try {
    const connection = await mysql.createConnection(config);
    
    const tablas_criticas = [
      'usuarios', 'roles', 'lineas_produccion', 'reportes_diarios',
      'pedidos_recibidos', 'inventario_items', 'trabajadores', 'asistencia',
      'incidencias', 'flujos_salida', 'registros_financieros'
    ];
    
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [config.database]
    );
    
    const tablasExistentes = tables.map(t => t.TABLE_NAME);
    const faltantes = tablas_criticas.filter(t => !tablasExistentes.includes(t));
    
    if (faltantes.length === 0) {
      TESTS.tablas_existentes = true;
      console.log(`✅ Todas las ${tablas_criticas.length} tablas críticas existen\n`);
    } else {
      console.error(`❌ Faltan tablas: ${faltantes.join(', ')}\n`);
    }
    
    await connection.end();
    return faltantes.length === 0;
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
    return false;
  }
}

async function testUsuariosActivos() {
  console.log('🔍 Test 3: Verificando usuarios activos...');
  try {
    const connection = await mysql.createConnection(config);
    
    const [users] = await connection.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE is_active = TRUE"
    );
    
    const total = users[0].total;
    
    if (total >= 10) {
      TESTS.usuarios_activos = true;
      console.log(`✅ ${total} usuarios activos encontrados (mínimo: 10)\n`);
    } else {
      console.warn(`⚠️ Solo ${total} usuarios activos (esperado: 10+)\n`);
    }
    
    await connection.end();
    return total >= 10;
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
    return false;
  }
}

async function testRolesConfigurados() {
  console.log('🔍 Test 4: Verificando roles configurados...');
  try {
    const connection = await mysql.createConnection(config);
    
    const [roles] = await connection.query(
      "SELECT nombre, dashboard_path FROM roles ORDER BY nombre"
    );
    
    const rolesEsperados = ['administrador', 'gerencia', 'ingenieria', 'produccion', 'sistemas'];
    const rolesExistentes = roles.map(r => r.nombre);
    const faltantes = rolesEsperados.filter(r => !rolesExistentes.includes(r));
    
    if (faltantes.length === 0) {
      TESTS.roles_configurados = true;
      console.log(`✅ Todos los ${rolesEsperados.length} roles críticos están configurados\n`);
    } else {
      console.error(`❌ Faltan roles: ${faltantes.join(', ')}\n`);
    }
    
    console.log('Roles encontrados:');
    roles.forEach(r => {
      console.log(`  • ${r.nombre} → ${r.dashboard_path}`);
    });
    console.log();
    
    await connection.end();
    return faltantes.length === 0;
  } catch (error) {
    console.error('❌ Error verificando roles:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TESTING EXHAUSTIVO DEL SISTEMA');
  console.log('═══════════════════════════════════════════════════\n');
  
  const results = {
    conexion_db: await testConexionDB(),
    tablas_existentes: await testTablasExistentes(),
    usuarios_activos: await testUsuariosActivos(),
    roles_configurados: await testRolesConfigurados()
  };
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Tests pasados: ${passed}/${total}`);
  console.log(`❌ Tests fallidos: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!');
  } else {
    console.log('\n⚠️ REVISAR TESTS FALLIDOS ANTES DE DESPLEGAR');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(console.error);

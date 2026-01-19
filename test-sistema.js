// Script de pruebas básicas del sistema UIT-MASTER
// Ejecutar con: node test-sistema.js

const API_BASE = 'http://localhost:5000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

// Función para hacer requests
async function test(endpoint, method = 'GET', body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Función para imprimir resultado
function printResult(name, result, expectedStatus = 200) {
  if (result.ok && result.status === expectedStatus) {
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else {
      console.log(`   Status: ${result.status}`);
      console.log(`   Data:`, result.data);
    }
    testsFailed++;
  }
}

// Tests principales
async function runTests() {
  console.log(`${colors.blue}🧪 Iniciando pruebas del sistema UIT-MASTER...\n${colors.reset}`);
  
  // 1. Test del ping
  console.log('1. Probando endpoint /ping...');
  const pingResult = await test('/ping');
  printResult('Ping del servidor', pingResult);
  
  // 2. Test de login
  console.log('\n2. Probando autenticación...');
  const loginResult = await test('/api/auth/login', 'POST', {
    email: 'admin@textil.com',
    password: 'demo123'
  });
  
  let token = null;
  if (loginResult.ok && loginResult.data.token) {
    token = loginResult.data.token;
    printResult('Login exitoso', loginResult);
  } else {
    printResult('Login fallido', loginResult);
  }
  
  // 3. Test de usuarios (requiere autenticación)
  if (token) {
    console.log('\n3. Probando endpoints protegidos...');
    
    const usersResult = await test('/api/users', 'GET', null, token);
    printResult('Obtener usuarios', usersResult);
    
    const rolesResult = await test('/api/roles', 'GET', null, token);
    printResult('Obtener roles', rolesResult);
    
    const departamentosResult = await test('/api/departamentos', 'GET', null, token);
    printResult('Obtener departamentos', departamentosResult);
  }
  
  // 4. Test de incidencias
  if (token) {
    console.log('\n4. Probando módulo de incidencias...');
    const incidenciasResult = await test('/api/incidencias', 'GET', null, token);
    printResult('Obtener incidencias', incidenciasResult);
  }
  
  // 5. Test de equipos
  if (token) {
    console.log('\n5. Probando módulo de mantenimiento...');
    const equiposResult = await test('/api/equipos', 'GET', null, token);
    printResult('Obtener equipos', equiposResult);
  }
  
  // 6. Test de producción
  if (token) {
    console.log('\n6. Probando módulo de producción...');
    const produccionResult = await test('/api/produccion/lineas-con-usuarios', 'GET', null, token);
    printResult('Obtener líneas de producción', produccionResult);
  }
  
  // Resumen final
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Pruebas exitosas: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Pruebas fallidas: ${testsFailed}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
  
  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 ¡Todos los tests pasaron! El sistema está listo.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠️  Algunos tests fallaron. Revisa los errores arriba.${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error(`${colors.red}❌ Error ejecutando tests:${colors.reset}`, error);
  process.exit(1);
});

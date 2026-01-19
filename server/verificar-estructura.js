// Script de verificación estática de la estructura de Flujos de Salida
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let resultados = {
  exitosos: 0,
  fallidos: 0
};

function verificar(nombre, condicion, detalles = '') {
  if (condicion) {
    resultados.exitosos++;
    log(`   ✅ ${nombre}`, 'green');
    return true;
  } else {
    resultados.fallidos++;
    log(`   ❌ ${nombre}${detalles ? ': ' + detalles : ''}`, 'red');
    return false;
  }
}

function existeArchivo(ruta) {
  try {
    return fs.existsSync(ruta);
  } catch {
    return false;
  }
}

function leerArchivo(ruta) {
  try {
    return fs.readFileSync(ruta, 'utf-8');
  } catch {
    return '';
  }
}

log('\n' + '='.repeat(70), 'cyan');
log('🔍 VERIFICACIÓN ESTÁTICA DE ESTRUCTURA - FLUJOS DE SALIDA', 'cyan');
log('='.repeat(70) + '\n', 'cyan');

// ============================================
// BACKEND - Verificaciones
// ============================================
log('📦 BACKEND - Verificando archivos...', 'blue');

const backendFiles = {
  'Controller': path.join(__dirname, 'src', 'controllers', 'flujosSalidaController.js'),
  'Routes': path.join(__dirname, 'src', 'routes', 'flujosSalida.js'),
  'Migration': path.join(__dirname, 'src', 'scripts', 'migrateFlujosSalida.js'),
  'Index (registro de rutas)': path.join(__dirname, 'src', 'index.js')
};

for (const [nombre, ruta] of Object.entries(backendFiles)) {
  const existe = existeArchivo(ruta);
  verificar(`Archivo ${nombre} existe`, existe, existe ? '' : `Ruta esperada: ${ruta}`);
  
  if (existe) {
    const contenido = leerArchivo(ruta);
    
    // Verificaciones específicas
    if (nombre === 'Controller') {
      verificar(`Controller exporta enviarFlujoSalida`, contenido.includes('enviarFlujoSalida'));
      verificar(`Controller exporta getFlujosRecibidos`, contenido.includes('getFlujosRecibidos'));
      verificar(`Controller exporta actualizarEstadoFlujo`, contenido.includes('actualizarEstadoFlujo'));
      verificar(`Controller exporta getUsuariosSistemas`, contenido.includes('getUsuariosSistemas'));
      verificar(`Controller usa uuid`, contenido.includes('uuid'));
    }
    
    if (nombre === 'Routes') {
      verificar(`Routes registra POST /enviar`, contenido.includes("'/enviar'") || contenido.includes('"/enviar"'));
      verificar(`Routes registra GET /recibidos`, contenido.includes("'/recibidos'") || contenido.includes('"/recibidos"'));
      verificar(`Routes registra PUT /:id/estado`, contenido.includes('/estado'));
      verificar(`Routes usa authenticateToken`, contenido.includes('authenticateToken'));
      verificar(`Routes usa authorizeRoles`, contenido.includes('authorizeRoles'));
    }
    
    if (nombre === 'Migration') {
      verificar(`Migration crea tabla flujos_salida`, contenido.includes('flujos_salida'));
      verificar(`Migration define estructura correcta`, contenido.includes('usuario_sistemas_id') && contenido.includes('filtros') && contenido.includes('filas'));
    }
    
    if (nombre === 'Index (registro de rutas)') {
      verificar(`Index importa flujosSalidaRoutes`, contenido.includes('flujosSalidaRoutes'));
      verificar(`Index registra /api/flujos-salida`, contenido.includes('/api/flujos-salida'));
    }
  }
}

// ============================================
// FRONTEND - Verificaciones
// ============================================
log('\n🎨 FRONTEND - Verificando archivos...', 'blue');

const frontendRoot = path.join(__dirname, '..', 'frontend', 'src');
const frontendFiles = {
  'Página FlujosRecibidos': path.join(frontendRoot, 'pages', 'Sistemas', 'FlujosRecibidosPage.tsx'),
  'Página FichaSalida (Ingeniería)': path.join(frontendRoot, 'pages', 'Ingenieria', 'IngenieriaFichaSalidaPage.tsx'),
  'App.tsx (rutas)': path.join(frontendRoot, 'App.tsx'),
  'mockData.ts (menú)': path.join(frontendRoot, 'data', 'mockData.ts')
};

for (const [nombre, ruta] of Object.entries(frontendFiles)) {
  const existe = existeArchivo(ruta);
  verificar(`Archivo ${nombre} existe`, existe, existe ? '' : `Ruta esperada: ${ruta}`);
  
  if (existe) {
    const contenido = leerArchivo(ruta);
    
    if (nombre === 'Página FlujosRecibidos') {
      verificar(`FlujosRecibidosPage es componente React`, contenido.includes('React') || contenido.includes('FC'));
      verificar(`FlujosRecibidosPage usa fetch/axios`, contenido.includes('fetch') || contenido.includes('axios'));
    }
    
    if (nombre === 'Página FichaSalida (Ingeniería)') {
      verificar(`FichaSalidaPage tiene función guardarListado`, contenido.includes('guardarListado'));
      verificar(`FichaSalidaPage envía a /api/flujos-salida`, contenido.includes('/api/flujos-salida'));
    }
    
    if (nombre === 'App.tsx (rutas)') {
      verificar(`App.tsx importa FlujosRecibidosPage`, contenido.includes('FlujosRecibidosPage'));
      verificar(`App.tsx tiene ruta /sistemas/flujos-recibidos`, contenido.includes('flujos-recibidos'));
    }
    
    if (nombre === 'mockData.ts (menú)') {
      verificar(`mockData.ts incluye "Flujos Recibidos" en menú`, contenido.includes('Flujos Recibidos'));
    }
  }
}

// ============================================
// RESUMEN
// ============================================
log('\n' + '='.repeat(70), 'cyan');
log('📊 RESUMEN DE VERIFICACIÓN', 'cyan');
log('='.repeat(70), 'cyan');
log(`\n✅ Verificaciones exitosas: ${resultados.exitosos}`, 'green');
log(`❌ Verificaciones fallidas: ${resultados.fallidos}`, resultados.fallidos > 0 ? 'red' : 'green');
log(`📈 Total: ${resultados.exitosos + resultados.fallidos}`, 'blue');

const porcentaje = ((resultados.exitosos / (resultados.exitosos + resultados.fallidos)) * 100).toFixed(1);
log(`📊 Porcentaje: ${porcentaje}%`, porcentaje >= 90 ? 'green' : porcentaje >= 70 ? 'yellow' : 'red');

if (resultados.fallidos === 0) {
  log('\n🎉 ¡TODA LA ESTRUCTURA ESTÁ CORRECTA!', 'green');
  log('✅ Todos los archivos necesarios están en su lugar.\n', 'green');
  log('📝 PRÓXIMOS PASOS:', 'yellow');
  log('   1. Asegúrate de que la migración de la base de datos esté ejecutada:', 'yellow');
  log('      node server/src/scripts/migrateFlujosSalida.js', 'yellow');
  log('   2. Inicia el servidor backend:', 'yellow');
  log('      cd server && npm run dev', 'yellow');
  log('   3. Ejecuta el testeo completo:', 'yellow');
  log('      node server/test-completo-flujos.js\n', 'yellow');
} else {
  log('\n⚠️ Algunas verificaciones fallaron. Revisa los archivos faltantes.\n', 'yellow');
}

log('='.repeat(70) + '\n', 'cyan');


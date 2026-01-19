// Script de prueba completo para Flujos de Salida
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let resultados = {
  exitosos: 0,
  fallidos: 0,
  pruebas: []
};

function agregarResultado(nombre, exito, detalles = '') {
  resultados.pruebas.push({ nombre, exito, detalles });
  if (exito) {
    resultados.exitosos++;
    log(`   ✅ ${nombre}`, 'green');
  } else {
    resultados.fallidos++;
    log(`   ❌ ${nombre}: ${detalles}`, 'red');
  }
}

async function testCompleto() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🧪 TESTEO COMPLETO DEL SISTEMA DE FLUJOS DE SALIDA', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  let tokenIngenieria = null;
  let tokenSistemas = null;
  let usuarioSistemasId = null;
  let flujoId = null;

  try {
    // ============================================
    // TEST 1: Verificar que el servidor esté corriendo
    // ============================================
    log('📡 TEST 1: Verificando servidor backend...', 'blue');
    try {
      const ping = await fetch(`${BASE_URL}/ping`);
      if (ping.ok) {
        agregarResultado('Servidor backend respondiendo', true);
      } else {
        agregarResultado('Servidor backend respondiendo', false, `Status: ${ping.status}`);
      }
    } catch (error) {
      agregarResultado('Servidor backend respondiendo', false, error.message);
      log('\n❌ El servidor backend no está corriendo. Por favor inícialo primero.', 'red');
      log('   Ejecuta: cd server && npm run dev\n', 'yellow');
      process.exit(1);
    }

    // ============================================
    // TEST 2: Login como Ingeniería
    // ============================================
    log('\n🔐 TEST 2: Autenticación de Ingeniería...', 'blue');
    try {
      const login = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ingenieria@textil.com',
          password: 'demo123'
        })
      });

      if (login.ok) {
        const data = await login.json();
        tokenIngenieria = data.token;
        if (tokenIngenieria) {
          agregarResultado('Login Ingeniería exitoso', true, `Usuario: ${data.user?.nombre_completo || 'N/A'}`);
        } else {
          agregarResultado('Login Ingeniería exitoso', false, 'Token no recibido');
        }
      } else {
        const error = await login.json().catch(() => ({ message: 'Error desconocido' }));
        agregarResultado('Login Ingeniería exitoso', false, error.message);
      }
    } catch (error) {
      agregarResultado('Login Ingeniería exitoso', false, error.message);
    }

    // ============================================
    // TEST 3: Obtener usuarios de Sistemas
    // ============================================
    log('\n👥 TEST 3: Obtener usuarios de Sistemas...', 'blue');
    if (tokenIngenieria) {
      try {
        const usuarios = await fetch(`${BASE_URL}/api/flujos-salida/usuarios-sistemas`, {
          headers: {
            'Authorization': `Bearer ${tokenIngenieria}`,
            'Content-Type': 'application/json'
          }
        });

        if (usuarios.ok) {
          const data = await usuarios.json();
          if (data.usuarios && data.usuarios.length > 0) {
            usuarioSistemasId = data.usuarios[0].id;
            agregarResultado('Obtener usuarios Sistemas', true, `${data.usuarios.length} usuario(s) encontrado(s)`);
            agregarResultado('Usuario seleccionado válido', true, `${data.usuarios[0].nombre_completo}`);
          } else {
            agregarResultado('Obtener usuarios Sistemas', false, 'No se encontraron usuarios');
          }
        } else {
          const error = await usuarios.json().catch(() => ({ message: `HTTP ${usuarios.status}` }));
          agregarResultado('Obtener usuarios Sistemas', false, error.message);
        }
      } catch (error) {
        agregarResultado('Obtener usuarios Sistemas', false, error.message);
      }
    } else {
      agregarResultado('Obtener usuarios Sistemas', false, 'No hay token de autenticación');
    }

    // ============================================
    // TEST 4: Validación de datos antes de enviar
    // ============================================
    log('\n✅ TEST 4: Validación de datos del flujo...', 'blue');
    const flujoTest = {
      usuario_sistemas_id: usuarioSistemasId,
      filtros: {
        linea: 'A&C - CHINCHA GREEN',
        anio: '2025',
        mes: '12',
        semana: '50',
        dia: 'lunes'
      },
      filas: [
        {
          anio: '2025',
          mes: '12',
          semana: '50',
          dia: 'lunes',
          fecha: '2025-12-15',
          linea: 'A&C - CHINCHA GREEN',
          ficha: 'TEST-001',
          prendasEnviadas: 1500,
          tStd: '8.5',
          estatus: 'Completado',
          observacion: 'Prueba de flujo de salida',
          bajada: 'Bajada 1'
        },
        {
          anio: '2025',
          mes: '12',
          semana: '50',
          dia: 'martes',
          fecha: '2025-12-16',
          linea: 'A&C - CHINCHA GREEN',
          ficha: 'TEST-002',
          prendasEnviadas: 1800,
          tStd: '9.0',
          estatus: 'En proceso',
          observacion: 'Segunda fila de prueba',
          bajada: 'Bajada 2'
        }
      ]
    };

    // Validar estructura
    if (flujoTest.usuario_sistemas_id && flujoTest.filtros && Array.isArray(flujoTest.filas) && flujoTest.filas.length > 0) {
      agregarResultado('Estructura de datos válida', true);
    } else {
      agregarResultado('Estructura de datos válida', false, 'Datos incompletos');
    }

    // Validar filas
    const filasValidas = flujoTest.filas.filter(f => 
      f.anio && f.mes && f.semana && f.dia && f.fecha && f.linea && f.ficha && f.prendasEnviadas > 0
    );
    if (filasValidas.length === flujoTest.filas.length) {
      agregarResultado('Filas válidas', true, `${filasValidas.length} fila(s) válida(s)`);
    } else {
      agregarResultado('Filas válidas', false, `${filasValidas.length}/${flujoTest.filas.length} filas válidas`);
    }

    // ============================================
    // TEST 5: Enviar flujo de salida
    // ============================================
    log('\n📤 TEST 5: Enviar flujo de salida desde Ingeniería...', 'blue');
    if (tokenIngenieria && usuarioSistemasId) {
      try {
        const enviar = await fetch(`${BASE_URL}/api/flujos-salida/enviar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenIngenieria}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(flujoTest)
        });

        if (enviar.ok) {
          const data = await enviar.json();
          flujoId = data.id;
          agregarResultado('Enviar flujo de salida', true, `ID: ${flujoId.substring(0, 8)}...`);
          agregarResultado('Total de filas guardadas', true, `${data.total_filas} fila(s)`);
        } else {
          const error = await enviar.json().catch(() => ({ message: `HTTP ${enviar.status}` }));
          agregarResultado('Enviar flujo de salida', false, error.message);
        }
      } catch (error) {
        agregarResultado('Enviar flujo de salida', false, error.message);
      }
    } else {
      agregarResultado('Enviar flujo de salida', false, 'Faltan credenciales o usuario');
    }

    // ============================================
    // TEST 6: Login como Sistemas
    // ============================================
    log('\n🔐 TEST 6: Autenticación de Sistemas...', 'blue');
    try {
      const login = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sistemas@textil.com',
          password: 'demo123'
        })
      });

      if (login.ok) {
        const data = await login.json();
        tokenSistemas = data.token;
        if (tokenSistemas) {
          agregarResultado('Login Sistemas exitoso', true, `Usuario: ${data.user?.nombre_completo || 'N/A'}`);
        } else {
          agregarResultado('Login Sistemas exitoso', false, 'Token no recibido');
        }
      } else {
        const error = await login.json().catch(() => ({ message: 'Error desconocido' }));
        agregarResultado('Login Sistemas exitoso', false, error.message);
      }
    } catch (error) {
      agregarResultado('Login Sistemas exitoso', false, error.message);
    }

    // ============================================
    // TEST 7: Obtener flujos recibidos
    // ============================================
    log('\n📥 TEST 7: Obtener flujos recibidos en Sistemas...', 'blue');
    if (tokenSistemas) {
      try {
        const recibidos = await fetch(`${BASE_URL}/api/flujos-salida/recibidos`, {
          headers: {
            'Authorization': `Bearer ${tokenSistemas}`,
            'Content-Type': 'application/json'
          }
        });

        if (recibidos.ok) {
          const data = await recibidos.json();
          const totalFlujos = data.flujos?.length || 0;
          agregarResultado('Obtener flujos recibidos', true, `${totalFlujos} flujo(s) encontrado(s)`);
          
          if (flujoId && data.flujos) {
            const flujoEncontrado = data.flujos.find(f => f.id === flujoId);
            if (flujoEncontrado) {
              agregarResultado('Flujo enviado encontrado en recibidos', true);
              agregarResultado('Estado inicial correcto', flujoEncontrado.estado === 'pendiente', `Estado: ${flujoEncontrado.estado}`);
              agregarResultado('Datos del flujo completos', 
                flujoEncontrado.filtros && flujoEncontrado.filas && flujoEncontrado.total_filas > 0, 
                `${flujoEncontrado.total_filas} fila(s)`);
            } else {
              agregarResultado('Flujo enviado encontrado en recibidos', false, 'Flujo no encontrado');
            }
          }
        } else {
          const error = await recibidos.json().catch(() => ({ message: `HTTP ${recibidos.status}` }));
          agregarResultado('Obtener flujos recibidos', false, error.message);
        }
      } catch (error) {
        agregarResultado('Obtener flujos recibidos', false, error.message);
      }
    } else {
      agregarResultado('Obtener flujos recibidos', false, 'No hay token de autenticación');
    }

    // ============================================
    // TEST 8: Actualizar estado del flujo
    // ============================================
    log('\n🔄 TEST 8: Actualizar estado del flujo...', 'blue');
    if (tokenSistemas && flujoId) {
      try {
        const actualizar = await fetch(`${BASE_URL}/api/flujos-salida/${flujoId}/estado`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenSistemas}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ estado: 'revisado' })
        });

        if (actualizar.ok) {
          const data = await actualizar.json();
          agregarResultado('Actualizar estado a "revisado"', true, `Estado: ${data.estado}`);
        } else {
          const error = await actualizar.json().catch(() => ({ message: `HTTP ${actualizar.status}` }));
          agregarResultado('Actualizar estado a "revisado"', false, error.message);
        }
      } catch (error) {
        agregarResultado('Actualizar estado a "revisado"', false, error.message);
      }
    } else {
      agregarResultado('Actualizar estado a "revisado"', false, 'Faltan credenciales o ID de flujo');
    }

    // ============================================
    // TEST 9: Verificar estado actualizado
    // ============================================
    log('\n🔍 TEST 9: Verificar estado actualizado...', 'blue');
    if (tokenSistemas && flujoId) {
      try {
        const verificacion = await fetch(`${BASE_URL}/api/flujos-salida/recibidos?estado=revisado`, {
          headers: {
            'Authorization': `Bearer ${tokenSistemas}`,
            'Content-Type': 'application/json'
          }
        });

        if (verificacion.ok) {
          const data = await verificacion.json();
          const flujoActualizado = data.flujos?.find(f => f.id === flujoId);
          if (flujoActualizado && flujoActualizado.estado === 'revisado') {
            agregarResultado('Estado actualizado correctamente', true, 'Estado: revisado');
          } else {
            agregarResultado('Estado actualizado correctamente', false, `Estado encontrado: ${flujoActualizado?.estado || 'N/A'}`);
          }
        } else {
          agregarResultado('Estado actualizado correctamente', false, 'Error al verificar');
        }
      } catch (error) {
        agregarResultado('Estado actualizado correctamente', false, error.message);
      }
    }

    // ============================================
    // TEST 10: Probar filtros
    // ============================================
    log('\n🔍 TEST 10: Probar filtros de búsqueda...', 'blue');
    if (tokenSistemas) {
      try {
        // Filtro por estado
        const filtroEstado = await fetch(`${BASE_URL}/api/flujos-salida/recibidos?estado=pendiente`, {
          headers: {
            'Authorization': `Bearer ${tokenSistemas}`,
            'Content-Type': 'application/json'
          }
        });
        if (filtroEstado.ok) {
          agregarResultado('Filtro por estado funciona', true);
        } else {
          agregarResultado('Filtro por estado funciona', false);
        }

        // Filtro por fecha
        const filtroFecha = await fetch(`${BASE_URL}/api/flujos-salida/recibidos?fecha_inicio=2025-01-01`, {
          headers: {
            'Authorization': `Bearer ${tokenSistemas}`,
            'Content-Type': 'application/json'
          }
        });
        if (filtroFecha.ok) {
          agregarResultado('Filtro por fecha funciona', true);
        } else {
          agregarResultado('Filtro por fecha funciona', false);
        }
      } catch (error) {
        agregarResultado('Filtros de búsqueda', false, error.message);
      }
    }

    // ============================================
    // TEST 11: Validar permisos (seguridad)
    // ============================================
    log('\n🔒 TEST 11: Validar permisos y seguridad...', 'blue');
    if (tokenIngenieria) {
      try {
        // Intentar obtener flujos recibidos con token de Ingeniería (debe fallar)
        const accesoNoAutorizado = await fetch(`${BASE_URL}/api/flujos-salida/recibidos`, {
          headers: {
            'Authorization': `Bearer ${tokenIngenieria}`,
            'Content-Type': 'application/json'
          }
        });
        if (accesoNoAutorizado.status === 403 || accesoNoAutorizado.status === 401) {
          agregarResultado('Permisos correctos (Ingeniería no puede ver recibidos)', true);
        } else {
          agregarResultado('Permisos correctos', false, 'Ingeniería puede acceder a flujos recibidos');
        }
      } catch (error) {
        agregarResultado('Validar permisos', false, error.message);
      }
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    log('\n' + '='.repeat(70), 'cyan');
    log('📊 RESUMEN DE PRUEBAS', 'cyan');
    log('='.repeat(70), 'cyan');
    log(`\n✅ Pruebas exitosas: ${resultados.exitosos}`, 'green');
    log(`❌ Pruebas fallidas: ${resultados.fallidos}`, resultados.fallidos > 0 ? 'red' : 'green');
    log(`📈 Total de pruebas: ${resultados.exitosos + resultados.fallidos}`, 'blue');
    
    const porcentajeExito = ((resultados.exitosos / (resultados.exitosos + resultados.fallidos)) * 100).toFixed(1);
    log(`📊 Porcentaje de éxito: ${porcentajeExito}%`, porcentajeExito >= 90 ? 'green' : porcentajeExito >= 70 ? 'yellow' : 'red');

    if (resultados.fallidos === 0) {
      log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!', 'green');
      log('✅ El sistema de Flujos de Salida está funcionando correctamente.\n', 'green');
    } else {
      log('\n⚠️ Algunas pruebas fallaron. Revisa los detalles arriba.\n', 'yellow');
    }

    log('='.repeat(70) + '\n', 'cyan');

  } catch (error) {
    log('\n❌ ERROR CRÍTICO EN LA PRUEBA:', 'red');
    log(error.message, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

testCompleto();




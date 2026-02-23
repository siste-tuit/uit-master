/**
 * Prueba de estrés básica para la API del ERP UIT-Master
 * Uso: node stress-test.js [BASE_URL]
 * Ejemplo local: node stress-test.js http://localhost:5000
 * Ejemplo nube: node stress-test.js https://uit-backend.onrender.com
 */
const BASE_URL = process.argv[2] || 'http://localhost:5000';
const TOTAL_REQUESTS = 100;
const CONCURRENT = 20;
const LOGIN_EMAIL = 'admin@textil.com';
const LOGIN_PASSWORD = 'Adm226....';

async function request(url, options = {}) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const body = await res.text();
    const duration = Date.now() - start;
    return { ok: res.ok, status: res.status, duration, body: body?.slice(0, 80) };
  } catch (err) {
    return { ok: false, status: 0, duration: Date.now() - start, error: err.message };
  }
}

async function runConcurrent(tasks, concurrency) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      if (i >= tasks.length) break;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array(Math.min(concurrency, tasks.length)).fill(null).map(() => worker());
  await Promise.all(workers);
  return results;
}

function stats(results, label) {
  const ok = results.filter((r) => r?.ok).length;
  const times = results.map((r) => r?.duration ?? 0).filter((t) => t >= 0);
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = times.length ? Math.round(sum / times.length) : 0;
  const min = times.length ? Math.min(...times) : 0;
  const max = times.length ? Math.max(...times) : 0;
  console.log(`\n--- ${label} ---`);
  console.log(`  OK: ${ok}/${results.length} (${((ok / results.length) * 100).toFixed(1)}%)`);
  console.log(`  Tiempo (ms): avg=${avg} min=${min} max=${max}`);
  return { ok, total: results.length, avg, min, max };
}

async function main() {
  console.log(`\n🧪 Prueba de estrés - ${BASE_URL}`);
  console.log(`   Peticiones totales: ${TOTAL_REQUESTS}, concurrencia: ${CONCURRENT}\n`);

  // 1. Health (sin BD)
  const healthTasks = Array(TOTAL_REQUESTS).fill(null).map(() => () => request(`${BASE_URL}/health`));
  const healthResults = await runConcurrent(healthTasks, CONCURRENT);
  stats(healthResults, 'GET /health');

  // 2. Login (con BD y auth)
  const loginTasks = Array(Math.min(50, TOTAL_REQUESTS)).fill(null).map(() =>
    () => request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
    })
  );
  const loginResults = await runConcurrent(loginTasks, CONCURRENT);
  const loginStats = stats(loginResults, 'POST /api/auth/login');

  // Resumen
  console.log('\n--- Resumen ---');
  const healthOk = healthResults.filter((r) => r?.ok).length;
  if (healthOk === healthResults.length && loginStats.ok === loginResults.length) {
    console.log('  ✅ Todas las peticiones exitosas.');
  } else {
    console.log(`  ⚠️ Health: ${healthOk}/${healthResults.length} OK`);
    console.log(`  ⚠️ Login: ${loginStats.ok}/${loginResults.length} OK`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

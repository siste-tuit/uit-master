import dotenv from "dotenv";
dotenv.config();

// URL de la API: pasar como primer argumento o variable TEST_API_URL (ej: node test-login-all-users.js https://uit-master.onrender.com/api)
const BASE_URL = process.argv[2] || process.env.TEST_API_URL || "http://localhost:5000/api";

const USERS = [
  { email: "admin@textil.com", password: "Adm226....", rolEsperado: "administrador" },
  { email: "contabilidad@textil.com", password: "Ctd620...", rolEsperado: "contabilidad" },
  { email: "gerencia@textil.com", password: "geR202...", rolEsperado: "gerencia" },
  { email: "sistemas@textil.com", password: "siS2026...", rolEsperado: "sistemas" },
  { email: "ingenieria@textil.com", password: "inG226...", rolEsperado: "ingenieria" },
  { email: "mantenimiento@textil.com", password: "MAT266...", rolEsperado: "mantenimiento" },

  // Usuarios de producción (rol usuarios) - contraseñas individuales
  { email: "hover.rojas@textil.com", password: "Hov226...", rolEsperado: "usuarios" },
  { email: "maycol@textil.com", password: "Myc226...", rolEsperado: "usuarios" },
  { email: "alicia@textil.com", password: "Alc226...", rolEsperado: "usuarios" },
  { email: "elena@textil.com", password: "Ele226...", rolEsperado: "usuarios" },
  { email: "rosa@textil.com", password: "Ros226...", rolEsperado: "usuarios" },
  { email: "alfredo@textil.com", password: "Alf226...", rolEsperado: "usuarios" },
  { email: "eduardo@textil.com", password: "Edu226...", rolEsperado: "usuarios" },
  { email: "juana@textil.com", password: "Jun226...", rolEsperado: "usuarios" },
  { email: "alisson@textil.com", password: "Als226...", rolEsperado: "usuarios" },
  { email: "usuario@textil.com", password: "demo123", rolEsperado: "usuarios" },
];

async function testLogin(user) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        email: user.email,
        ok: false,
        status: res.status,
        error: body.message || "Error desconocido",
      };
    }

    const data = await res.json();
    const role = (data?.user?.role || "").toLowerCase().trim();
    const rolOk = !user.rolEsperado || role === (user.rolEsperado || "").toLowerCase().trim();
    return {
      email: user.email,
      ok: true,
      role,
      dashboard: data?.dashboardPath ?? data?.user?.dashboardPath ?? null,
      rolEsperado: user.rolEsperado,
      rolCorrecto: rolOk,
    };
  } catch (err) {
    return {
      email: user.email,
      ok: false,
      status: 0,
      error: err.message,
    };
  }
}

async function main() {
  console.log("🔍 Probando login para todos los usuarios...\n");

  const results = [];
  for (const user of USERS) {
    const r = await testLogin(user);
    results.push({ ...user, ...r });
  }

  console.log(`Base URL: ${BASE_URL}\n`);

  for (const r of results) {
    if (r.ok) {
      const rolCheck = r.rolCorrecto === false ? " ⚠️ rol esperado: " + r.rolEsperado : "";
      console.log(`✅ ${r.email} → OK (rol: ${r.role || "?"})${rolCheck}`);
    } else {
      console.log(`❌ ${r.email} → FALLÓ (status: ${r.status}, error: ${r.error})`);
    }
  }

  const ok = results.filter((r) => r.ok);
  const fallidos = results.filter((r) => !r.ok);
  const rolIncorrecto = results.filter((r) => r.ok && r.rolCorrecto === false);

  console.log("\n--- Resumen ---");
  console.log(`   Login OK: ${ok.length}/${results.length}`);
  console.log(`   Login fallido: ${fallidos.length}`);
  if (rolIncorrecto.length > 0) console.log(`   Rol no coincide: ${rolIncorrecto.length}`);

  if (fallidos.length > 0) {
    console.log("\nErrores de login:");
    fallidos.forEach((f) => console.log(`   - ${f.email}: ${f.error}`));
  }
}

main().catch((e) => {
  console.error("Error inesperado en test-login-all-users:", e);
  process.exit(1);
});


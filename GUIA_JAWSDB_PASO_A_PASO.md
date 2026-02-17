# 🗄️ GUÍA COMPLETA - CREAR MYSQL EN JAWSDB

## 📋 PASO A PASO DETALLADO

---

## 🔐 PASO 1: CREAR CUENTA EN JAWSDB

1. **Ir a:** https://www.jawsdb.com
2. **Click en:** "Sign Up" o "Get Started" (arriba a la derecha)
3. **Completar formulario:**
   - Email: (tu email)
   - Password: (crea una contraseña segura)
   - Confirmar contraseña
4. **Click en:** "Sign Up" o "Create Account"
5. **Verificar email** (si te piden verificación)

---

## 🗄️ PASO 2: CREAR BASE DE DATOS MYSQL

1. **Después de iniciar sesión**, verás el Dashboard
2. **Click en:** "Create Database" o "New Database" (botón verde/azul)
3. **Configuración:**
   - **Database Name:** `uit` (o el nombre que prefieras)
   - **Plan:** Seleccionar **"Tiny"** ($5/mes)
   - **Region:** Seleccionar la más cercana (US East, US West, etc.)
4. **Click en:** "Create Database" o "Submit"

---

## 📋 PASO 3: COPIAR CREDENCIALES

Después de crear la DB, JawsDB te mostrará las credenciales. **COPIA ESTAS 4 COSAS:**

1. **Host** (algo como: `xxxxx.mysql.jawsdb.com`)
2. **Port** (generalmente: `3306`)
3. **Username** (tu usuario)
4. **Password** (tu contraseña)
5. **Database Name** (el nombre que pusiste, ej: `uit`)

⚠️ **IMPORTANTE:** Guarda estas credenciales en un lugar seguro. Las necesitarás ahora.

---

## ⚙️ PASO 4: AGREGAR VARIABLES EN RENDER

1. **Ir a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend` (tu servicio)
3. **Click en:** "Environment" (en el menú lateral izquierdo)
4. **O click en:** "Settings" → "Environment Variables"
5. **Click en:** "+ Add Environment Variable" (para cada una)

### **Agregar estas 4 variables:**

**Variable 1:**
- **Key:** `DB_HOST`
- **Value:** (pega el Host de JawsDB, ej: `xxxxx.mysql.jawsdb.com`)

**Variable 2:**
- **Key:** `DB_USER`
- **Value:** (pega el Username de JawsDB)

**Variable 3:**
- **Key:** `DB_PASS`
- **Value:** (pega el Password de JawsDB)

**Variable 4 (verificar):**
- **Key:** `DB_NAME`
- **Value:** `uit` (o el nombre que pusiste en JawsDB)

6. **Después de agregar cada variable, Render redeployeará automáticamente**

---

## ⏳ PASO 5: ESPERAR REDEPLOY

1. Render detectará los cambios automáticamente
2. Verás "Redeploying..." en el dashboard
3. Espera 2-3 minutos
4. El servicio volverá a estar "Live"

---

## ✅ PASO 6: VERIFICAR CONEXIÓN

Después del redeploy, el backend debería conectarse a MySQL automáticamente.

---

## 📊 PASO 7: EJECUTAR MIGRACIONES (PRÓXIMO)

Una vez que el backend esté conectado, ejecutaremos las migraciones para crear las tablas.

---

## 🎯 RESUMEN RÁPIDO

1. ✅ Crear cuenta en JawsDB
2. ✅ Crear base de datos MySQL (Plan Tiny, $5/mes)
3. ✅ Copiar credenciales (Host, Username, Password, Database Name)
4. ✅ Ir a Render → uit-backend → Environment Variables
5. ✅ Agregar: `DB_HOST`, `DB_USER`, `DB_PASS`, verificar `DB_NAME`
6. ✅ Esperar redeploy automático
7. ✅ Verificar que funcione

---

**¿Ya estás en JawsDB?** Dime en qué paso estás y te guío específicamente.

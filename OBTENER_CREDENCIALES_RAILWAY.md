# 📋 OBTENER CREDENCIALES DE RAILWAY MYSQL

## ✅ MYSQL ESTÁ CREADA Y VACÍA (ES NORMAL)

Veo que dice "You have no tables" - **esto es perfecto**. Es una base de datos nueva y vacía, como debe ser.

---

## 🎯 PASO 1: OBTENER CREDENCIALES

### **OPCIÓN A: Pestaña "Credentials"**

1. **En la parte superior**, verás varias pestañas:
   - "Deployments"
   - "Database" (actual)
   - "Backups"
   - **"Variables"** ← **CLICK AQUÍ**
   - "Metrics"
   - "Settings"

2. **Click en:** "Variables" (o "Credentials" si está disponible)

---

### **OPCIÓN B: Botón "Connect"**

1. **En la esquina superior derecha**, hay un botón **"Connect"** (con un icono de enchufe)
2. **Click en:** "Connect"
3. **Railway mostrará** las credenciales de conexión

---

## 📋 PASO 2: COPIAR CREDENCIALES

Railway mostrará variables como:

- `MYSQLHOST` (o `MYSQL_HOST`) ← **Host**
- `MYSQLUSER` (o `MYSQL_USER`) ← **Usuario**
- `MYSQLPASSWORD` (o `MYSQL_PASSWORD`) ← **Contraseña**
- `MYSQLDATABASE` (o `MYSQL_DATABASE`) ← **Nombre de BD**
- `MYSQLPORT` (o `MYSQL_PORT`) ← **Puerto** (generalmente 3306)

**COPIA estas 5 credenciales** (las necesitarás para Render)

---

## ⚙️ PASO 3: AGREGAR EN RENDER

Después de copiar las credenciales:

1. **Ir a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend` (tu servicio)
3. **Click en:** "Environment" (menú lateral izquierdo)
4. **O:** "Settings" → "Environment Variables"
5. **Click en:** "+ Add Environment Variable"

### **Agregar estas variables:**

**Variable 1:**
- **Key:** `DB_HOST`
- **Value:** (pega el `MYSQLHOST` de Railway)

**Variable 2:**
- **Key:** `DB_USER`
- **Value:** (pega el `MYSQLUSER` de Railway)

**Variable 3:**
- **Key:** `DB_PASS`
- **Value:** (pega el `MYSQLPASSWORD` de Railway)

**Variable 4:**
- **Key:** `DB_NAME`
- **Value:** (pega el `MYSQLDATABASE` de Railway, o usa `uit`)

**Variable 5 (si es necesario):**
- **Key:** `DB_PORT`
- **Value:** (pega el `MYSQLPORT` de Railway, generalmente `3306`)

6. **Después de agregar, Render redeployeará automáticamente**

---

## ⏳ PASO 4: ESPERAR REDEPLOY

1. Render detectará los cambios
2. Verás "Redeploying..." en el dashboard
3. Espera 2-3 minutos
4. El servicio volverá a estar "Live"

---

## 📊 PASO 5: EJECUTAR MIGRACIONES (DESPUÉS)

Una vez que el backend esté conectado a MySQL, ejecutaremos las migraciones para crear todas las tablas.

---

## ✅ RESUMEN RÁPIDO

1. ✅ Click en **"Variables"** o **"Connect"** en Railway
2. ✅ Copiar las 5 credenciales
3. ✅ Ir a Render → uit-backend → Environment Variables
4. ✅ Agregar: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`
5. ✅ Esperar redeploy automático

---

**¿Ya estás en la pestaña "Variables" o "Credentials"?** Copia las credenciales y luego las agregamos en Render.

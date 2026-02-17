# 🚂 GUÍA COMPLETA - CREAR MYSQL EN RAILWAY

## ✅ RAILWAY ES EXCELENTE OPCIÓN

**Ventajas:**
- ✅ **Más económico** que PlanetScale Scaler
- ✅ **Muy fácil de usar**
- ✅ **MySQL completo**
- ✅ **Muy confiable**
- ✅ **Precio basado en uso** (solo pagas lo que usas)

---

## 🔐 PASO 1: CREAR CUENTA EN RAILWAY

1. **Ir a:** https://railway.app
2. **Click en:** "Start a New Project" o "Login" (arriba a la derecha)
3. **O ir directamente a:** https://railway.app/login
4. **Registrarse con:**
   - **GitHub** (recomendado - más fácil)
   - **Email** (tradicional)

**Recomendado:** Usar GitHub (solo un click)

---

## 🚂 PASO 2: CREAR PROYECTO

1. Después de iniciar sesión, verás el Dashboard
2. **Click en:** "New Project" o "+ New Project"
3. **Selecciona:** "Empty Project" o "Blank Project"
4. **Nombre del proyecto:** `uit-database` (o el nombre que prefieras)

---

## 🗄️ PASO 3: AGREGAR MYSQL DATABASE

1. **En tu proyecto, click en:** "+ New" o "+ Add Service"
2. **Selecciona:** "Database" o "MySQL"
3. **O busca en el marketplace:** "MySQL"

Railway te mostrará opciones de bases de datos.

---

## ⚙️ PASO 4: CONFIGURAR MYSQL

1. **Selecciona:** "MySQL" (debería aparecer en las opciones)
2. **Railway creará automáticamente:**
   - Base de datos MySQL
   - Credenciales automáticas
   - Conexión lista

3. **Espera 1-2 minutos** mientras Railway crea la base de datos

---

## 📋 PASO 5: OBTENER CREDENCIALES

1. **Click en tu servicio MySQL** (aparecerá en el proyecto)
2. **Click en la pestaña:** "Variables" o "Connect"
3. **Railway mostrará las variables de entorno:**
   - `MYSQLHOST` (o `MYSQL_HOST`)
   - `MYSQLUSER` (o `MYSQL_USER`)
   - `MYSQLPASSWORD` (o `MYSQL_PASSWORD`)
   - `MYSQLDATABASE` (o `MYSQL_DATABASE`)
   - `MYSQLPORT` (o `MYSQL_PORT`)

4. **COPIA estas credenciales** (las necesitarás para Render)

---

## 🔄 PASO 6: AGREGAR VARIABLES EN RENDER

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

## ⏳ PASO 7: ESPERAR REDEPLOY

1. Render detectará los cambios
2. Verás "Redeploying..." en el dashboard
3. Espera 2-3 minutos
4. El servicio volverá a estar "Live"

---

## 💰 PRECIO DE RAILWAY

**Railway usa precios basados en uso:**
- ✅ **$5 crédito gratis** al registrarte
- ✅ **Pago por uso** (solo pagas lo que usas)
- ✅ **MySQL pequeño:** ~$5-10/mes aproximadamente
- ✅ **Puedes poner límites de gasto** (muy importante)

**Configurar límite de gasto:**
1. En Railway Dashboard
2. Click en tu perfil → "Settings" → "Billing"
3. Configurar "Spending Limit" (ej: $10/mes)

---

## ✅ VERIFICAR CONEXIÓN

Después del redeploy, el backend debería conectarse a MySQL automáticamente.

---

## 📊 RESUMEN RÁPIDO

1. ✅ Crear cuenta en Railway (con GitHub o Email)
2. ✅ Crear proyecto nuevo
3. ✅ Agregar MySQL Database
4. ✅ Copiar credenciales (Variables)
5. ✅ Ir a Render → uit-backend → Environment Variables
6. ✅ Agregar: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`
7. ✅ Esperar redeploy automático
8. ✅ Configurar límite de gasto en Railway

---

## 🎯 COSTO TOTAL ESTIMADO

- Backend (Render): $7/mes
- Frontend (Render): $0/mes
- MySQL (Railway): ~$5-10/mes
- **TOTAL: ~$12-17/mes** ✅

---

**¿Ya estás en Railway?** Dime en qué paso estás y te guío específicamente.

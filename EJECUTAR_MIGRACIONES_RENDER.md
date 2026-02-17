# 🚀 EJECUTAR MIGRACIONES EN RENDER

## ✅ VARIABLES CONFIGURADAS CORRECTAMENTE

Todas las variables están guardadas:
- ✅ `DB_HOST` = `metro.proxy.rlwy.net`
- ✅ `DB_USER` = `root`
- ✅ `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
- ✅ `DB_NAME` = `railway`
- ✅ `DB_PORT` = `25047`
- ✅ `JWT_SECRET` = (configurado)
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `5000`

---

## 🔄 PASO 1: VERIFICAR REDEPLOY

1. **En Render Dashboard**, ve a `uit-backend`
2. **Busca el estado del servicio:**
   - ¿Dice **"Redeploying..."** o **"Live"**?
   - Si dice **"Redeploying..."**, espera 2-3 minutos
   - Si dice **"Live"**, el redeploy ya terminó

---

## 📊 PASO 2: VERIFICAR LOGS

1. **Click en:** "Logs" (menú lateral izquierdo)
2. **Busca mensajes como:**
   - ✅ `Server running on port 5000`
   - ✅ `Connected to MySQL`
   - ❌ Si ves errores de conexión, avísame

---

## 🗄️ PASO 3: EJECUTAR MIGRACIONES

Una vez que el backend esté **"Live"**, necesitamos crear las tablas en MySQL.

### **Opción A: Ejecutar desde Render Shell (RECOMENDADO)**

1. **En Render Dashboard**, ve a `uit-backend`
2. **Click en:** "Shell" (menú lateral izquierdo)
3. **Se abrirá una terminal en el navegador**
4. **Ejecuta este comando:**
   ```bash
   npm run migrate:all
   ```
5. **Espera a que termine** (puede tardar 1-2 minutos)
6. **Deberías ver mensajes como:**
   - ✅ `Creating table usuarios...`
   - ✅ `Creating table proyectos...`
   - ✅ `Migrations completed successfully`

---

### **Opción B: Ejecutar desde tu computadora (ALTERNATIVA)**

Si el Shell de Render no funciona, podemos ejecutar las migraciones desde tu máquina local conectándonos directamente a Railway MySQL.

---

## ✅ PASO 4: VERIFICAR TABLAS CREADAS

Después de ejecutar las migraciones:

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL → "Database" → "Data"
3. **Deberías ver tablas como:**
   - `usuarios`
   - `proyectos`
   - `produccion`
   - `inventario`
   - etc.

---

## 🎯 RESUMEN

1. ✅ Verificar que el servicio esté **"Live"** en Render
2. ✅ Revisar los logs para confirmar conexión a MySQL
3. ✅ Ejecutar `npm run migrate:all` desde Render Shell
4. ✅ Verificar que las tablas se crearon en Railway

---

## 🚨 SI HAY ERRORES

Si ves errores en los logs o al ejecutar migraciones:
- **Copia el mensaje de error completo**
- **Avísame y lo solucionamos**

---

**¿Ya está el servicio "Live" en Render? Ve a "Logs" y luego a "Shell" para ejecutar las migraciones.**

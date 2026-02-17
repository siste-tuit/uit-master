# 🚀 EJECUTAR MIGRACIONES AHORA

## ✅ VARIABLES VERIFICADAS

Todas las variables están correctas en Render:
- ✅ `DB_HOST` = `metro.proxy.rlwy.net`
- ✅ `DB_PORT` = `25047`
- ✅ `DB_USER` = `root`
- ✅ `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
- ✅ `DB_NAME` = `railway`

---

## ⏳ PASO 1: VERIFICAR REDEPLOY

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend`
3. **Verifica el estado:**
   - Si dice **"Redeploying..."** o **"Deploying..."** → **Espera 2-3 minutos**
   - Si dice **"Live"** → **Ya está listo, continúa al Paso 2**

---

## 🗄️ PASO 2: EJECUTAR MIGRACIONES

Una vez que el servicio esté **"Live"**:

1. **En Render Dashboard**, ve a `uit-backend`
2. **Click en:** **"Shell"** (menú lateral izquierdo)
3. **Espera a que la terminal se abra** (puede tardar unos segundos)
4. **Ejecuta este comando:**
   ```bash
   npm run migrate:all
   ```
5. **Presiona Enter** y espera 1-2 minutos

---

## ✅ PASO 3: VERIFICAR RESULTADO

Deberías ver mensajes como:

```
🚀 Iniciando ejecución de TODAS las migraciones...

📦 Ejecutando migraciones CORE...
✅ Migraciones CORE completadas

🏭 Ejecutando migraciones de PRODUCCIÓN...
✅ Migraciones PRODUCCIÓN completadas

📦 Ejecutando migraciones de INVENTARIO...
✅ Migraciones INVENTARIO completadas

📊 Ejecutando migraciones de REPORTES PRODUCCIÓN...
✅ Migraciones REPORTES PRODUCCIÓN completadas

💰 Ejecutando migraciones de CONTABILIDAD...
✅ Migraciones CONTABILIDAD completadas

⏰ Ejecutando migraciones de ASISTENCIA...
✅ Migraciones ASISTENCIA completadas

📥 Ejecutando migraciones de FLUJOS SALIDA...
✅ Migraciones FLUJOS SALIDA completadas

🎉 ¡TODAS las migraciones ejecutadas exitosamente!
✅ El sistema está listo para producción.
```

---

## 🗄️ PASO 4: VERIFICAR TABLAS EN RAILWAY

Después de ejecutar las migraciones:

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL (tu servicio)
3. **Click en:** "Database" → "Data"
4. **Deberías ver tablas como:**
   - `roles`
   - `usuarios`
   - `productos`
   - `inventario`
   - `lineas_produccion`
   - `trabajadores`
   - `asistencia`
   - `flujos_salida`
   - etc.

---

## 🚨 SI HAY ERRORES

Si ves errores:

1. **Copia el mensaje de error completo**
2. **Avísame** y lo solucionamos

**Errores comunes:**
- ❌ `Error: Access denied` → Problema con credenciales
- ❌ `Error: Can't connect to MySQL` → Problema de red
- ❌ `Error: Table already exists` → Las tablas ya existen (no es grave)

---

## ✅ RESUMEN

1. ✅ Verificar que el servicio esté **"Live"** en Render
2. ✅ Ir a **Shell** en Render
3. ✅ Ejecutar: `npm run migrate:all`
4. ✅ Esperar mensajes de éxito
5. ✅ Verificar tablas en Railway

---

**¿Ya está el servicio "Live" en Render? Ve a Shell y ejecuta `npm run migrate:all`.**

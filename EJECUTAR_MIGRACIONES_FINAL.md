# 🗄️ EJECUTAR MIGRACIONES - PASO FINAL

## ✅ SERVICIO "LIVE" EN RENDER

El servicio está funcionando correctamente:
- ✅ `Server running on http://localhost:5000`
- ✅ `==> Your service is live 🚀`
- ✅ URL: `https://uit-backend.onrender.com`

---

## 🚀 EJECUTAR MIGRACIONES AHORA

### **Paso 1: Abrir Render Shell**

1. **En Render Dashboard**, ve a `uit-backend`
2. **Click en:** **"Shell"** (menú lateral izquierdo)
3. **Espera a que la terminal se abra** (puede tardar unos segundos)

---

### **Paso 2: Ejecutar Migraciones**

Una vez que la terminal esté lista, ejecuta:

```bash
npm run migrate:all
```

**Presiona Enter** y espera 1-2 minutos.

---

### **Paso 3: Verificar Resultado**

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
- ❌ `Error: Table already exists` → Las tablas ya existen (no es grave, significa que ya se crearon)

---

## ✅ RESUMEN

1. ✅ Servicio "Live" en Render
2. ⏳ Ir a **Shell** en Render
3. ⏳ Ejecutar: `npm run migrate:all`
4. ⏳ Esperar mensajes de éxito
5. ⏳ Verificar tablas en Railway

---

**¿Ya estás en Render Shell? Ejecuta `npm run migrate:all` y avísame qué sale.**

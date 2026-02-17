# 🗄️ EJECUTAR MIGRACIONES EN RENDER - PASO A PASO

## ✅ TODO ESTÁ LISTO

- ✅ Backend desplegado y "Live"
- ✅ Variables de entorno configuradas
- ✅ MySQL en Railway funcionando
- ⏳ **Falta:** Crear las tablas en MySQL

---

## 🚀 PASO 1: ABRIR RENDER SHELL

1. **En Render Dashboard**, ve a `uit-backend`
2. **En el menú lateral izquierdo**, busca **"Shell"**
3. **Click en:** "Shell"
4. **Se abrirá una terminal en el navegador** (puede tardar unos segundos)

---

## 📋 PASO 2: EJECUTAR MIGRACIONES

Una vez que la terminal esté lista, ejecuta:

```bash
npm run migrate:all
```

**Presiona Enter** y espera 1-2 minutos.

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

## 🔄 ALTERNATIVA: Si `migrate:all` no funciona

Si ves errores, prueba con:

```bash
npm run migrate
```

Este comando ejecuta el script de migración principal que crea las tablas core.

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
   - etc.

---

## 🚨 SI HAY ERRORES

Si ves errores al ejecutar las migraciones:

1. **Copia el mensaje de error completo**
2. **Avísame** y lo solucionamos

**Errores comunes:**
- ❌ `Error: Access denied` → Problema con credenciales
- ❌ `Error: Can't connect to MySQL` → Problema de red
- ❌ `Error: Table already exists` → Las tablas ya existen (no es un error grave)

---

## ✅ RESUMEN

1. ✅ Ir a Render → `uit-backend` → **Shell**
2. ✅ Ejecutar: `npm run migrate:all`
3. ✅ Esperar mensajes de éxito
4. ✅ Verificar tablas en Railway

---

**¿Ya estás en Render Shell? Ejecuta `npm run migrate:all` y avísame qué sale.**

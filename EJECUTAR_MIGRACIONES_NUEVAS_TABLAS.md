# 🔧 EJECUTAR MIGRACIONES PARA TABLAS FALTANTES

## ❌ PROBLEMA IDENTIFICADO

Los errores 500 ocurren porque faltan estas tablas en la base de datos:
- ❌ `registros_produccion` (necesaria para métricas de producción)
- ❌ `linea_usuario` (necesaria para asignar usuarios a líneas)
- ❌ `items_inventario` (necesaria para inventario por departamentos)

---

## ✅ SOLUCIÓN APLICADA

He actualizado `runAllMigrations.js` para incluir estas tablas. Ahora necesitas ejecutar las migraciones nuevamente.

---

## 🚀 EJECUTAR MIGRACIONES

### **Paso 1: Ir a Render Shell**

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend`
3. **Click en:** **"Shell"** (menú lateral izquierdo)

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

🎉 ¡TODAS las migraciones ejecutadas exitosamente!
```

---

## 🗄️ VERIFICAR TABLAS EN RAILWAY

Después de ejecutar las migraciones:

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL → "Database" → "Data"
3. **Deberías ver las nuevas tablas:**
   - ✅ `registros_produccion`
   - ✅ `linea_usuario`
   - ✅ `items_inventario`

---

## 🧪 PROBAR NUEVAMENTE

1. **Abre:** `https://uit-frontend.onrender.com`
2. **Inicia sesión** con: `admin@textil.com` / `demo123`
3. **Ve al dashboard**
4. **Los errores 500 deberían desaparecer**

---

## 📋 RESUMEN

1. ✅ Código actualizado (tablas agregadas a migraciones)
2. ⏳ Ir a Render → `uit-backend` → **Shell**
3. ⏳ Ejecutar: `npm run migrate:all`
4. ⏳ Esperar mensajes de éxito
5. ⏳ Verificar tablas en Railway
6. ⏳ Probar el sistema nuevamente

---

**¿Ya estás en Render Shell? Ejecuta `npm run migrate:all` para crear las tablas faltantes.**

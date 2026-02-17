# 👥 CREAR USUARIOS INICIALES - PASO FINAL

## ✅ TABLAS VERIFICADAS

Veo que todas las tablas están creadas correctamente en Railway:
- ✅ `roles`
- ✅ `usuarios`
- ✅ `productos`
- ✅ `inventario`
- ✅ `lineas_produccion`
- ✅ `trabajadores`
- ✅ `asistencia`
- ✅ `flujos_salida`
- ✅ Y todas las demás...

---

## 🚀 EJECUTAR SEEDERS AHORA

Ahora necesitas crear los usuarios iniciales y datos de prueba.

### **Paso 1: Ir a Render Shell**

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend`
3. **Click en:** **"Shell"** (menú lateral izquierdo)
4. **Espera a que la terminal se abra**

---

### **Paso 2: Ejecutar Seeders**

Una vez que la terminal esté lista, ejecuta:

```bash
npm run seed:all
```

**Presiona Enter** y espera 30-60 segundos.

---

### **Paso 3: Verificar Resultado**

Deberías ver mensajes como:

```
🌱 Iniciando ejecución de TODOS los seeders...

📋 Ejecutando seeders de ROLES...
✅ Seeders ROLES completados

🏢 Ejecutando seeders de DEPARTAMENTOS...
✅ Seeders DEPARTAMENTOS completados

⚙️ Ejecutando seeders de CONFIGURACIÓN...
✅ Seeders CONFIGURACIÓN completados

👥 Ejecutando seeders de USUARIOS...
✅ Seeders USUARIOS completados

🏭 Ejecutando seeders de PRODUCCIÓN...
✅ Seeders PRODUCCIÓN completados

📦 Ejecutando seeders de INVENTARIO...
✅ Seeders INVENTARIO completados

🎉 ¡TODOS los seeders ejecutados exitosamente!
✅ El sistema está listo con datos iniciales.
```

---

## 👤 USUARIOS QUE SE CREARÁN

Después de ejecutar los seeders, tendrás estos usuarios (todos con contraseña: `demo123`):

| Email | Rol | Departamento |
|-------|-----|--------------|
| `admin@textil.com` | Administrador | Administración |
| `contabilidad@textil.com` | Contabilidad | Contabilidad |
| `gerencia@textil.com` | Gerencia | Gerencia |
| `sistemas@textil.com` | Sistemas | Sistemas |
| `ingenieria@textil.com` | Ingeniería | Ingeniería |
| `mantenimiento@textil.com` | Mantenimiento | Mantenimiento |
| `usuario@textil.com` | Usuarios | Producción |

**Contraseña para todos:** `demo123`

---

## ✅ VERIFICAR EN RAILWAY

Después de ejecutar los seeders:

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL → "Database" → "Data"
3. **Click en:** tabla `usuarios`
4. **Deberías ver los 7 usuarios creados**

También puedes verificar:
- Tabla `roles` → 8 roles
- Tabla `lineas_produccion` → 13 líneas
- Tabla `departamentos` → 7 departamentos

---

## 🚨 SI HAY ERRORES

Si ves errores:

1. **Copia el mensaje de error completo**
2. **Avísame** y lo solucionamos

**Errores comunes:**
- ❌ `Error: No se encontró el rol` → Los roles no se crearon (pero ya deberían estar)
- ❌ `Error: Table doesn't exist` → Las tablas no existen (pero ya están creadas)

---

## ✅ RESUMEN

1. ✅ Tablas verificadas en Railway
2. ⏳ Ir a Render → `uit-backend` → **Shell**
3. ⏳ Ejecutar: `npm run seed:all`
4. ⏳ Esperar mensajes de éxito
5. ⏳ Verificar usuarios en Railway

---

**¿Ya estás en Render Shell? Ejecuta `npm run seed:all` y avísame qué sale.**

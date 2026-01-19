# ✅ Checklist de Despliegue - UIT-MASTER

## 🎯 Resumen Ejecutivo

**Estado Actual:** Sistema funciona localmente ✅  
**Trabajo Pendiente:** 3 tareas críticas + 5 tareas opcionales  
**Tiempo Estimado:** 2-4 horas  
**Dificultad:** Media (requiere atención pero no es complejo)

---

## 🔴 TAREAS CRÍTICAS (Deben hacerse antes de desplegar)

### ❗ CRÍTICA #1: Cambiar URLs hardcodeadas en Frontend

**Problema:**
- Hay 60+ lugares en el código con `http://localhost:5000` hardcodeado
- En producción esto causará que el frontend NO pueda conectar al backend

**Solución:**
Tienes 2 opciones:

#### Opción A: Crear archivo de configuración (RECOMENDADO - 1 hora)

1. **Crear `frontend/src/config/api.ts`:**
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   export default API_BASE_URL;
   ```

2. **Modificar los contextos principales** (solo 9 archivos):
   - `frontend/src/context/AuthContext.tsx`
   - `frontend/src/context/UsuariosContext.tsx`
   - `frontend/src/context/OrdenContext.tsx`
   - `frontend/src/context/EquipoContext.tsx`
   - `frontend/src/context/RepuestoContext.tsx`
   - `frontend/src/context/CalendarioContext.tsx`
   - `frontend/src/context/LogContext.tsx`
   - `frontend/src/context/ConfigContext.tsx`
   - `frontend/src/context/IncidenciasContext.tsx`

   **Cambiar de:**
   ```typescript
   const API_BASE_URL = "http://localhost:5000/api/users";
   ```

   **A:**
   ```typescript
   import API_BASE_URL from '../config/api';
   // Luego usar: `${API_BASE_URL}/users`
   ```

3. **Modificar páginas que hacen fetch directo** (~20 archivos):
   - Cambiar `http://localhost:5000/api/...` por `API_BASE_URL`

**Tiempo:** 1-2 horas  
**Dificultad:** Media (copiar/pegar, pero requiere atención)

#### Opción B: Usar proxy en Render (Más rápido - 30 min)

**Render permite configurar un proxy automático:**

En el dashboard de Render (Frontend Static Site):
- Agregar proxy path: `/api` → `https://tu-backend.onrender.com/api`

**Ventaja:** No necesitas cambiar el código  
**Desventaja:** Solo funciona si todas las URLs usan `/api/...`

**Tiempo:** 30 minutos  
**Dificultad:** Baja (solo configuración en dashboard)

---

### ❗ CRÍTICA #2: Variables de Entorno

**Problema:**
- El backend necesita variables de entorno para conectarse a MySQL
- Si faltan, el sistema NO iniciará

**Solución:**
1. **Crear MySQL en JawsDB o PlanetScale** (15 min)
2. **Copiar credenciales** (host, usuario, contraseña, nombre BD)
3. **Agregar en Render Dashboard → Variables de Entorno:**
   ```
   DB_HOST=tu-host-mysql
   DB_USER=tu-usuario
   DB_PASS=tu-contraseña
   DB_NAME=uit
   PORT=5000
   JWT_SECRET=(generar uno nuevo y seguro)
   NODE_ENV=production
   ```

**Tiempo:** 30 minutos  
**Dificultad:** Baja (solo copiar valores)

---

### ❗ CRÍTICA #3: Ejecutar Migraciones en Producción

**Problema:**
- La base de datos en la nube está vacía
- Necesitas crear todas las tablas

**Solución:**
1. Conectar a tu MySQL de producción (usando MySQL Workbench o similar)
2. Ejecutar todos los scripts de migración:
   ```bash
   # Desde tu máquina local (conectado a BD de producción)
   cd server
   node src/scripts/migrate.js
   node src/scripts/migrateProduccion.js
   node src/scripts/migrateInventario.js
   node src/scripts/migrateReportesProduccion.js
   node src/scripts/migrateContabilidad.js
   node src/scripts/migrateAsistencia.js
   node src/scripts/migrateFlujosSalida.js
   ```

3. **O crear script único** (más fácil):
   ```javascript
   // server/runAllMigrations.js
   import './src/scripts/migrate.js';
   import './src/scripts/migrateProduccion.js';
   // ... etc
   ```

**Tiempo:** 30-60 minutos  
**Dificultad:** Media (necesitas conexión a MySQL de producción)

---

## 🟡 TAREAS IMPORTANTES (Hacer después del despliegue)

### ⚠️ IMPORTANTE #1: Crear Usuarios Iniciales

**Problema:**
- Base de datos vacía = no hay usuarios para login

**Solución:**
```bash
# Conectar a MySQL de producción y ejecutar:
node src/seeders/seedMultipleUsers.js
node crear-usuarios-produccion.js
```

**Tiempo:** 10 minutos  
**Dificultad:** Baja

---

### ⚠️ IMPORTANTE #2: Cambiar Contraseñas por Defecto

**Problema:**
- Todos tienen `demo123` (no seguro para producción)

**Solución:**
- Usar el panel de administración en el sistema
- O ejecutar script SQL para cambiar contraseñas

**Tiempo:** 15 minutos  
**Dificultad:** Baja

---

### ⚠️ IMPORTANTE #3: Probar Funcionalidades Principales

**Problema:**
- Necesitas verificar que todo funciona en producción

**Qué probar:**
- ✅ Login con cada rol
- ✅ Dashboard principal
- ✅ CRUD de usuarios (si eres admin)
- ✅ Módulos principales (incidencias, producción, etc.)
- ✅ Verificar que no hay errores en consola del navegador

**Tiempo:** 30-60 minutos  
**Dificultad:** Baja (solo usar el sistema)

---

## 🟢 TAREAS OPCIONALES (Mejoras, no críticas)

### ✅ OPCIONAL #1: Probar Build Local

**Hacer:**
```bash
cd frontend
npm run build
# Verificar que frontend/dist/ se creó correctamente
```

**Tiempo:** 5 minutos  
**Beneficio:** Detecta errores antes de desplegar

---

### ✅ OPCIONAL #2: Configurar CORS Específico

**Actual:**
```javascript
app.use(cors()); // Permite todos los orígenes
```

**Mejor:**
```javascript
app.use(cors({
  origin: 'https://tu-frontend-url.onrender.com',
  credentials: true
}));
```

**Tiempo:** 5 minutos  
**Beneficio:** Más seguro

---

### ✅ OPCIONAL #3: Agregar Logging de Errores

**Agregar middleware de manejo de errores:**
- Ya existe pero puede mejorarse para producción

**Tiempo:** 30 minutos  
**Beneficio:** Mejor debugging en producción

---

## 📋 Checklist Final Simplificado

### Antes de Desplegar (2-3 horas):
- [ ] **Resolver URLs hardcodeadas** (Opción A o B arriba) ⚠️ CRÍTICO
- [ ] **Crear MySQL en la nube** (JawsDB o PlanetScale) ⚠️ CRÍTICO
- [ ] **Configurar variables de entorno en Render** ⚠️ CRÍTICO
- [ ] **Probar build del frontend localmente** (opcional pero recomendado)

### Durante Despliegue (30-60 min):
- [ ] **Desplegar backend en Render**
- [ ] **Verificar que backend responde** (`/ping`)
- [ ] **Desplegar frontend en Render**
- [ ] **Verificar que frontend carga**

### Después de Desplegar (1-2 horas):
- [ ] **Ejecutar migraciones** (crear tablas) ⚠️ CRÍTICO
- [ ] **Crear usuarios iniciales** (seeders)
- [ ] **Probar login**
- [ ] **Probar módulos principales**
- [ ] **Cambiar contraseñas por defecto**

### Post-Producción (continuo):
- [ ] **Monitorear logs** (24-48 horas)
- [ ] **Verificar rendimiento**
- [ ] **Hacer backup de base de datos**

---

## 🎯 Plan de Acción Recomendado

### Si tienes 4 horas disponibles:

**Día 1 (2 horas):**
1. Resolver URLs hardcodeadas (Opción B - proxy, más rápido)
2. Crear MySQL en JawsDB
3. Configurar variables de entorno
4. Probar build local

**Día 1 (1 hora):**
5. Desplegar backend
6. Desplegar frontend
7. Verificar que cargan

**Día 2 (1 hora):**
8. Ejecutar migraciones
9. Crear usuarios
10. Probar sistema completo
11. Cambiar contraseñas

**TOTAL: ~4 horas**

---

### Si tienes solo 2 horas:

**Hacer LO MÍNIMO:**
1. ✅ Resolver URLs (Opción B - proxy) - 30 min
2. ✅ MySQL + Variables entorno - 30 min
3. ✅ Desplegar backend + frontend - 30 min
4. ✅ Ejecutar migraciones + seeders - 30 min

**Luego probar y ajustar según necesario.**

---

## ⚠️ ¿Qué pasa si NO hago las tareas críticas?

| Tarea | Si NO se hace | Resultado |
|-------|---------------|-----------|
| URLs hardcodeadas | El frontend no conectará al backend | ❌ Sistema no funciona |
| Variables de entorno | El backend no conectará a MySQL | ❌ Backend no inicia |
| Migraciones | No habrá tablas en la BD | ❌ Errores SQL en todas las funciones |

**Conclusión:** Las 3 tareas críticas SON obligatorias. Sin ellas, el sistema NO funcionará en producción.

---

## 💡 Resumen Ultra-Rápido

**3 COSAS CRÍTICAS que debes hacer:**
1. 🔴 Cambiar URLs hardcodeadas (1 hora)
2. 🔴 Configurar MySQL y variables entorno (30 min)
3. 🔴 Ejecutar migraciones (30 min)

**Después:**
4. 🟡 Crear usuarios
5. 🟡 Probar todo
6. 🟡 Cambiar contraseñas

**Tiempo total:** 2-4 horas dependiendo de tu experiencia.

---

## ❓ ¿Necesitas ayuda con alguna tarea específica?

Puedo ayudarte a:
- Crear el archivo de configuración para las URLs
- Generar un script único para todas las migraciones
- Revisar el código para ver qué más necesita cambios

**¿Qué quieres hacer primero?**

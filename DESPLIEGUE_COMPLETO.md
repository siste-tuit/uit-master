# 🚀 GUÍA COMPLETA DE DESPLIEGUE - Sistema UIT

## ✅ PREPARACIÓN COMPLETADA

Todos los pasos previos están completos:
- ✅ Sistema 100% funcional
- ✅ Errores críticos corregidos
- ✅ URLs centralizadas
- ✅ Testing exhaustivo realizado

---

## 📋 CHECKLIST DE DESPLIEGUE

### PASO 1: Preparar Archivos de Configuración

#### 1.1 Crear `.env` en `server/` (NO commitear a Git)

```bash
# Copia el template
cp server/.env.example server/.env

# Edita con tus credenciales de producción:
DB_HOST=tu-host-mysql-produccion
DB_USER=tu-usuario-mysql
DB_PASS=tu-contraseña-segura
DB_NAME=uit
PORT=5000
JWT_SECRET=(genera uno seguro - ver abajo)
NODE_ENV=production
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 1.2 Configurar Variables de Entorno en Render.com

En el Dashboard de Render → Backend Service → Environment Variables:

```
DB_HOST = tu-host-mysql
DB_USER = tu-usuario
DB_PASS = tu-contraseña
DB_NAME = uit
PORT = 5000
JWT_SECRET = (tu-secret-generado)
NODE_ENV = production
```

---

### PASO 2: Configurar Base de Datos MySQL en Producción

#### Opción A: JawsDB (Recomendada - $5/mes)

1. Ir a https://www.jawsdb.com
2. Crear cuenta y seleccionar plan **Tiny ($5/mes)**
3. Crear base de datos MySQL
4. Copiar credenciales de conexión:
   - Host
   - Puerto
   - Usuario
   - Contraseña
   - Nombre de base de datos

#### Opción B: PlanetScale (Gratis para empezar)

1. Ir a https://planetscale.com
2. Crear cuenta y crear proyecto
3. Crear base de datos MySQL
4. Copiar credenciales de conexión

---

### PASO 3: Desplegar Backend en Render.com

#### 3.1 Crear Web Service

1. Ir a https://render.com
2. Click "New" → "Web Service"
3. Conectar tu repositorio Git (GitHub/GitLab/Bitbucket)
4. Configurar:

```
Name: uit-backend
Environment: Node
Branch: main (o tu rama principal)
Build Command: cd server && npm install
Start Command: cd server && npm start
Plan: Starter ($7/mes) - IMPORTANTE: Permite Always On (sin cold start)
```

#### 3.2 Agregar Variables de Entorno

En "Environment Variables" del servicio, agregar todas las variables del `.env`:

```
DB_HOST = (de JawsDB/PlanetScale)
DB_USER = (de JawsDB/PlanetScale)
DB_PASS = (de JawsDB/PlanetScale)
DB_NAME = uit
PORT = 5000
JWT_SECRET = (generado localmente)
NODE_ENV = production
```

#### 3.3 Desplegar

- Click "Create Web Service"
- Esperar el despliegue (5-10 minutos)
- Anotar la URL del backend (ej: `https://uit-backend.onrender.com`)

---

### PASO 4: Desplegar Frontend en Render.com

#### 4.1 Crear Static Site

1. En Render Dashboard, click "New" → "Static Site"
2. Conectar tu repositorio Git
3. Configurar:

```
Name: uit-frontend
Branch: main
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Plan: Free (GRATIS)
```

#### 4.2 Agregar Variable de Entorno (CRÍTICO)

En "Environment Variables", agregar:

```
VITE_API_URL = https://uit-backend.onrender.com/api
```

**⚠️ IMPORTANTE:** Reemplaza `uit-backend.onrender.com` con la URL real de tu backend desplegado.

#### 4.3 Desplegar

- Click "Create Static Site"
- Esperar el build y despliegue (5-10 minutos)
- Anotar la URL del frontend (ej: `https://uit-frontend.onrender.com`)

---

### PASO 5: Ejecutar Migraciones en Producción

#### 5.1 Desde tu Máquina Local (Recomendado)

```powershell
# Configurar variables de entorno para producción
cd "D:\Empresa UIT\UIT-master\server"

$env:DB_HOST='tu-host-mysql-produccion'
$env:DB_USER='tu-usuario-mysql'
$env:DB_PASS='tu-contraseña-mysql'
$env:DB_NAME='uit'

# Ejecutar todas las migraciones
npm run migrate:all
```

**O si no existe `migrate:all`, ejecutar manualmente:**

```powershell
node src/scripts/migrate.js
node src/scripts/migrateProduccion.js
node src/scripts/migrateInventario.js
node src/scripts/migrateReportesProduccion.js
node src/scripts/migrateContabilidad.js
```

#### 5.2 Verificar Migraciones Exitosas

El script debería mostrar:
```
✅ Tablas creadas exitosamente
✅ Migraciones de producción completadas
✅ Migraciones de inventario completadas
✅ Migraciones de reportes completadas
✅ Migraciones de contabilidad completadas
```

---

### PASO 6: Crear Usuarios Iniciales

#### 6.1 Ejecutar Seeders

```powershell
cd "D:\Empresa UIT\UIT-master\server"

# Configurar variables de entorno (las mismas de producción)
$env:DB_HOST='tu-host-mysql-produccion'
$env:DB_USER='tu-usuario-mysql'
$env:DB_PASS='tu-contraseña-mysql'
$env:DB_NAME='uit'

# Crear usuarios administrativos
node src/seeders/seedMultipleUsers.js

# Crear usuarios de producción
node src/seeders/crear-usuarios-produccion.js
```

#### 6.2 Verificar Usuarios Creados

Deberías tener:
- ✅ 6 usuarios administrativos (admin, gerencia, ingenieria, sistemas, etc.)
- ✅ 13 usuarios de producción (AyC@textil.com, DyM@textil.com, etc.)
- ✅ Todos con contraseña: `demo123` (¡CAMBIAR EN PRODUCCIÓN!)

---

### PASO 7: Probar Sistema en Producción

#### 7.1 Verificar Endpoints Backend

```bash
# Test de salud
curl https://uit-backend.onrender.com/api/health

# Test de login (reemplaza con tus credenciales)
curl -X POST https://uit-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@textil.com","password":"demo123"}'
```

#### 7.2 Probar Frontend

1. Abrir URL del frontend: `https://uit-frontend.onrender.com`
2. Intentar login con credenciales:
   - Email: `admin@textil.com`
   - Password: `demo123`
3. Verificar que:
   - ✅ Login funciona
   - ✅ Dashboard carga correctamente
   - ✅ Rutas protegidas funcionan
   - ✅ API se conecta correctamente

#### 7.3 Probar Módulos Principales

- ✅ Dashboard de Administración
- ✅ Módulo de Producción
- ✅ Módulo de Ingeniería
- ✅ Módulo de Gerencia
- ✅ Módulo de Sistemas

---

### PASO 8: Configuración de Seguridad

#### 8.1 Cambiar Contraseñas por Defecto

**⚠️ CRÍTICO:** Cambiar todas las contraseñas `demo123` en producción.

Puedes usar el script de reseteo (después actualizar manualmente cada una):

```bash
# Script temporal para cambiar contraseñas
# EJECUTAR SOLO UNA VEZ y luego cambiar individualmente
```

#### 8.2 Verificar CORS

Asegurar que CORS en backend permita el dominio del frontend:

```javascript
// En server/src/index.js
const cors = require('cors');
app.use(cors({
  origin: ['https://uit-frontend.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

#### 8.3 Verificar SSL/HTTPS

Render.com proporciona SSL automáticamente. Verificar que:
- ✅ Frontend: `https://uit-frontend.onrender.com` funciona
- ✅ Backend: `https://uit-backend.onrender.com` funciona

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot connect to database"

**Causa:** Variables de entorno incorrectas o firewall de MySQL bloqueando

**Solución:**
1. Verificar credenciales en Render Dashboard
2. En JawsDB/PlanetScale, verificar que permite conexiones externas
3. Verificar que el host incluye el puerto: `host:puerto` (ej: `mysql123.jawsdb.com:3306`)

### Error: "Module not found" en build

**Causa:** Dependencias no instaladas

**Solución:**
1. Verificar que `package.json` está en la raíz correcta
2. Verificar Build Command incluye `npm install`

### Error: "VITE_API_URL is not defined"

**Causa:** Variable de entorno no configurada en build

**Solución:**
1. Verificar que `VITE_API_URL` está en Environment Variables de Render
2. Verificar que está configurada ANTES del build (no en runtime)

### Frontend no se conecta al Backend

**Causa:** CORS o URL incorrecta

**Solución:**
1. Verificar `VITE_API_URL` en frontend tiene la URL correcta
2. Verificar CORS en backend permite el dominio del frontend
3. Verificar que backend está activo y respondiendo

---

## 📊 RESUMEN DE COSTOS (Render.com)

```
Backend (Web Service - Starter):    $7/mes
Frontend (Static Site - Free):      $0/mes
MySQL (JawsDB Tiny):                $5/mes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                              $12/mes
```

**Alternativa (PlanetScale gratis):** $7/mes (solo backend)

---

## ✅ CHECKLIST FINAL

### Pre-Despliegue
- [x] ✅ Sistema probado localmente
- [x] ✅ Errores críticos corregidos
- [x] ✅ Archivos .env.example creados
- [ ] ⚠️ Configurar `.env` local con credenciales de producción
- [ ] ⚠️ Generar JWT_SECRET seguro

### Despliegue
- [ ] ⚠️ Crear cuenta en Render.com
- [ ] ⚠️ Crear cuenta en JawsDB/PlanetScale
- [ ] ⚠️ Configurar MySQL en producción
- [ ] ⚠️ Desplegar backend en Render
- [ ] ⚠️ Configurar variables de entorno en backend
- [ ] ⚠️ Desplegar frontend en Render
- [ ] ⚠️ Configurar VITE_API_URL en frontend

### Post-Despliegue
- [ ] ⚠️ Ejecutar `npm run migrate:all` en producción
- [ ] ⚠️ Ejecutar seeders para crear usuarios
- [ ] ⚠️ Probar login en producción
- [ ] ⚠️ Probar módulos principales
- [ ] ⚠️ Cambiar contraseñas por defecto
- [ ] ⚠️ Verificar SSL/HTTPS funcionando

---

## 🎯 SIGUIENTE PASO

**Ahora que tienes esta guía:**

1. **Sigue el PASO 1:** Crear archivos `.env` con tus credenciales
2. **Continúa con PASO 2:** Configurar MySQL en producción
3. **Sigue cada paso** en orden

**Tiempo estimado total:** 30-60 minutos (primera vez)

---

**¿Listo para desplegar?** ¡El sistema está 100% preparado! 🚀

# 🚀 GUÍA PASO A PASO - Despliegue a Render.com

## ✅ PREPARACIÓN (VERIFICADO)

- ✅ Sistema 100% funcional
- ✅ Errores críticos corregidos
- ✅ Archivos de configuración listos
- ✅ Scripts de migración listos

---

## 📋 PASOS PARA DESPLEGAR

### PASO 1: Crear Cuenta en Render.com

1. Ir a https://render.com
2. Click en "Get Started for Free"
3. Registrarse con GitHub/GitLab/Bitbucket (recomendado) o email
4. Verificar email si es necesario

**Tiempo:** 2-3 minutos

---

### PASO 2: Preparar Base de Datos MySQL

#### Opción A: JawsDB (Recomendada - $5/mes)

1. Ir a https://www.jawsdb.com
2. Click "Sign Up" o "Start Free Trial"
3. Crear base de datos MySQL
4. Seleccionar plan **Tiny ($5/mes)** o **Small ($10/mes)**
5. **ANOTAR las credenciales:**
   ```
   Host: (ej: mysql123.jawsdb.com)
   Puerto: (ej: 3306)
   Usuario: (tu usuario)
   Contraseña: (tu contraseña)
   Base de datos: (nombre de tu BD)
   ```

#### Opción B: PlanetScale (Gratis para empezar)

1. Ir a https://planetscale.com
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Crear base de datos MySQL
5. **ANOTAR las credenciales** (igual que arriba)

**Tiempo:** 5-10 minutos

---

### PASO 3: Conectar Repositorio Git

#### Si tu código NO está en Git:

```powershell
# En la raíz del proyecto
cd "D:\Empresa UIT\UIT-master"
git init
git add .
git commit -m "Sistema UIT listo para producción"
# Luego sube a GitHub/GitLab/Bitbucket
```

#### En Render.com:

1. Click "New" en el dashboard
2. Seleccionar "Connect a repository"
3. Conectar tu cuenta de GitHub/GitLab/Bitbucket
4. Seleccionar tu repositorio

**Tiempo:** 2-3 minutos

---

### PASO 4: Desplegar Backend (Web Service)

#### 4.1 Crear Web Service

1. En Render Dashboard, click "New" → "Web Service"
2. Seleccionar tu repositorio conectado
3. Configurar:

```
Name: uit-backend
Region: Select closest (Oregon, Frankfurt, etc.)
Branch: main (o tu rama principal)
Root Directory: (dejar vacío)
Runtime: Node
Build Command: cd server && npm install
Start Command: cd server && npm start
Plan: Starter ($7/mes) - IMPORTANTE: Permite "Always On"
```

#### 4.2 Agregar Variables de Entorno

Click "Advanced" → "Add Environment Variable" y agregar:

```
NODE_ENV = production
DB_HOST = (tu-host-mysql-de-jawsdb)
DB_USER = (tu-usuario-mysql)
DB_PASS = (tu-contraseña-mysql)
DB_NAME = (nombre-base-datos) o "uit"
PORT = 5000
JWT_SECRET = (genera uno - ver abajo)
```

**Generar JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 4.3 Crear y Desplegar

1. Click "Create Web Service"
2. Esperar el despliegue (5-10 minutos)
3. **ANOTAR la URL:** `https://uit-backend.onrender.com` (o similar)

**Tiempo:** 10-15 minutos

---

### PASO 5: Desplegar Frontend (Static Site)

#### 5.1 Crear Static Site

1. En Render Dashboard, click "New" → "Static Site"
2. Seleccionar tu repositorio
3. Configurar:

```
Name: uit-frontend
Branch: main
Root Directory: (dejar vacío)
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Plan: Free
```

#### 5.2 Agregar Variable de Entorno (CRÍTICO)

En "Environment Variables", agregar:

```
VITE_API_URL = https://uit-backend.onrender.com/api
```

**⚠️ IMPORTANTE:** Reemplaza `uit-backend.onrender.com` con la URL REAL de tu backend desplegado.

#### 5.3 Crear y Desplegar

1. Click "Create Static Site"
2. Esperar el build y despliegue (5-10 minutos)
3. **ANOTAR la URL:** `https://uit-frontend.onrender.com` (o similar)

**Tiempo:** 10-15 minutos

---

### PASO 6: Ejecutar Migraciones en Producción

#### Opción A: Desde tu Máquina Local (Recomendado)

```powershell
cd "D:\Empresa UIT\UIT-master\server"

# Configurar variables de entorno para producción
$env:DB_HOST='tu-host-mysql-jawsdb'
$env:DB_USER='tu-usuario-mysql'
$env:DB_PASS='tu-contraseña-mysql'
$env:DB_NAME='uit'

# Ejecutar todas las migraciones
npm run migrate:all
```

#### Opción B: Desde Render Shell (Alternativa)

1. En Render Dashboard → Backend Service → Shell
2. Ejecutar:
```bash
cd server
npm run migrate:all
```

**Tiempo:** 5 minutos

---

### PASO 7: Crear Usuarios Iniciales

```powershell
cd "D:\Empresa UIT\UIT-master\server"

# Configurar variables (las mismas de producción)
$env:DB_HOST='tu-host-mysql'
$env:DB_USER='tu-usuario'
$env:DB_PASS='tu-contraseña'
$env:DB_NAME='uit'

# Crear usuarios administrativos
node src/seeders/seedMultipleUsers.js

# Crear usuarios de producción
node src/seeders/crear-usuarios-produccion.js
```

**Tiempo:** 2 minutos

---

### PASO 8: Probar Sistema en Producción

1. **Abrir URL del Frontend:** `https://uit-frontend.onrender.com`
2. **Probar Login:**
   - Email: `admin@textil.com`
   - Password: `demo123`
3. **Verificar:**
   - ✅ Login funciona
   - ✅ Dashboard carga datos
   - ✅ Navegación funciona
   - ✅ API se conecta correctamente

**Tiempo:** 5 minutos

---

## ✅ CHECKLIST DE DESPLIEGUE

### Pre-Despliegue
- [x] ✅ Sistema probado localmente
- [x] ✅ Errores críticos corregidos
- [ ] ⚠️ Código en repositorio Git

### Despliegue
- [ ] ⚠️ Cuenta en Render.com creada
- [ ] ⚠️ Base de datos MySQL configurada (JawsDB/PlanetScale)
- [ ] ⚠️ Backend desplegado en Render
- [ ] ⚠️ Variables de entorno backend configuradas
- [ ] ⚠️ Frontend desplegado en Render
- [ ] ⚠️ VITE_API_URL configurada en frontend

### Post-Despliegue
- [ ] ⚠️ Migraciones ejecutadas (`npm run migrate:all`)
- [ ] ⚠️ Usuarios creados (seeders ejecutados)
- [ ] ⚠️ Login probado en producción
- [ ] ⚠️ Módulos principales verificados

---

## 💰 COSTOS ESTIMADOS

```
Backend (Web Service - Starter):    $7/mes
Frontend (Static Site - Free):      $0/mes
MySQL (JawsDB Tiny):                $5/mes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                              $12/mes
```

**Alternativa (PlanetScale gratis):** Solo $7/mes (backend)

---

## ⚠️ IMPORTANTE

### Seguridad:
1. **Cambiar contraseñas por defecto** (`demo123`) en producción
2. **JWT_SECRET único y seguro** (64+ caracteres)
3. **No compartir credenciales** públicamente

### Si algo falla:
1. Revisar logs en Render Dashboard
2. Verificar variables de entorno
3. Verificar que backend esté activo (Always On)
4. Verificar CORS en backend permite dominio del frontend

---

## 🎯 SIGUIENTE PASO

**Empieza con PASO 1:** Crear cuenta en Render.com

¿Listo? ¡Vamos a desplegar! 🚀

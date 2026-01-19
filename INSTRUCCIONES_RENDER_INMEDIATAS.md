# 🎯 INSTRUCCIONES INMEDIATAS - Crear Servicios en Render

## 📍 ESTÁS EN RENDER - PÁGINA DE CREAR SERVICIO

Veo que estás en la página de "Create a new Service" de Render.com.

---

## 🚀 PASO 1: CREAR BACKEND (AHORA)

### En la página que estás viendo:

1. **Click en "Web Services"** (segunda tarjeta, dice "Dynamic web app. Ideal for full-stack apps, API servers...")

2. **Configuración que aparecerá:**

#### Si Render detecta automáticamente tu repo:
- Selecciona tu repositorio Git (si está conectado)
- O conecta tu cuenta de GitHub/GitLab/Bitbucket

#### Configuración Manual:

```
Name: uit-backend
Region: (selecciona el más cercano a tu ubicación)
Branch: main (o tu rama principal)
Root Directory: (dejar vacío)
Runtime: Node
Build Command: cd server && npm install
Start Command: cd server && npm start
Instance Type: Starter ($7/mes) - MUY IMPORTANTE
```

#### Variables de Entorno (en Advanced):
```
NODE_ENV = production
DB_HOST = (lo agregarás después, cuando tengas MySQL)
DB_USER = (lo agregarás después)
DB_PASS = (lo agregarás después)
DB_NAME = uit
PORT = 5000
JWT_SECRET = (genera uno - ver abajo)
```

**Generar JWT_SECRET ahora:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. **Click "Create Web Service"**

4. **Esperar despliegue** (5-10 minutos)

5. **Anotar la URL:** Aparecerá algo como `https://uit-backend.onrender.com`

---

## 🌐 PASO 2: CREAR FRONTEND (DESPUÉS)

### Cuando el backend esté desplegado:

1. En Render Dashboard, click **"+ New"** → **"Static Sites"**

2. **Configuración:**

```
Name: uit-frontend
Branch: main
Root Directory: (dejar vacío)
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

#### Variable de Entorno (IMPORTANTE):

```
VITE_API_URL = https://uit-backend.onrender.com/api
```

**⚠️ Reemplaza `uit-backend.onrender.com` con la URL REAL que te dio Render para tu backend**

3. **Click "Create Static Site"**

4. **Esperar build y despliegue** (5-10 minutos)

---

## 🗄️ PASO 3: CONFIGURAR MYSQL (ANTES O DESPUÉS)

### Opción A: JawsDB (Recomendada)

1. Ir a https://www.jawsdb.com
2. Crear cuenta
3. Crear base de datos MySQL (Plan Tiny $5/mes)
4. **Copiar credenciales:**
   - Host
   - Puerto
   - Usuario
   - Contraseña
   - Nombre BD

5. **Volver a Render** → Backend → Environment Variables
6. **Actualizar:**
   ```
   DB_HOST = (host de JawsDB)
   DB_USER = (usuario de JawsDB)
   DB_PASS = (contraseña de JawsDB)
   DB_NAME = (nombre BD de JawsDB o "uit")
   ```

7. **Render redeployeará automáticamente** con las nuevas variables

### Opción B: PlanetScale (Gratis)

1. Ir a https://planetscale.com
2. Crear cuenta y proyecto
3. Crear base de datos
4. Copiar credenciales y agregar en Render (igual que arriba)

---

## 📋 CHECKLIST RÁPIDO

### Ahora mismo:
- [ ] ✅ Estás en Render (confirmado)
- [ ] ⚠️ Click en "Web Services" para backend
- [ ] ⚠️ Configurar backend
- [ ] ⚠️ Anotar URL del backend

### Después:
- [ ] ⚠️ Crear MySQL en JawsDB/PlanetScale
- [ ] ⚠️ Agregar variables de BD en backend
- [ ] ⚠️ Crear Static Site para frontend
- [ ] ⚠️ Ejecutar migraciones
- [ ] ⚠️ Crear usuarios

---

## 🎯 SIGUIENTE ACCIÓN INMEDIATA

**Click en "Web Services" ahora mismo** (segunda tarjeta, con el icono de globo).

Después te guío con la configuración paso a paso.

---

**¿Necesitas ayuda con la configuración del Web Service?** Dime cuando hagas click y te guío.

# ☁️ Preparación para Despliegue en Nube - UIT-MASTER

## 📋 Checklist Pre-Despliegue

### ✅ Completado
- [x] Sistema verificado localmente
- [x] Favicon actualizado
- [x] Backend y Frontend funcionando
- [x] Base de datos MySQL configurada

### ⚠️ Pendiente antes de subir a nube

#### 1. Variables de Entorno
- [ ] Crear archivo `.env` en `server/` con credenciales de producción
- [ ] Cambiar `JWT_SECRET` a un valor seguro y único
- [ ] Configurar URL de la base de datos MySQL en la nube
- [ ] (Opcional) Crear `.env` en `frontend/` con `VITE_API_URL`

#### 2. Seguridad
- [ ] Cambiar todas las contraseñas por defecto (`demo123`)
- [ ] Verificar que `JWT_SECRET` sea seguro (mínimo 32 caracteres aleatorios)
- [ ] Configurar CORS con dominios específicos si es necesario
- [ ] Revisar que no haya credenciales hardcodeadas en el código

#### 3. Base de Datos
- [ ] Ejecutar todas las migraciones en el servidor de producción
- [ ] Verificar que todas las tablas estén creadas
- [ ] Crear usuarios iniciales si es necesario

#### 4. Optimización
- [ ] Build de producción del frontend (`npm run build`)
- [ ] Verificar que no hay `console.log` sensibles
- [ ] Minificar assets si es necesario

---

## 🚀 Opciones de Plataformas en la Nube

### Opción 1: Render.com (Recomendado - Sin Cold Start)
**Ventajas:**
- ✅ Sin cold start (siempre activo)
- ✅ Despliegue automático desde Git
- ✅ SSL gratuito
- ✅ Base de datos PostgreSQL gratuita (o MySQL de pago)
- ✅ Accesible económicamente

**Estructura:**
- Frontend: Static Site (React build)
- Backend: Web Service (Node.js)
- Base de datos: PostgreSQL (gratis) o MySQL (de pago)

### Opción 2: Railway.app
**Ventajas:**
- ✅ Fácil despliegue
- ✅ Base de datos MySQL incluida
- ✅ Sin configuración compleja
- ✅ Buena relación precio/rendimiento

### Opción 3: Vercel (Frontend) + Railway (Backend)
**Ventajas:**
- ✅ Vercel excelente para React/Vite
- ✅ Railway para backend y MySQL
- ✅ Despliegue automático
- ✅ CDN global para frontend

### Opción 4: DigitalOcean (App Platform)
**Ventajas:**
- ✅ Control total
- ✅ Escalable
- ✅ MySQL gestionado disponible
- ⚠️ Más configuración manual

### Opción 5: AWS / Azure / Google Cloud
**Ventajas:**
- ✅ Máxima escalabilidad
- ✅ Servicios avanzados
- ⚠️ Más complejo de configurar
- ⚠️ Puede ser más costoso

---

## 📝 Configuración para Render.com

### 1. Backend (Web Service)

**Configuración:**
```yaml
Name: uit-backend
Environment: Node
Build Command: cd server && npm install
Start Command: cd server && npm start
Environment Variables:
  - DB_HOST: (de tu MySQL)
  - DB_USER: (tu usuario)
  - DB_PASS: (tu contraseña)
  - DB_NAME: uit
  - PORT: 5000
  - JWT_SECRET: (generar uno nuevo y seguro)
  - NODE_ENV: production
```

**Nota:** Render asigna un puerto automáticamente, verificar `process.env.PORT`.

### 2. Frontend (Static Site)

**Configuración:**
```yaml
Name: uit-frontend
Environment: Static Site
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Environment Variables:
  - VITE_API_URL: https://uit-backend.onrender.com/api
```

### 3. Base de Datos MySQL

**Opción A:** MySQL en Render (de pago)
**Opción B:** Base de datos externa (JawsDB, PlanetScale, etc.)
**Opción C:** Usar PostgreSQL de Render (gratis) y adaptar código

---

## 📝 Configuración para Railway.app

### 1. Archivo `railway.json` (Opcional)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Variables de Entorno en Railway
- Agregar todas las variables desde el dashboard
- MySQL se puede agregar como servicio adicional

---

## 🔧 Modificaciones Necesarias en el Código

### 1. Backend - Ajustar Puerto

En `server/src/index.js` ya está bien:
```javascript
const PORT = process.env.PORT || 5000;
```

### 2. Frontend - Variable de Entorno para API

**Crear `frontend/.env.production`:**
```env
VITE_API_URL=https://tu-backend-url.com/api
```

**Modificar contextos para usar variable de entorno:**

Ejemplo en `frontend/src/context/AuthContext.tsx`:
```typescript
// Cambiar de:
const API_BASE_URL = 'http://localhost:5000/api/auth';

// A:
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;
```

**⚠️ NOTA:** Esto requiere modificar 98 ubicaciones en el código. Se puede hacer de forma gradual o crear un archivo de configuración central.

---

## 🗄️ Migraciones de Base de Datos

Antes del despliegue, ejecutar todas las migraciones:

```bash
cd server
npm run migrate:all
```

Esto ejecutará:
- `migrate:core`
- `migrate:produccion`
- `migrate:inventario`
- `migrate:reportes`
- `migrate:contabilidad`

---

## 🔒 Seguridad en Producción

### 1. JWT Secret Seguro
Generar un JWT_SECRET fuerte:
```bash
# En Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Variables de Entorno
- Nunca committear `.env` a Git
- Usar variables de entorno del servicio de nube
- Verificar que `.env` esté en `.gitignore`

### 3. CORS
Si es necesario restringir CORS, modificar `server/src/index.js`:
```javascript
app.use(cors({
  origin: 'https://tu-frontend-url.com',
  credentials: true
}));
```

---

## 📦 Build de Producción

### Frontend
```bash
cd frontend
npm install
npm run build
# Archivos en frontend/dist/
```

### Backend
```bash
cd server
npm install --production
# No necesita build, solo copiar archivos
```

---

## ✅ Verificación Post-Despliegue

1. Verificar que el backend responde:
   ```bash
   curl https://tu-backend-url.com/ping
   ```

2. Verificar que el frontend carga:
   - Abrir URL del frontend en el navegador
   - Verificar que no hay errores en consola

3. Probar login:
   - Intentar iniciar sesión con credenciales
   - Verificar redirección al dashboard

4. Probar endpoints protegidos:
   - Verificar que requieren autenticación
   - Probar algunas operaciones CRUD

---

## 🎯 Recomendación Final

Para este sistema, **Render.com** es una excelente opción porque:
- ✅ Sin cold start (importante para ERP en uso continuo)
- ✅ Precio razonable
- ✅ Fácil de configurar
- ✅ SSL incluido
- ✅ Despliegue automático desde Git

**Estructura sugerida:**
1. Backend: Web Service en Render (Node.js)
2. Frontend: Static Site en Render (React build)
3. Base de datos: MySQL externa (JawsDB) o PostgreSQL en Render

---

## 📞 Próximos Pasos

1. Elegir plataforma de nube
2. Configurar repositorio Git (si no está configurado)
3. Configurar variables de entorno
4. Hacer build de producción
5. Desplegar y verificar
6. Configurar dominio personalizado (opcional)

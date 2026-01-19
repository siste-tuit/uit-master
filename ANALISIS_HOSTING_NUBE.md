# ☁️ Análisis Completo del Sistema UIT-MASTER para Hosting en la Nube

**Fecha:** 18 de Enero 2026  
**Sistema:** UIT-MASTER ERP Textil  
**Objetivo:** Recomendación detallada de plataforma de hosting en la nube

---

## 📊 Análisis Técnico del Sistema

### 1. Arquitectura Actual

#### **Frontend** (`frontend/`)
- **Framework:** React 18.2.0 + TypeScript
- **Build Tool:** Vite 5.0.8
- **Estilos:** TailwindCSS 4.1.16
- **Estado:** Context API (11 contextos)
- **Routing:** React Router DOM 6.20.1
- **Tamaño:** ~85 archivos fuente, ~215 MB (incluye node_modules)
- **Tamaño de build:** ~2-5 MB (estimado, sin node_modules)
- **Puerto:** 3000 (desarrollo) / Estático (producción)

#### **Backend** (`server/`)
- **Framework:** Express.js 5.1.0
- **Lenguaje:** JavaScript ES6+ (ES Modules)
- **Base de Datos:** MySQL (mysql2 v3.15.1)
- **Autenticación:** JWT (jsonwebtoken 9.0.2)
- **Pool de Conexiones:** mysql2/promise (límite: 10 conexiones)
- **Tamaño:** ~58 archivos fuente, ~16 MB (incluye node_modules)
- **Puerto:** 5000 (configurable vía PORT env)
- **Características:**
  - 18 Controladores
  - 18 Rutas API
  - 170+ consultas SQL (uso de pool de conexiones)
  - Sin procesamiento pesado (solo APIs REST)

#### **Base de Datos MySQL**
- **Motor:** MySQL 8.0+ (recomendado)
- **Tablas principales:**
  - `roles`, `usuarios`, `departamentos`
  - `productos`, `inventario`
  - `incidencias`, `logs`
  - `equipos`, `ordenes_trabajo`, `repuestos`, `calendario_mantenimiento`
  - `lineas_produccion`, `reportes_diarios`, `pedidos_produccion`
  - `trabajadores`, `asistencia`
  - `registros_financieros`
  - `flujos_salida`
- **Tamaño estimado:** 100-500 MB (inicial, crecerá con uso)
- **Conexiones concurrentes:** Máximo 10 (configurado en pool)

---

## 🎯 Requisitos del Sistema

### Recursos Necesarios

#### **Frontend (Static Site)**
- **CPU:** Mínimo (solo sirve archivos estáticos)
- **RAM:** < 100 MB
- **Almacenamiento:** ~5-10 MB (archivos estáticos)
- **Tráfico:** Variable (depende de usuarios concurrentes)
- **SSL:** Requerido (HTTPS)

#### **Backend (Node.js API)**
- **CPU:** 0.5-1 vCPU (suficiente para APIs REST ligeras)
- **RAM:** 512 MB - 1 GB (recomendado)
- **Almacenamiento:** ~50 MB (código + logs)
- **Conexiones:** Hasta 10 conexiones MySQL simultáneas
- **Uptime:** 99.9% (crítico para ERP en uso continuo)
- **Cold Start:** NO permitido (sistema ERP siempre activo)

#### **Base de Datos MySQL**
- **CPU:** 0.5-1 vCPU
- **RAM:** 512 MB - 1 GB (mínimo)
- **Almacenamiento:** 1-10 GB (inicial: 1 GB suficiente)
- **Conexiones máx:** 10-20 (pool configurado a 10)
- **Backups:** Diarios (recomendado)

---

## 💰 Análisis de Costos y Plataformas

### Opción 1: Render.com ⭐ **RECOMENDADA**

#### **Ventajas:**
- ✅ **Sin Cold Start** - Siempre activo (crítico para ERP)
- ✅ **SSL Gratuito** - Certificados automáticos
- ✅ **Despliegue desde Git** - Automático con push
- ✅ **Precio Accesible** - Desde $7/mes
- ✅ **Fácil Configuración** - Panel intuitivo
- ✅ **PostgreSQL Gratis** (o MySQL de pago)
- ✅ **Logs Integrados** - Fácil debugging
- ✅ **Variables de Entorno** - Gestión simple

#### **Estructura de Costos:**
```
Backend (Web Service - Starter):     $7/mes
Frontend (Static Site):              GRATIS
MySQL (Base de datos):               $20/mes  O alternativas:
  - JawsDB MySQL (Kinsta):           $5-15/mes
  - PlanetScale (MySQL compatible):  GRATIS (tier básico)
  - Aiven MySQL:                     $25/mes

TOTAL: $12-27/mes (dependiendo de BD elegida)
```

#### **Configuración:**
- **Backend:** Web Service → Node.js
- **Frontend:** Static Site → Vite build
- **Base de Datos:** MySQL externa (JawsDB recomendado) o PostgreSQL

#### **Límites del plan Starter:**
- **RAM:** 512 MB (suficiente)
- **CPU:** Compartido (suficiente para APIs REST)
- **Tráfico:** 100 GB/mes (suficiente)
- **Builds:** Ilimitados
- **Always On:** ✅ Sí (sin cold start)

**Puntuación:** ⭐⭐⭐⭐⭐ (5/5)

---

### Opción 2: Railway.app

#### **Ventajas:**
- ✅ **Fácil Despliegue** - Detecta automáticamente
- ✅ **MySQL Integrado** - Servicio incluido
- ✅ **Sin Configuración Compleja** - Zero-config
- ✅ **Escalado Automático** - Pay-per-use
- ✅ **GitHub Integration** - Despliegue automático

#### **Estructura de Costos:**
```
Backend (App):                       $5/mes + uso
Frontend (Static):                   $5/mes + uso
MySQL (Add-on):                      $5/mes + uso

TOTAL: ~$15-25/mes (pay-per-use, impredecible)
```

#### **Configuración:**
- Todo se detecta automáticamente
- MySQL como add-on del mismo proyecto
- Configuración mínima necesaria

#### **Desventajas:**
- ⚠️ **Costo Impredecible** - Pay-per-use puede subir
- ⚠️ **Cold Start Posible** - En tier gratuito

**Puntuación:** ⭐⭐⭐⭐ (4/5)

---

### Opción 3: Vercel (Frontend) + Railway (Backend)

#### **Ventajas:**
- ✅ **Vercel Excelente para React** - Optimizado para Vite
- ✅ **CDN Global** - Frontend ultra-rápido
- ✅ **Railway para Backend** - Buen soporte Node.js
- ✅ **Despliegue Automático** - Desde GitHub

#### **Estructura de Costos:**
```
Frontend (Vercel):                   GRATIS (Hobby) / $20/mes (Pro)
Backend (Railway):                   $5/mes + uso
MySQL (Railway Add-on):              $5/mes + uso

TOTAL: $10-30/mes
```

#### **Desventajas:**
- ⚠️ **Configuración Más Compleja** - Dos plataformas
- ⚠️ **CORS Necesario** - Configurar correctamente
- ⚠️ **Costo Variable** - En Railway

**Puntuación:** ⭐⭐⭐⭐ (4/5)

---

### Opción 4: DigitalOcean App Platform

#### **Ventajas:**
- ✅ **Control Total** - Más opciones de configuración
- ✅ **MySQL Gestionado** - Disponible como add-on
- ✅ **Escalable** - Crecimiento fácil
- ✅ **Predecible** - Precios fijos

#### **Estructura de Costos:**
```
Backend (Basic):                     $12/mes
Frontend (Static):                   $3/mes
MySQL (Managed Database):            $15/mes

TOTAL: ~$30/mes
```

#### **Desventajas:**
- ⚠️ **Más Caro** - Que las opciones anteriores
- ⚠️ **Configuración Manual** - Más trabajo inicial

**Puntuación:** ⭐⭐⭐ (3/5)

---

### Opción 5: AWS / Azure / Google Cloud

#### **Ventajas:**
- ✅ **Máxima Escalabilidad** - Crecimiento ilimitado
- ✅ **Servicios Avanzados** - CDN, Load Balancers, etc.
- ✅ **Infraestructura Global** - Múltiples regiones

#### **Desventajas:**
- ❌ **Muy Complejo** - Configuración avanzada necesaria
- ❌ **Costos Impredecibles** - Pay-per-use puede ser caro
- ❌ **Curva de Aprendizaje** - Requiere experiencia en cloud
- ❌ **Overkill** - Para un sistema de este tamaño

**Puntuación:** ⭐⭐ (2/5) - No recomendado para este proyecto

---

## 🏆 Recomendación Final: **Render.com**

### Razones de la Recomendación:

1. **✅ Sin Cold Start (CRÍTICO)**
   - El sistema ERP debe estar siempre disponible
   - Render mantiene los servicios activos 24/7
   - No hay esperas de 10-30 segundos al acceder

2. **✅ Precio Justo**
   - $7/mes backend + $0 frontend + $5-20/mes BD
   - Total: ~$12-27/mes (muy accesible)
   - Sin sorpresas en la factura

3. **✅ Fácil Configuración**
   - Panel intuitivo
   - Despliegue desde Git en 5 minutos
   - Variables de entorno simples

4. **✅ SSL Incluido**
   - Certificados automáticos y gratuitos
   - HTTPS sin configuración adicional

5. **✅ Soporte Adecuado**
   - 512 MB RAM suficiente para APIs REST
   - 100 GB tráfico/mes suficiente para uso normal
   - Logs integrados para debugging

---

## 📋 Configuración Detallada para Render.com

### Paso 1: Backend (Web Service)

**Configuración en Render Dashboard:**

```
Nombre: uit-backend
Entorno: Node
Branch: main (o tu rama principal)
Build Command: cd server && npm install
Start Command: cd server && npm start
Plan: Starter ($7/mes)
```

**Variables de Entorno:**
```env
NODE_ENV=production
DB_HOST=(host de tu MySQL)
DB_USER=(usuario MySQL)
DB_PASS=(contraseña MySQL)
DB_NAME=uit
PORT=5000
JWT_SECRET=(genera uno seguro con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

**Nota:** Render asigna un puerto automáticamente, el código ya usa `process.env.PORT || 5000` ✅

---

### Paso 2: Frontend (Static Site)

**Configuración en Render Dashboard:**

```
Nombre: uit-frontend
Entorno: Static Site
Branch: main
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Plan: Free (GRATIS)
```

**Variables de Entorno (en Build):**
```env
VITE_API_URL=https://uit-backend.onrender.com/api
```

**Nota:** Necesitarás modificar el código para usar `import.meta.env.VITE_API_URL` en lugar de `http://localhost:5000` hardcodeado. Esto se puede hacer después del primer despliegue.

---

### Paso 3: Base de Datos MySQL

**Opción A: JawsDB (Recomendada - Económica)**

- **Plataforma:** Kinsta (JawsDB)
- **Plan:** Tiny ($5/mes) o Small ($10/mes)
- **Incluye:** 5 GB almacenamiento, backups diarios
- **Configuración:** Copia las credenciales a las variables de entorno del backend

**Opción B: PlanetScale (Gratis para empezar)**

- **Plan:** Hobby (GRATIS)
- **Incluye:** 1 proyecto, 1 GB almacenamiento
- **Nota:** Compatible con MySQL, pero algunas diferencias menores

**Opción C: Render MySQL (Si usas Render completo)**

- **Plan:** $20/mes
- **Incluye:** Backups automáticos, alta disponibilidad

---

## 🔧 Pasos de Despliegue Paso a Paso

### Pre-Despliegue (Local)

1. **Verificar que todo funciona localmente** ✅ (Ya hecho)
2. **Crear archivo `.env.production` en frontend:**
   ```env
   VITE_API_URL=https://uit-backend.onrender.com/api
   ```
3. **Crear archivo `.env` en server/ (NO commitear a Git):**
   ```env
   DB_HOST=tu-mysql-host
   DB_USER=tu-usuario
   DB_PASS=tu-contraseña
   DB_NAME=uit
   PORT=5000
   JWT_SECRET=tu-jwt-secret-seguro
   NODE_ENV=production
   ```
4. **Verificar `.gitignore`:**
   - Asegurar que `.env` está en `.gitignore`
   - Verificar que `node_modules` está ignorado

---

### Despliegue en Render.com

#### 1. Crear Cuenta en Render
- Ir a https://render.com
- Registrarse con GitHub/GitLab/Bitbucket

#### 2. Conectar Repositorio Git
- Conectar tu repositorio del sistema
- Render detectará automáticamente el proyecto

#### 3. Crear Backend Service
- Click en "New" → "Web Service"
- Seleccionar tu repositorio
- Configurar:
  - **Name:** `uit-backend`
  - **Environment:** `Node`
  - **Build Command:** `cd server && npm install`
  - **Start Command:** `cd server && npm start`
  - **Plan:** `Starter` ($7/mes)
- Agregar variables de entorno (del `.env` pero sin el archivo)
- Click "Create Web Service"

#### 4. Crear Frontend Static Site
- Click en "New" → "Static Site"
- Seleccionar tu repositorio
- Configurar:
  - **Name:** `uit-frontend`
  - **Build Command:** `cd frontend && npm install && npm run build`
  - **Publish Directory:** `frontend/dist`
  - **Plan:** `Free`
- Agregar variable de entorno:
  - `VITE_API_URL` = `https://uit-backend.onrender.com/api`
- Click "Create Static Site"

#### 5. Crear/Configurar MySQL
- Opción A: Crear MySQL en JawsDB (https://www.jawsdb.com)
- Opción B: Usar PlanetScale (https://planetscale.com)
- Copiar credenciales y agregarlas al backend en Render

#### 6. Ejecutar Migraciones
- Conectar a la base de datos MySQL (usando credenciales)
- Ejecutar todas las migraciones:
  ```bash
  npm run migrate:all
  ```
  O ejecutar manualmente cada una:
  ```bash
  node src/scripts/migrate.js
  node src/scripts/migrateProduccion.js
  node src/scripts/migrateInventario.js
  node src/scripts/migrateReportesProduccion.js
  node src/scripts/migrateContabilidad.js
  ```

#### 7. Crear Usuarios Iniciales
- Ejecutar seeders:
  ```bash
  node src/seeders/seedMultipleUsers.js
  node src/seeders/crear-usuarios-produccion.js
  ```

#### 8. Verificar
- Abrir URL del frontend en Render
- Intentar login con credenciales
- Verificar que todas las rutas funcionan

---

## ⚠️ Consideraciones Importantes

### Seguridad

1. **JWT_SECRET:** Debe ser único y seguro (64+ caracteres aleatorios)
2. **Contraseñas:** Cambiar todas las contraseñas por defecto (`demo123`)
3. **CORS:** Verificar que está configurado correctamente para el dominio de producción
4. **HTTPS:** Render proporciona SSL automáticamente ✅

### Rendimiento

1. **Pool de Conexiones:** Ya está configurado a 10 (apropiado)
2. **Caché:** Considerar agregar Redis en el futuro si hay mucho tráfico
3. **CDN:** El frontend estático ya se sirve desde CDN en Render ✅

### Escalabilidad Futura

Si el sistema crece:
- **Render:** Fácil escalar a plan Professional ($25/mes)
- **MySQL:** Migrar a plan más grande
- **Cache:** Agregar Redis si es necesario
- **Load Balancing:** Render lo maneja automáticamente

---

## 📊 Comparativa Final de Plataformas

| Plataforma | Precio/mes | Cold Start | Facilidad | MySQL | SSL | Recomendación |
|------------|------------|------------|-----------|-------|-----|---------------|
| **Render.com** | $12-27 | ❌ No | ⭐⭐⭐⭐⭐ | ✅ Sí | ✅ Gratis | **🏆 MEJOR** |
| Railway.app | $15-25 | ⚠️ Posible | ⭐⭐⭐⭐ | ✅ Sí | ✅ Gratis | ⭐ Buena |
| Vercel+Railway | $10-30 | ⚠️ Posible | ⭐⭐⭐ | ✅ Sí | ✅ Gratis | ⭐ Buena |
| DigitalOcean | $30+ | ❌ No | ⭐⭐⭐ | ✅ Sí | ✅ Gratis | Regular |
| AWS/Azure/GCP | $20-50+ | ❌ No | ⭐⭐ | ✅ Sí | ⚠️ Manual | ⚠️ Complejo |

---

## ✅ Checklist Final

- [ ] Cuenta en Render.com creada
- [ ] Repositorio Git conectado
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y funcionando
- [ ] MySQL configurado y conectado
- [ ] Migraciones ejecutadas
- [ ] Usuarios creados (seeders)
- [ ] Variables de entorno configuradas
- [ ] SSL verificado (HTTPS)
- [ ] Login probado
- [ ] Módulos principales verificados
- [ ] Contraseñas por defecto cambiadas

---

## 🎯 Conclusión

**Render.com es la mejor opción para este sistema** porque:

1. ✅ **Sin cold start** - Crítico para un ERP siempre activo
2. ✅ **Precio justo** - $12-27/mes total
3. ✅ **Configuración simple** - Despliegue en minutos
4. ✅ **SSL incluido** - Sin costos adicionales
5. ✅ **Soporte adecuado** - Recursos suficientes para el sistema

**Estimación de tiempo de despliegue:** 30-60 minutos (primera vez)

**Costo mensual estimado:** $12-27 USD (dependiendo de la base de datos elegida)

---

**¿Listo para desplegar?** Sigue los pasos en "Configuración Detallada para Render.com" arriba. 🚀

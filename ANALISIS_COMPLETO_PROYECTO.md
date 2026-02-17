# 📊 Análisis Completo del Proyecto UIT-Master

**Fecha de Análisis:** 16 de Febrero, 2026  
**Versión del Sistema:** 1.0.0  
**Tipo de Proyecto:** ERP Textil - Sistema de Gestión Empresarial

---

## 🎯 Resumen Ejecutivo

**UIT-Master** es un sistema ERP (Enterprise Resource Planning) desarrollado específicamente para plantas textiles pequeñas y medianas. El sistema está diseñado para gestionar todos los aspectos operativos de una empresa textil, desde la producción hasta la contabilidad, pasando por inventario, mantenimiento y recursos humanos.

### Estado General del Proyecto
- ✅ **Frontend:** Completamente funcional y desplegado
- ✅ **Backend:** Completamente funcional y desplegado  
- ✅ **Base de Datos:** MySQL configurada y operativa
- ⚠️ **Algunas funcionalidades:** Pendientes de implementación completa

---

## 🏗️ Arquitectura del Sistema

### Estructura General

El proyecto está organizado en **3 componentes principales**:

```
UIT-master/
├── frontend/          # Aplicación React (Cliente)
├── backend/           # Backend alternativo (NO EN USO - Prisma + SQLite)
├── server/            # Backend activo (Express + MySQL)
└── [76 archivos .md] # Documentación extensa
```

### 1. Frontend (`frontend/`)

**Tecnologías:**
- **Framework:** React 18.2.0
- **Lenguaje:** TypeScript 5.2.2
- **Build Tool:** Vite 5.0.8
- **Estilos:** TailwindCSS 4.1.16
- **UI Components:** Radix UI (checkboxes, dialogs, selects, labels)
- **Estado:** Context API (11 contextos diferentes)
- **Routing:** React Router DOM 6.20.1
- **Gráficos:** Recharts 2.8.0
- **PDFs:** jsPDF 3.0.3 + html2canvas 1.4.1

**Estructura de Carpetas:**
```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes UI base (shadcn/ui)
│   │   ├── Mantenimiento/
│   │   └── User/
│   ├── pages/            # Páginas por módulo
│   │   ├── Administracion/
│   │   ├── Auth/
│   │   ├── Contabilidad/
│   │   ├── Gerencia/
│   │   ├── Ingenieria/
│   │   ├── Mantenimiento/
│   │   ├── Produccion/
│   │   └── Sistemas/
│   ├── context/          # Contextos de React (11 contextos)
│   ├── config/           # Configuración (API endpoints)
│   ├── constants/        # Constantes del sistema
│   ├── lib/             # Utilidades
│   └── data/            # Datos estáticos (módulos por rol)
├── public/              # Archivos estáticos
└── package.json
```

**Características del Frontend:**
- ✅ Diseño responsive con TailwindCSS
- ✅ Sistema de autenticación con JWT
- ✅ Rutas protegidas por rol
- ✅ Múltiples dashboards según rol
- ✅ Generación de PDFs para reportes
- ✅ Gráficos interactivos con Recharts
- ✅ Manejo de estado con Context API
- ✅ Componentes UI modernos (Radix UI)

### 2. Backend Activo (`server/`)

**Tecnologías:**
- **Framework:** Express.js 5.1.0
- **Lenguaje:** JavaScript ES6+ (ES Modules)
- **Base de Datos:** MySQL (mysql2 3.15.1)
- **Autenticación:** JWT (jsonwebtoken 9.0.2)
- **Seguridad:** bcrypt 6.0.0 (hashing de contraseñas)
- **Uploads:** Multer 2.0.2 (manejo de archivos)
- **Pool de Conexiones:** mysql2/promise (límite: 10 conexiones)

**Estructura de Carpetas:**
```
server/
├── src/
│   ├── config/          # Configuración (DB, etc.)
│   ├── controllers/     # 24 controladores
│   ├── routes/          # 24 rutas API
│   ├── middleware/      # Middleware (auth, etc.)
│   ├── scripts/         # Scripts de migración
│   ├── seeders/         # Datos iniciales
│   └── utils/           # Utilidades
├── package.json
└── .env                 # Variables de entorno
```

**Endpoints API Principales:**
- `/api/auth` - Autenticación
- `/api/users` - Gestión de usuarios
- `/api/roles` - Gestión de roles
- `/api/departamentos` - Departamentos
- `/api/configuracion` - Configuración del sistema
- `/api/configuracion/facturas` - Configuración de facturas
- `/api/logs` - Logs del sistema
- `/api/equipos` - Equipos de mantenimiento
- `/api/ordenes` - Órdenes de trabajo
- `/api/repuestos` - Repuestos
- `/api/calendario` - Calendario de mantenimiento
- `/api/produccion` - Producción
- `/api/reportes-produccion` - Reportes de producción
- `/api/inventario` - Inventario
- `/api/contabilidad` - Contabilidad
- `/api/incidencias` - Incidencias
- `/api/flujos-salida` - Flujos de salida
- `/api/flujos-ingreso` - Flujos de ingreso
- `/api/trabajadores` - Trabajadores
- `/api/asistencia` - Asistencia

**Características del Backend:**
- ✅ Pool de conexiones MySQL optimizado
- ✅ Middleware de autenticación JWT
- ✅ Validación de datos con Joi
- ✅ Manejo de errores centralizado
- ✅ Sistema de logs implementado
- ✅ Soporte para SSL en conexiones DB
- ✅ Migraciones de base de datos
- ✅ Seeders para datos iniciales

### 3. Backend Alternativo (`backend/`) - ⚠️ NO EN USO

**Tecnologías:**
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **ORM:** Prisma 5.7.1
- **Base de Datos:** SQLite (según schema.prisma)

**Estado:** Este backend parece ser una versión anterior o de referencia. No se está utilizando en producción. El backend activo está en `server/`.

---

## 👥 Sistema de Roles y Permisos

El sistema maneja **7 roles principales**:

### 1. **administrador**
- Acceso completo al sistema
- Gestión de usuarios y configuración
- Reportes administrativos
- Dashboard administrativo

### 2. **sistemas**
- Gestión de usuarios
- Configuración del sistema
- Visualización de logs
- Gestión de incidencias
- Dashboard de sistemas

### 3. **mantenimiento**
- Gestión de equipos
- Órdenes de trabajo
- Repuestos
- Calendario de mantenimiento
- Dashboard de mantenimiento

### 4. **contabilidad**
- Dashboard de contabilidad
- Finanzas
- Facturación
- Reportes contables
- Gestión de registros financieros

### 5. **gerencia**
- Solo visualización (read-only)
- KPIs y gráficos de Producción
- Métricas de Inventario
- Gráficos por departamento
- Distribución de categorías
- ⚠️ Ventas pendiente de implementar con datos reales

### 6. **ingenieria**
- Dashboard de ingeniería
- Producción (enviar reportes a usuarios)
- Reportes e historial
- Inventario
- Reportes por usuarios
- ⚠️ Flujo de Ingreso (frontend completo, backend pendiente)
- ⚠️ Flujo de Salida (frontend completo, backend pendiente)

### 7. **usuarios** (producción)
- Dashboard personal
- Mi Producción (ver reportes recibidos)
- Descargar PDFs de reportes
- Perfil de usuario

---

## 📁 Módulos Funcionales

### ✅ Módulos Completamente Funcionales

#### 1. **Autenticación y Autorización**
- ✅ Login con JWT
- ✅ Middleware de autenticación
- ✅ Sistema de roles y permisos
- ✅ Rutas protegidas por rol
- ✅ Redirección automática según rol
- ✅ Tokens JWT con expiración
- ✅ Protección de rutas en frontend y backend

#### 2. **Administración**
- ✅ Dashboard administrativo con KPIs
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Configuración del sistema
- ✅ Reportes administrativos
- ✅ Visualización de actividad del sistema

#### 3. **Sistemas**
- ✅ Dashboard de sistemas
- ✅ Gestión de incidencias
- ✅ Gestión de usuarios
- ✅ Configuración avanzada
- ✅ Visualización de logs del sistema
- ✅ Filtros y búsqueda de logs

#### 4. **Mantenimiento**
- ✅ Dashboard de mantenimiento
- ✅ Gestión de equipos (CRUD completo)
- ✅ Órdenes de trabajo (CRUD completo)
- ✅ Gestión de repuestos
- ✅ Calendario de mantenimiento preventivo
- ✅ Relación entre equipos, órdenes y repuestos

#### 5. **Contabilidad**
- ✅ Dashboard de contabilidad
- ✅ Gestión de finanzas (ingresos/egresos/gastos)
- ✅ Sistema de facturación completo
- ✅ Configuración de facturas (empresa, logo, IGV)
- ✅ Generación de PDFs de facturas
- ✅ Reportes contables
- ✅ Aprobación de registros financieros

#### 6. **Gerencia**
- ✅ Dashboard con KPIs en tiempo real
- ✅ Producción: gráficos diarios/semanales/mensuales
- ✅ Producción: efectividad por usuario
- ✅ Inventario: métricas y gráficos
- ✅ Inventario: distribución por departamento
- ✅ Inventario: distribución de categorías
- ⚠️ Ventas: página existe pero muestra datos mock

#### 7. **Ingeniería**
- ✅ Dashboard de ingeniería
- ✅ Producción: enviar reportes a usuarios
- ✅ Reportes e historial completo
- ✅ Inventario completo
- ✅ Reportes por usuarios
- ⚠️ Flujo de Ingreso: frontend completo, backend pendiente
- ⚠️ Flujo de Salida: frontend completo, backend pendiente

#### 8. **Producción (Usuarios)**
- ✅ Dashboard personal
- ✅ Mi Producción: ver reportes recibidos
- ✅ Descarga de PDFs de reportes
- ✅ Perfil de usuario
- ✅ Visualización de reportes asignados

#### 9. **Reportes de Producción**
- ✅ Envío de reportes desde Ingeniería
- ✅ Recepción por usuarios de Producción
- ✅ Visualización de reportes
- ✅ Descarga de PDFs
- ✅ Estadísticas para Gerencia

#### 10. **Trabajadores y Asistencia**
- ✅ Gestión de trabajadores
- ✅ Sistema de asistencia
- ✅ Registro de entrada/salida
- ✅ Reportes de asistencia

---

## 🔴 Funcionalidades Pendientes

### Prioridad Alta

#### 1. **Flujo de Ingreso** (Módulo Ingeniería)
**Estado:** Frontend 100% completo, Backend pendiente

**Datos que captura:**
- Fecha
- Línea de producción
- Ficha
- OP (Orden de Producción)
- Cliente
- Estilo del cliente
- Color
- Prendas
- T_STD
- Estatus
- Observaciones

**Filtros disponibles:**
- Línea
- Año
- Mes
- Semana

**Acción necesaria:**
- ✅ Tabla `flujo_ingreso` existe (según migraciones)
- ✅ Controlador `flujosIngresoController.js` existe
- ✅ Rutas `/api/flujos-ingreso` existen
- ⚠️ Verificar conexión frontend-backend

#### 2. **Flujo de Salida** (Módulo Ingeniería)
**Estado:** Frontend 100% completo, Backend pendiente

**Datos que captura:**
- Año, Mes, Semana, Día
- Fecha
- Línea de producción
- Ficha
- Prendas enviadas
- T.ST
- Estatus
- Observaciones
- Bajada

**Filtros disponibles:**
- Línea, Año, Mes, Semana, Día

**Acción necesaria:**
- ✅ Tabla `flujo_salida` existe (según migraciones)
- ✅ Controlador `flujosSalidaController.js` existe
- ✅ Rutas `/api/flujos-salida` existen
- ⚠️ Verificar conexión frontend-backend

### Prioridad Media

#### 3. **Gerencia - Ventas**
**Estado:** Página existe pero muestra datos mock o está vacía

**Acción necesaria:**
- Definir qué datos de ventas necesita Gerencia
- Crear endpoints en backend
- Conectar con datos reales de facturas/ventas

---

## 🗄️ Base de Datos

### Motor de Base de Datos
- **Tipo:** MySQL 8.0+
- **Pool de Conexiones:** 10 conexiones máximas
- **Soporte SSL:** Configurable vía variables de entorno

### Tablas Principales

#### Autenticación y Usuarios
1. **`roles`** - Roles del sistema
   - id, nombre, descripcion, dashboard_path, timestamps

2. **`usuarios`** - Usuarios con autenticación
   - id (UUID), email, password (bcrypt), nombre_completo, rol_id, departamento, avatar, is_active, last_login, timestamps

3. **`departamentos`** - Departamentos de la empresa
   - id, nombre, descripcion, timestamps

#### Inventario y Productos
4. **`productos`** - Catálogo de productos
   - id (UUID), sku, nombre, descripcion, tipo_material, unidad_medida, costo_estandar, is_activo, timestamps

5. **`inventario`** - Movimientos de inventario
   - id, producto_id, almacen_id, cantidad, tipo_movimiento, referencia, fecha_movimiento

#### Configuración
6. **`configuracion_empresa`** - Configuración general
   - id, nombre_empresa, direccion, telefono, email, logo_url, timestamps

#### Sistemas
7. **`incidencias`** - Sistema de incidencias
   - id, titulo, descripcion, tipo, prioridad, estado, usuario_id, timestamps

8. **`logs`** - Logs del sistema
   - id, nivel, mensaje, modulo, usuario_id, ip_address, timestamps

#### Mantenimiento
9. **`equipos`** - Equipos de mantenimiento
   - id, nombre, tipo, marca, modelo, numero_serie, ubicacion, estado, fecha_instalacion, timestamps

10. **`repuestos`** - Repuestos
    - id, nombre, descripcion, codigo, cantidad_disponible, precio_unitario, proveedor, timestamps

11. **`ordenes_trabajo`** - Órdenes de trabajo
    - id, equipo_id, tipo, descripcion, prioridad, estado, fecha_inicio, fecha_fin, tecnico_asignado, timestamps

12. **`ot_repuestos`** - Relación OT-Repuestos
    - id, orden_trabajo_id, repuesto_id, cantidad_usada

13. **`calendario_mantenimiento`** - Calendario de mantenimiento
    - id, equipo_id, tipo_mantenimiento, fecha_programada, fecha_realizada, estado, observaciones, timestamps

#### Producción
14. **`lineas_produccion`** - Líneas de producción
    - id, nombre, descripcion, estado, capacidad, timestamps

15. **`reportes_diarios`** - Reportes de producción diarios
    - id, linea_produccion_id, fecha, usuario_id, datos_produccion (JSON), timestamps

16. **`pedidos_produccion`** - Pedidos de producción
    - id, cliente, producto, cantidad, fecha_entrega, estado, prioridad, timestamps

17. **`reportes_produccion`** - Reportes de producción
    - id, usuario_id, fecha, datos (JSON), enviado_a, timestamps

#### Contabilidad
18. **`registros_financieros`** - Registros financieros
    - id (UUID), tipo (ingreso/egreso/gasto), categoria, monto, descripcion, fecha, usuario_id, aprobado_por, status, referencia, timestamps

19. **`configuracion_facturas`** - Configuración de facturas
    - id, nombre_empresa, direccion_empresa, ruc_empresa, logo_url, info_pago, notas_pie, igv_porcentaje, timestamps

20. **`facturas`** - Facturas
    - id (UUID), referencia, fecha_emision, cliente_nombre, cliente_direccion, cliente_identificacion, subtotal, igv, total, status, user_id, timestamps

21. **`factura_items`** - Items de factura
    - id, factura_id, item_descripcion, cantidad, precio_unitario, subtotal_item

#### Flujos (Pendientes de verificar)
22. **`flujo_ingreso`** - Registros de flujo de ingreso
    - (Estructura según migraciones)

23. **`flujo_salida`** - Registros de flujo de salida
    - (Estructura según migraciones)

#### Trabajadores
24. **`trabajadores`** - Trabajadores
    - id, nombre_completo, documento, departamento, area, cargo, fecha_ingreso, estado, timestamps

25. **`asistencia`** - Asistencia de trabajadores
    - id, trabajador_id, fecha, hora_entrada, hora_salida, tipo_asistencia, observaciones, timestamps

---

## 🔧 Configuración Técnica

### Variables de Entorno (Backend - `server/.env`)

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=uit
# O usar DB_URL para conexión completa
# DB_URL=mysql://user:pass@host:port/database

# SSL (opcional)
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

# Servidor
PORT=5000

# JWT
JWT_SECRET=uit_master_secret_123

# Otros
NODE_ENV=development
```

### Variables de Entorno (Frontend)

```env
VITE_API_URL=http://localhost:5000/api
# O en producción:
# VITE_API_URL=https://uit-backend.onrender.com/api
```

### Puertos por Defecto

- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000` (Vite dev server)
- **MySQL:** `localhost:3306`

### Scripts Disponibles

**Raíz del proyecto:**
```json
{
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd backend && npm run dev",
  "client": "cd frontend && npm run dev",
  "build": "cd frontend && npm run build",
  "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install"
}
```

**Backend (`server/`):**
```json
{
  "dev": "nodemon --watch src --exec \"node --experimental-modules src/index.js\"",
  "start": "node src/index.js",
  "migrate": "node src/scripts/migrate.js",
  "migrate:all": "node runAllMigrations.js",
  "seed:all": "node runAllSeeders.js"
}
```

**Frontend (`frontend/`):**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
}
```

---

## 📦 Dependencias Principales

### Frontend
- **react** ^18.2.0
- **react-dom** ^18.2.0
- **react-router-dom** ^6.20.1
- **typescript** ^5.2.2
- **vite** ^5.0.8
- **tailwindcss** ^3.4.18
- **@tailwindcss/vite** ^4.1.16
- **recharts** ^2.8.0
- **jspdf** ^3.0.3
- **html2canvas** ^1.4.1
- **lucide-react** ^0.548.0
- **@radix-ui/react-*** (varios componentes)

### Backend (`server/`)
- **express** ^5.1.0
- **mysql2** ^3.15.1
- **jsonwebtoken** ^9.0.2
- **bcrypt** ^6.0.0
- **cors** ^2.8.5
- **dotenv** ^17.2.3
- **multer** ^2.0.2
- **uuid** ^13.0.0
- **nodemon** ^3.1.10 (dev)

---

## 🚀 Despliegue

### Estado Actual de Despliegue

Según la documentación encontrada:

- ✅ **Frontend:** Desplegado en Render (Static Site)
  - URL: `https://uit-frontend.onrender.com`

- ✅ **Backend:** Desplegado en Render (Web Service)
  - URL: `https://uit-backend.onrender.com`

- ✅ **Base de Datos:** MySQL en Railway
  - Host: `metro.proxy.rlwy.net:25047`

### Plataformas de Hosting Consideradas

El proyecto tiene documentación extensa sobre:
- Render.com (seleccionado)
- Railway.app (para MySQL)
- JawsDB (alternativa MySQL)
- PlanetScale (alternativa MySQL)

---

## 📚 Documentación

El proyecto incluye **76 archivos Markdown** con documentación extensa sobre:

- Guías de instalación
- Guías de despliegue paso a paso
- Configuración de variables de entorno
- Guías de migración de base de datos
- Solución de problemas comunes
- Análisis del sistema
- Características y funcionalidades
- Reportes de testing
- Guías de uso por módulo

---

## ✅ Fortalezas del Sistema

1. ✅ **Arquitectura bien estructurada** - Separación clara frontend/backend
2. ✅ **Sistema de autenticación robusto** - JWT con roles y permisos
3. ✅ **Múltiples roles** - 7 roles con permisos específicos
4. ✅ **Interfaz moderna** - TailwindCSS responsive
5. ✅ **Gestión de estado** - Context API bien implementado
6. ✅ **Rutas protegidas** - Por rol en frontend y backend
7. ✅ **Generación de PDFs** - Para reportes y facturas
8. ✅ **Dashboards funcionales** - Con datos reales en varios módulos
9. ✅ **Sistema de logging** - Implementado para auditoría
10. ✅ **Manejo de errores** - En frontend y backend
11. ✅ **Pool de conexiones** - Optimizado para MySQL
12. ✅ **Migraciones** - Sistema de migraciones de BD
13. ✅ **Seeders** - Datos iniciales configurables

---

## ⚠️ Áreas de Mejora

### Prioridad Alta

1. **Completar Flujo de Ingreso y Salida**
   - Frontend completo, verificar backend
   - Conectar frontend con endpoints

2. **Implementar Ventas para Gerencia**
   - Definir métricas necesarias
   - Crear endpoints
   - Conectar con datos reales

### Prioridad Media

3. **Consolidar Backends**
   - El backend en `backend/` no se usa
   - Considerar eliminar o documentar claramente

4. **Validación de Datos**
   - Implementar validación más robusta en backend
   - Validar datos antes de insertar en BD

5. **Manejo de Errores**
   - Mejorar mensajes de error al usuario
   - Implementar logging más detallado

### Prioridad Baja

6. **Testing**
   - No se observan tests unitarios ni de integración
   - Considerar agregar tests para funcionalidades críticas

7. **Documentación de API**
   - Falta documentación de endpoints
   - Considerar Swagger/OpenAPI

8. **Optimización**
   - Revisar consultas SQL para optimización
   - Considerar índices en tablas grandes
   - Implementar paginación donde sea necesario

---

## 📊 Estadísticas del Proyecto

### Archivos y Código

- **Total de archivos Markdown:** 76
- **Backend activo:** `server/` con ~58 archivos fuente
- **Frontend:** ~85 archivos fuente
- **Controladores:** 24
- **Rutas API:** 24
- **Contextos React:** 11
- **Páginas principales:** ~30+

### Base de Datos

- **Tablas principales:** ~25 tablas
- **Pool de conexiones:** 10 conexiones máximas
- **Motor:** MySQL 8.0+

### Tecnologías

- **Lenguajes:** TypeScript (frontend), JavaScript (backend)
- **Frameworks:** React 18, Express 5
- **Base de Datos:** MySQL
- **Estilos:** TailwindCSS
- **Autenticación:** JWT

---

## 🎯 Recomendaciones

### Inmediatas

1. **Verificar Flujos de Ingreso y Salida**
   - Aunque los endpoints existen, verificar que funcionen correctamente
   - Probar desde el frontend

2. **Implementar Ventas para Gerencia**
   - Conectar con datos de facturas existentes
   - Crear métricas relevantes

### Corto Plazo

3. **Eliminar o Documentar Backend No Usado**
   - Decidir sobre `backend/` (Prisma + SQLite)
   - Si no se usa, eliminarlo o documentarlo claramente

4. **Mejorar Validación**
   - Agregar validación robusta en todos los endpoints
   - Usar Joi o similar consistentemente

### Mediano Plazo

5. **Agregar Testing**
   - Tests unitarios para controladores críticos
   - Tests de integración para flujos principales

6. **Documentar API**
   - Swagger/OpenAPI para documentación automática
   - Ejemplos de uso

7. **Optimización**
   - Revisar índices en BD
   - Implementar paginación
   - Optimizar consultas SQL

---

## 📝 Notas Finales

- El sistema está **funcionalmente completo** en su mayoría
- La arquitectura es **sólida y escalable**
- El código está **bien organizado** y estructurado
- Hay **documentación extensa** (76 archivos MD)
- El sistema está **desplegado y funcionando** en producción
- Algunas funcionalidades menores están **pendientes** pero no bloquean el uso

---

**Análisis generado el:** 16 de Febrero, 2026  
**Versión del análisis:** 1.0.0

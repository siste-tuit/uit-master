## Sistema UIT-MASTER – ERP Textil / Planta Industrial

Sistema de gestión interno para una planta textil / industrial, con módulos de
producción, mantenimiento, contabilidad, sistemas, gerencia y administración.

Este repositorio contiene:

- **frontend/**: Aplicación React (Vite + TypeScript + Tailwind + Radix UI).
- **server/**: **Backend principal en uso** (Node.js + Express + MySQL).
- **backend/**: Backend alternativo/legacy (Node.js + Express + TypeScript + Prisma).
- Múltiples guías `.md` para despliegue en Render, Railway, JawsDB, etc.

---

## Tecnologías principales

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI.
- **Backend en uso**: Node.js, Express, MySQL2, JWT, bcrypt, migraciones y seeders propios (`server/`).
- **Backend alternativo**: Node.js, Express, TypeScript, Prisma (`backend/`, orientado a PostgreSQL/SQLite).
- **Autenticación**: JWT.

---

## Estructura del proyecto

```txt
UIT-master/
├── frontend/          # Aplicación React (Vite + TS)
├── server/            # API principal (Express + MySQL)
├── backend/           # API alternativa (Express + Prisma)
├── docker-compose.yml # Stack legacy para backend/ + PostgreSQL
└── *.md               # Guías de instalación y despliegue
```

---

## Instalación

### Prerrequisitos

- Node.js 18+
- MySQL (por ejemplo MySQL 8 o compatible)
- npm

### 1. Clonar repositorio

```bash
git clone <tu-repositorio>
cd "UIT-master"
```

### 2. Instalar dependencias

```bash
# Instala dependencias raíz, server y backend (legacy) y frontend
npm run install-all
```

---

## Configuración de entorno (desarrollo)

Para evitar credenciales en claro, el script `INICIAR_SISTEMA.ps1` ahora lee
variables desde un archivo `.env.local` en la raíz del proyecto.

1. Crea un archivo `.env.local` en la raíz (`UIT-master/.env.local`).
2. Añade como mínimo:

```bash
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASS=tu_password_mysql
DB_NAME=uit
PORT=5000
JWT_SECRET=una_clave_secreta_segura

VITE_API_URL=http://localhost:5000/api
```

> **Importante**: `.env.local` **no debe subirse a Git**. Añádelo a tu `.gitignore`
> si aún no lo está.

---

## Ejecución en desarrollo

### Opción recomendada (Windows – script)

Usa el script preparado que levanta backend (`server/`) y frontend:

```powershell
.\INICIAR_SISTEMA.ps1
```

Esto:

- Carga variables desde `.env.local` (si existe).
- Arranca `server/` en el puerto definido por `PORT` (por defecto `5000`).
- Arranca `frontend/` en el puerto `3000` (configurado en `vite.config.ts`).

### Opción usando npm scripts

Con las variables de entorno configuradas (por `.env.local` o desde tu shell):

```bash
# Backend principal (server/) + Frontend
npm run dev

# Solo backend principal (server/)
npm run server

# Solo frontend
npm run client
```

### Backend alternativo (Prisma, opcional)

Si quieres probar el backend alternativo del directorio `backend/`:

```bash
npm run server:prisma
```

> Este backend está orientado a PostgreSQL/SQLite y puede usar `docker-compose`
> según la configuración legacy del archivo `docker-compose.yml`.

---

## Módulos funcionales principales

En el sistema actual (backend `server/` + frontend `frontend/`) tienes, entre otros:

- **Administración**: configuración general, usuarios, reportes.
- **Sistemas**: incidencias, flujos, asistencia global, logs, gestión de usuarios.
- **Ingeniería**: producción, fichas de ingreso/salida, inventario, reportes.
- **Mantenimiento**: equipos, órdenes de trabajo, repuestos, calendario.
- **Contabilidad**: dashboard, planilla, inventario, facturas.
- **Producción (usuarios)**: dashboard personal, asistencia, perfil, etc.

---

## Documentación clave

En la raíz hay varias guías `.md` para instalación y despliegue. Algunas de las
más relevantes son:

- `RESUMEN_INSTALACION.md`: resumen general del proceso de instalación.
- `EJECUTAR_SISTEMA.md`: pasos para ejecutar el sistema completo.
- `GUIA_DESPLEGUE_PASO_A_PASO.md`: guía detallada de despliegue.
- `DESPLIEGUE_COMPLETO.md`: visión global del despliegue.
- `CONFIGURAR_VARIABLES_RENDER.md`, `CONFIGURAR_BACKEND_RENDER.md`,
  `DESPLEGAR_FRONTEND_RENDER.md`: configuración para Render.
- `GUIA_RAILWAY_MYSQL_PASO_A_PASO.md`, `GUIA_JAWSDB_PASO_A_PASO.md`:
  opciones económicas en la nube para MySQL.

Revisa también:

- `CREDENCIALES_USUARIOS.md`: usuarios y roles configurados en el sistema.
- `TESTING_COMPLETO.md`, `REPORTE_TESTING_FINAL.md`: pruebas realizadas.

---

## Licencia

MIT License - ver archivo `LICENSE` para detalles.

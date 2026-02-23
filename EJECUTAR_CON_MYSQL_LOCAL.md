# Ejecutar el sistema con MySQL local

Usa esta guía cuando quieras probar todo en tu PC con **tu MySQL instalado**, sin depender de Railway ni de la contraseña de railway-backend.

---

## 1. Crear la base de datos en MySQL

Abre MySQL (línea de comandos, MySQL Workbench o phpMyAdmin) y ejecuta:

```sql
CREATE DATABASE uit;
```

(O el nombre que prefieras; tendrás que usarlo en el paso 2 como `DB_NAME`.)

---

## 2. Configurar variables de entorno (un solo archivo)

En la **raíz del proyecto** (`D:\Empresa UIT\UIT-master`) crea el archivo **`.env.local`** con el contenido siguiente. Sustituye la contraseña y el nombre de la BD si son distintos:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=TU_CONTRASEÑA_DE_MYSQL_LOCAL
DB_NAME=uit
PORT=5000
JWT_SECRET=clave_secreta_local_cambiar_en_produccion

VITE_API_URL=http://localhost:5000/api
```

- **DB_PASS**: la contraseña del usuario `root` (o el usuario que uses) de tu MySQL instalado en tu PC.
- **DB_NAME**: debe coincidir con la base que creaste (por ejemplo `uit`).

No hace falta `DB_SSL` para MySQL local (o pon `DB_SSL=false`).

---

## 3. Ejecutar migraciones (crear tablas)

En una terminal, desde la **raíz del proyecto**:

```bash
cd server
npm run migrate:all
```

Debes ver mensajes de migraciones correctas. Si aparece error de conexión, revisa usuario/contraseña y que MySQL esté en ejecución.

---

## 4. Ejecutar seeders (datos y usuarios iniciales)

En la misma carpeta `server/`:

```bash
npm run seed:all
```

Con esto se crean roles, departamentos, configuración y **usuarios para poder iniciar sesión**.

---

## 5. Iniciar el sistema

Desde la **raíz del proyecto** (`D:\Empresa UIT\UIT-master`):

**Opción A – Script de Windows**

```powershell
.\INICIAR_SISTEMA.ps1
```

**Opción B – npm**

```bash
npm run dev
```

Se levantarán el backend (puerto 5000) y el frontend (puerto 3000).

---

## 6. Iniciar sesión en local

Abre en el navegador: **http://localhost:3000**

Puedes usar los usuarios creados por los seeders. Contraseña por defecto en muchos casos: **`demo123`**.

Ejemplos de correos (según los seeders del proyecto):

- `admin@textil.com` (administrador)
- `ingenieria@textil.com`
- `sistemas@textil.com`
- `gerencia@textil.com`
- etc.

Si no recuerdas las contraseñas exactas, revisa el archivo **`CREDENCIALES_USUARIOS.md`** en la raíz del proyecto (ahí se documentan las que se hayan definido).

---

## Resumen rápido

| Paso | Acción |
|------|--------|
| 1 | Crear BD `uit` en tu MySQL local |
| 2 | Crear `.env.local` en la raíz con tu usuario/contraseña y `DB_NAME=uit` |
| 3 | `cd server` → `npm run migrate:all` |
| 4 | `npm run seed:all` (en `server/`) |
| 5 | Desde raíz: `.\INICIAR_SISTEMA.ps1` o `npm run dev` |
| 6 | Abrir http://localhost:3000 e iniciar sesión (ej. `admin@textil.com` / `demo123` o ver `CREDENCIALES_USUARIOS.md`) |

Cuando quieras desplegar a la red, en el servidor (por ejemplo Render) configuras las variables de entorno con la base de datos de producción (Railway u otra) y no usas `.env.local` en producción.

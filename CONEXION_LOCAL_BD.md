# Conexión local: usar Railway MySQL o MySQL en tu PC

Si la app corre en local pero **no puedes iniciar sesión**, suele ser porque el backend no se conecta a la base de datos. Tienes dos caminos:

---

## Opción A: Conectar tu PC a Railway MySQL

Railway expone MySQL por **TCP Proxy** (ej. `metro.proxy.rlwy.net:25047`). El error *"Lost connection at reading initial communication packet"* en MySQL Workbench suele deberse a:

1. **Contraseña incorrecta** (cópiala de nuevo desde Railway → Variables).
2. **Conexión sin SSL** cuando Railway la exige, o al revés.

### Pasos para que funcione tu backend en local con Railway

1. **En Railway** (tu proyecto → servicio MySQL):
   - Pestaña **Variables** (o **Connect**).
   - Anota: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`.
   - Si aparece **`MYSQL_URL`** o **`DATABASE_PUBLIC_URL`**, esa URL es la que debes usar desde fuera de Railway.

2. **En la raíz del proyecto** (`UIT-master`), crea o edita **`.env.local`** con una de estas dos formas:

   **Forma 1 – Con URL completa (recomendada si Railway te la da):**
   ```env
   DB_URL=mysql://MYSQLUSER:MYSQLPASSWORD@metro.proxy.rlwy.net:25047/MYSQLDATABASE
   DB_SSL=true
   PORT=5000
   JWT_SECRET=una_clave_secreta_segura
   ```
   Sustituye `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE` por los valores reales. Si la contraseña tiene caracteres especiales, codifícala en URL (ej. `@` → `%40`).

   **Forma 2 – Con variables sueltas:**
   ```env
   DB_HOST=metro.proxy.rlwy.net
   DB_PORT=25047
   DB_USER=root
   DB_PASS=tu_password_copiado_de_railway
   DB_NAME=railway
   DB_SSL=true
   PORT=5000
   JWT_SECRET=una_clave_secreta_segura
   ```
   (Ajusta `DB_NAME` al nombre real de la base en Railway; a veces es `railway` o el que muestre `MYSQLDATABASE`.)

3. **Reinicia el backend** (y si usas el script, ejecuta de nuevo `.\INICIAR_SISTEMA.ps1` o `npm run dev` desde la raíz).

4. **MySQL Workbench (opcional):**
   - Connection Method: **Standard (TCP/IP)**.
   - Host: `metro.proxy.rlwy.net`, Port: `25047`.
   - Usuario y contraseña exactos de Railway.
   - En **Connection** → **SSL**: probar primero **"Use SSL if available"** o **"Require SSL"** si falla sin SSL.

Si tras esto sigue sin conectar, es posible que tu red o firewall bloqueen el puerto; en ese caso usa la Opción B.

---

## Opción B: Usar MySQL solo en tu PC (recomendado para desarrollo)

Así no dependes de Railway ni de la red para trabajar en local.

1. **Instalar MySQL en tu PC**
   - [MySQL Community](https://dev.mysql.com/downloads/installer/) (Windows), o
   - XAMPP (incluye MySQL), o
   - Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=local123 mysql:8`

2. **Crear la base de datos y tablas**
   - Abre una terminal en la raíz del proyecto.
   - Crea la base (en MySQL o phpMyAdmin):
     ```sql
     CREATE DATABASE uit;
     ```
   - En `server/` ejecuta las migraciones:
     ```bash
     cd server
     npm run migrate:all
     ```
   - Luego los seeders (usuarios iniciales, etc.):
     ```bash
     npm run seed:all
     ```

3. **Configurar `.env.local` en la raíz** para apuntar a tu MySQL local:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=local123
   DB_NAME=uit
   PORT=5000
   JWT_SECRET=una_clave_secreta_segura
   ```
   (Sin `DB_SSL` o `DB_SSL=false` para MySQL local.)

4. **Variable para el frontend** (en la raíz o en `frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Arrancar todo desde la raíz:**
   ```bash
   npm run dev
   ```
   o, en Windows, `.\INICIAR_SISTEMA.ps1` si usa `.env.local`.

Con esto deberías poder iniciar sesión en local. Los usuarios los defines con los seeders (por ejemplo el admin que crea `seedAdmin.js`).

---

## Resumen

| Objetivo              | Qué hacer |
|-----------------------|-----------|
| Usar Railway desde PC | `.env.local` con `DB_URL` o `DB_HOST`/`DB_PORT`/… de Railway, `DB_SSL=true`, reiniciar backend. |
| Desarrollar sin red   | MySQL local + migraciones + seeders + `.env.local` con `localhost` y `DB_NAME=uit`. |

Si el backend arranca sin errores pero el login sigue fallando, revisa que existan usuarios en la tabla `usuarios` (ejecutando los seeders).

# 🚀 PASO A PASO EN RENDER - SIMPLIFICADO

## 📋 ORDEN DE CREACIÓN

1. **MySQL Database** (PRIMERO - necesitamos la URL de conexión)
2. **Backend (Web Service)** (SEGUNDO - necesita la URL de la DB)
3. **Frontend (Static Site)** (TERCERO - necesita la URL del backend)

---

## 🗄️ PASO 1: CREAR MYSQL DATABASE

1. En la página que estás viendo, busca **"Postgres"** o **"MySQL"**
2. Si no ves MySQL, haz click en **"+ New"** (arriba a la derecha) → **"Database"**
3. Selecciona **"MySQL"**
4. Configuración:
   - **Name:** `uit-database` (o el nombre que quieras)
   - **Database:** `uit` (nombre de la base de datos)
   - **User:** (se genera automático)
   - **Region:** El más cercano a ti
   - **Plan:** `Free` (para empezar)
5. Click **"Create Database"**
6. ⚠️ **IMPORTANTE:** Espera a que se cree y **COPIA la "Internal Database URL"** (la necesitarás después)

---

## ⚙️ PASO 2: CREAR BACKEND (WEB SERVICE)

1. Click en **"Web Services"** (el card con el icono de globo)
2. O click en **"+ New"** → **"Web Service"**
3. Conecta con GitHub:
   - Click **"Connect GitHub"** o **"Connect account"**
   - Autoriza Render
   - Selecciona el repositorio: **`siste-tuit/uit-master`**
4. Configuración:
   - **Name:** `uit-backend` (o el nombre que quieras)
   - **Region:** El mismo que elegiste para la DB
   - **Branch:** `main`
   - **Root Directory:** `server` (IMPORTANTE)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (para empezar)
5. **Environment Variables** (click en "Advanced"):
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=(copia de Internal Database URL)
   DB_USER=(copia de Internal Database URL)
   DB_PASS=(copia de Internal Database URL)
   DB_NAME=uit
   JWT_SECRET=tu_secreto_super_seguro_aqui_cambialo
   ```
6. Click **"Create Web Service"**

---

## 🎨 PASO 3: CREAR FRONTEND (STATIC SITE)

1. Click en **"Static Sites"** (el card con el icono de monitor)
2. O click en **"+ New"** → **"Static Site"**
3. Conecta con GitHub:
   - Selecciona el repositorio: **`siste-tuit/uit-master`**
4. Configuración:
   - **Name:** `uit-frontend` (o el nombre que quieras)
   - **Branch:** `main`
   - **Root Directory:** `frontend` (IMPORTANTE)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist` (IMPORTANTE)
5. **Environment Variables** (click en "Advanced"):
   ```
   VITE_API_URL=https://tu-backend-url.onrender.com/api
   ```
   (Reemplaza `tu-backend-url` con la URL que Render te dé para el backend)
6. Click **"Create Static Site"**

---

## ✅ DESPUÉS DE CREAR TODO

1. Espera a que el backend se despliegue
2. Ve a la URL del backend y agrega `/api/health` para verificar
3. Ejecuta las migraciones (necesitarás conectarte a la DB o usar un script)

---

**¿En qué paso estás?** Avísame y te guío específicamente.

# 🎨 DESPLEGAR FRONTEND EN RENDER

## ✅ LO QUE YA ESTÁ LISTO

- ✅ Backend desplegado en Render (`uit-backend.onrender.com`)
- ✅ MySQL en Railway configurado y conectado
- ✅ Todas las tablas creadas
- ✅ Usuarios iniciales creados
- ⏳ **Falta:** Desplegar el frontend

---

## 🚀 PASO 1: CREAR STATIC SITE EN RENDER

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** **"New +"** (botón en la parte superior)
3. **Selecciona:** **"Static Site"**

---

## ⚙️ PASO 2: CONFIGURAR EL SERVICIO

### **Conectar Repositorio:**

1. **En "Connect a repository":**
   - **Selecciona:** `siste-tuit/uit-master` (tu repositorio)
   - **Click en:** "Connect"

---

### **Configuración Básica:**

1. **Name:** `uit-frontend`
2. **Branch:** `main`
3. **Root Directory:** (dejar vacío o `frontend`)

---

### **Configuración de Build:**

1. **Build Command:**
   ```
   cd frontend && npm install && npm run build
   ```

2. **Publish Directory:**
   ```
   frontend/dist
   ```

---

## 🔧 PASO 3: VARIABLES DE ENTORNO

1. **Click en:** "Advanced" o busca "Environment Variables"
2. **Click en:** "+ Add Environment Variable"
3. **Agrega:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://uit-backend.onrender.com/api`
4. **Click en:** "Save Changes"

---

## 🚀 PASO 4: DESPLEGAR

1. **Click en:** "Create Static Site"
2. **Render comenzará a construir el frontend**
3. **Espera 3-5 minutos** mientras:
   - Instala dependencias
   - Construye el proyecto
   - Despliega el sitio

---

## ✅ PASO 5: VERIFICAR DESPLIEGUE

1. **Una vez completado**, verás:
   - ✅ Status: "Live"
   - ✅ URL: `https://uit-frontend.onrender.com` (o similar)

2. **Click en la URL** para abrir el frontend

---

## 🧪 PASO 6: PROBAR EL SISTEMA

1. **Abre el frontend** en el navegador
2. **Intenta iniciar sesión** con:
   - **Email:** `admin@textil.com`
   - **Contraseña:** `demo123`
3. **Verifica que:**
   - ✅ El login funcione
   - ✅ El dashboard se cargue
   - ✅ Las funcionalidades principales funcionen

---

## 🚨 SI HAY ERRORES EN EL BUILD

Si el build falla, verifica:

1. **Build Command correcto:**
   ```
   cd frontend && npm install && npm run build
   ```

2. **Publish Directory correcto:**
   ```
   frontend/dist
   ```

3. **Variables de entorno:**
   - `VITE_API_URL` = `https://uit-backend.onrender.com/api`

---

## 📋 RESUMEN

1. ✅ Ir a Render → "New +" → "Static Site"
2. ✅ Conectar repositorio `siste-tuit/uit-master`
3. ✅ Configurar:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. ✅ Agregar variable: `VITE_API_URL` = `https://uit-backend.onrender.com/api`
5. ✅ Click en "Create Static Site"
6. ✅ Esperar despliegue (3-5 minutos)
7. ✅ Probar el sistema

---

**¿Ya estás en Render Dashboard? Ve a "New +" → "Static Site" y sigue los pasos.**

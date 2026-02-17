# 🎨 CONFIGURAR STATIC SITE - PASO A PASO

## ✅ ESTÁS EN LA PANTALLA CORRECTA

Veo que estás en "New Static Site" y el repositorio `siste-tuit / uit-master` está visible.

---

## 🚀 PASO 1: SELECCIONAR REPOSITORIO

1. **Haz click en:** `siste-tuit / uit-master` (el repositorio que ves)
2. **Render te llevará a la siguiente pantalla** de configuración

---

## ⚙️ PASO 2: CONFIGURAR EL SERVICIO

Después de seleccionar el repositorio, verás una pantalla con varios campos:

### **Configuración Básica:**

1. **Name:**
   - Escribe: `uit-frontend`

2. **Branch:**
   - Deja: `main` (o selecciona `main` si hay opciones)

3. **Root Directory:**
   - **Déjalo vacío** o escribe: `frontend`

---

### **Configuración de Build:**

1. **Build Command:**
   - Busca el campo "Build Command"
   - Escribe:
     ```
     cd frontend && npm install && npm run build
     ```

2. **Publish Directory:**
   - Busca el campo "Publish Directory"
   - Escribe:
     ```
     frontend/dist
     ```

---

## 🔧 PASO 3: VARIABLES DE ENTORNO

1. **Busca la sección:** "Environment Variables" o "Environment"
2. **Click en:** "+ Add Environment Variable" o "Add Variable"
3. **Agrega:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://uit-backend.onrender.com/api`
4. **Click en:** "Save" o "Add"

---

## 🚀 PASO 4: CREAR EL SITIO

1. **Revisa que todo esté correcto:**
   - ✅ Name: `uit-frontend`
   - ✅ Build Command: `cd frontend && npm install && npm run build`
   - ✅ Publish Directory: `frontend/dist`
   - ✅ Variable: `VITE_API_URL` = `https://uit-backend.onrender.com/api`

2. **Click en:** "Create Static Site" (botón al final de la página)

---

## ⏳ PASO 5: ESPERAR DESPLIEGUE

1. **Render comenzará a construir el frontend**
2. **Verás un log en tiempo real** del proceso:
   - Instalando dependencias
   - Construyendo el proyecto
   - Desplegando el sitio
3. **Espera 3-5 minutos**

---

## ✅ PASO 6: VERIFICAR

Una vez completado:

1. **Verás:** Status: "Live"
2. **Verás una URL** como: `https://uit-frontend.onrender.com`
3. **Click en la URL** para abrir el frontend

---

## 🚨 SI NO VES ALGÚN CAMPO

Si no ves los campos de "Build Command" o "Publish Directory":

1. **Busca un botón:** "Advanced" o "Show Advanced"
2. **Click en él** para mostrar más opciones
3. **Ahí encontrarás** los campos de build

---

## 📋 RESUMEN

1. ✅ Click en `siste-tuit / uit-master`
2. ✅ Name: `uit-frontend`
3. ✅ Build Command: `cd frontend && npm install && npm run build`
4. ✅ Publish Directory: `frontend/dist`
5. ✅ Variable: `VITE_API_URL` = `https://uit-backend.onrender.com/api`
6. ✅ Click en "Create Static Site"

---

**¿Ya hiciste click en el repositorio? Avísame qué pantalla ves ahora.**

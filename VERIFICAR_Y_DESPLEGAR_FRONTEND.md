# ✅ VERIFICAR Y DESPLEGAR FRONTEND

## ✅ CONFIGURACIÓN ACTUAL

Veo que ya tienes casi todo configurado:

- ✅ Name: `uit-frontend`
- ✅ Branch: `main`
- ✅ Root Directory: `frontend`
- ✅ Build Command: `cd frontend && npm install && npm run build`
- ✅ Variable `VITE_API_URL` agregada
- ⚠️ Publish Directory: Verificar que sea `frontend/dist` (sin el prefijo `frontend/`)

---

## 🔍 PASO 1: VERIFICAR VARIABLE DE ENTORNO

1. **En la sección "Environment Variables"**, busca `VITE_API_URL`
2. **Haz click en el campo** donde está enmascarado (`••••••••••`)
3. **Verifica o corrige el valor** para que sea:
   ```
   https://uit-backend.onrender.com/api
   ```
4. **Si necesitas editarlo:**
   - Haz click en el icono de lápiz o en el campo
   - Cambia el valor a: `https://uit-backend.onrender.com/api`
   - Guarda los cambios

---

## 🔍 PASO 2: VERIFICAR PUBLISH DIRECTORY

1. **Busca el campo "Publish Directory"**
2. **Verifica que el valor sea exactamente:**
   ```
   frontend/dist
   ```
3. **Si ves algo como `frontend/ frontend/dist`:**
   - Elimina el prefijo `frontend/`
   - Deja solo: `frontend/dist`

---

## 🚀 PASO 3: DESPLEGAR

Una vez que todo esté correcto:

1. **Haz scroll hacia abajo** si es necesario
2. **Busca el botón:** "Deploy Static Site" (botón negro al final)
3. **Haz click en:** "Deploy Static Site"

---

## ⏳ PASO 4: ESPERAR DESPLIEGUE

1. **Render comenzará a construir el frontend**
2. **Verás un log en tiempo real** del proceso:
   - `Installing dependencies...`
   - `Building...`
   - `Deploying...`
3. **Espera 3-5 minutos** mientras se completa

---

## ✅ PASO 5: VERIFICAR RESULTADO

Una vez completado:

1. **Verás:** Status: "Live" ✅
2. **Verás una URL** como: `https://uit-frontend.onrender.com`
3. **Haz click en la URL** para abrir el frontend

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

1. **Build Command:**
   ```
   cd frontend && npm install && npm run build
   ```

2. **Publish Directory:**
   ```
   frontend/dist
   ```
   (Sin prefijos adicionales)

3. **Variable de entorno:**
   - `VITE_API_URL` = `https://uit-backend.onrender.com/api`

---

## 📋 RESUMEN

1. ✅ Verificar `VITE_API_URL` = `https://uit-backend.onrender.com/api`
2. ✅ Verificar Publish Directory = `frontend/dist`
3. ✅ Click en "Deploy Static Site"
4. ⏳ Esperar 3-5 minutos
5. ⏳ Probar el sistema

---

**¿Ya verificaste la variable y el Publish Directory? Haz click en "Deploy Static Site" cuando esté todo listo.**

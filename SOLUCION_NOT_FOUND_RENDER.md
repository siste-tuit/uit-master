# 🔧 SOLUCIÓN: "Not Found" en Render Static Site

## ❌ PROBLEMA

Render Static Site no está reconociendo el archivo `_redirects` para las rutas de React Router.

---

## ✅ SOLUCIÓN: CONFIGURAR REDIRECTS EN RENDER

Render tiene una sección específica para configurar redirects. Necesitas hacerlo desde el dashboard:

### **Paso 1: Ir a Settings en Render**

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-frontend` (tu static site)
3. **Click en:** "Settings" (menú lateral izquierdo)

---

### **Paso 2: Configurar Redirects**

1. **Busca la sección:** "Redirects & Rewrites" o "Custom Redirects"
2. **Click en:** "+ Add Redirect" o "Add Custom Redirect"
3. **Configura:**
   - **Source Path:** `/*`
   - **Destination:** `/index.html`
   - **Status Code:** `200` (o deja el default)
4. **Click en:** "Save" o "Add"

**Esto le dice a Render que todas las rutas deben servir `index.html`, permitiendo que React Router funcione.**

---

## 🔄 ALTERNATIVA: Verificar que _redirects esté en dist

Si Render no tiene la opción de redirects en Settings, necesitamos asegurarnos de que el archivo se copie:

1. **El archivo `_redirects` debe estar en:** `frontend/public/_redirects`
2. **Vite lo copiará automáticamente a:** `frontend/dist/_redirects`
3. **Render debe servirlo desde:** la raíz del `dist`

---

## 🧪 VERIFICAR DESPUÉS DE CONFIGURAR

1. **Espera 1-2 minutos** para que Render aplique los cambios
2. **Abre:** `https://uit-frontend.onrender.com/administracion/dashboard`
3. **Debería cargar** el dashboard en lugar de "Not Found"

---

## 📋 RESUMEN

1. ✅ Ir a Render → `uit-frontend` → **Settings**
2. ✅ Buscar **"Redirects & Rewrites"**
3. ✅ Agregar redirect: `/*` → `/index.html` (status 200)
4. ✅ Guardar cambios
5. ✅ Esperar 1-2 minutos
6. ✅ Probar nuevamente

---

**¿Ya estás en Settings? Busca "Redirects & Rewrites" y agrega el redirect.**

# 🔧 CONFIGURAR REDIRECTS EN RENDER - SOLUCIÓN DEFINITIVA

## ❌ PROBLEMA ACTUAL

- ❌ "Not Found" al navegar a rutas como `/administracion/dashboard`
- ❌ Error 404 en la consola
- ❌ React Router no funciona en producción

---

## ✅ SOLUCIÓN: CONFIGURAR EN RENDER DASHBOARD

Render tiene una opción para configurar redirects directamente desde el dashboard:

### **Paso 1: Ir a Settings**

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-frontend` (tu static site)
3. **Click en:** **"Settings"** (menú lateral izquierdo)

---

### **Paso 2: Buscar "Redirects & Rewrites"**

1. **Haz scroll hacia abajo** en Settings
2. **Busca la sección:** "Redirects & Rewrites" o "Custom Redirects"
3. **Si no la ves**, busca en "Advanced" o "Additional Settings"

---

### **Paso 3: Agregar Redirect**

1. **Click en:** "+ Add Redirect" o "Add Custom Redirect"
2. **Configura:**
   - **Source Path:** `/*`
   - **Destination:** `/index.html`
   - **Status Code:** `200` (o deja el default)
3. **Click en:** "Save" o "Add"

**Esto le dice a Render que todas las rutas deben servir `index.html`.**

---

## 🔄 ALTERNATIVA: Si no hay opción de Redirects

Si Render no tiene la opción de redirects en Settings, el plugin que creé debería funcionar. Espera a que Render redeployee automáticamente (2-3 minutos).

---

## 🧪 VERIFICAR DESPUÉS

1. **Espera 1-2 minutos** para que Render aplique los cambios
2. **Abre:** `https://uit-frontend.onrender.com/administracion/dashboard`
3. **Debería cargar** el dashboard en lugar de "Not Found"

---

## 📋 RESUMEN

1. ✅ Ir a Render → `uit-frontend` → **Settings**
2. ✅ Buscar **"Redirects & Rewrites"** o **"Custom Redirects"**
3. ✅ Agregar redirect: `/*` → `/index.html` (status 200)
4. ✅ Guardar cambios
5. ✅ Esperar 1-2 minutos
6. ✅ Probar nuevamente

---

## 🚨 SI NO ENCUENTRAS LA OPCIÓN

Si no encuentras la opción de redirects en Settings:

1. **Espera a que Render redeployee** (ya subí el plugin)
2. **El plugin copiará `_redirects` automáticamente**
3. **Prueba nuevamente en 2-3 minutos**

---

**¿Ya estás en Settings? Busca "Redirects & Rewrites" y agrega el redirect.**

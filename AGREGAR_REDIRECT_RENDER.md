# 🔧 AGREGAR REDIRECT EN RENDER - PASO A PASO

## ✅ ESTÁS EN LA PANTALLA CORRECTA

Veo que estás en "Redirects/Rewrites" y hay un botón **"+ Add Rule"**.

---

## 🚀 PASO 1: HACER CLIC EN "+ Add Rule"

1. **Haz click en:** **"+ Add Rule"** (botón dentro de la tarjeta blanca)

---

## ⚙️ PASO 2: CONFIGURAR LA REGLA

Después de hacer click, se abrirá un formulario. Configura:

### **Source Path (Ruta de Origen):**
- Escribe: `/*`
- Esto significa "todas las rutas"

### **Destination (Destino):**
- Escribe: `/index.html`
- Esto significa que todas las rutas deben servir el archivo `index.html`

### **Status Code (Código de Estado):**
- Selecciona o deja: `200` (OK)
- Esto le dice a Render que sirva el archivo sin redirección (rewrite)

---

## 💡 EXPLICACIÓN

Esta regla le dice a Render:
- **"Para cualquier ruta que no sea un archivo estático"**
- **"Sirve el archivo `index.html`"**
- **"Con código 200 (OK)"**

Esto permite que React Router maneje las rutas en el cliente.

---

## ✅ PASO 3: GUARDAR

1. **Revisa que esté configurado:**
   - ✅ Source Path: `/*`
   - ✅ Destination: `/index.html`
   - ✅ Status Code: `200`

2. **Haz click en:** "Save" o "Add" (botón para guardar)

---

## ⏳ PASO 4: ESPERAR

1. **Render aplicará los cambios automáticamente**
2. **Espera 30-60 segundos**
3. **No necesitas redeployear**, los redirects se aplican inmediatamente

---

## 🧪 PASO 5: PROBAR

1. **Abre:** `https://uit-frontend.onrender.com/administracion/dashboard`
2. **Debería cargar** el dashboard en lugar de "Not Found"
3. **Las imágenes también deberían aparecer** ahora

---

## 📋 RESUMEN

1. ✅ Click en **"+ Add Rule"**
2. ✅ Source Path: `/*`
3. ✅ Destination: `/index.html`
4. ✅ Status Code: `200`
5. ✅ Click en **"Save"**
6. ✅ Esperar 30-60 segundos
7. ✅ Probar nuevamente

---

**¿Ya hiciste click en "+ Add Rule"? Configura la regla y guárdala.**

# ⚙️ CONFIGURAR BACKEND EN RENDER - PASO A PASO

## 📍 ESTÁS EN: "Configure and deploy your new Web Service"

---

## ✅ PASO 1: SELECCIONAR REPOSITORIO

1. **En la lista de repositorios, busca:**
   - `siste-tuit / uit-master` (debería aparecer con el icono de GitHub)

2. **Click en `siste-tuit / uit-master`**

3. **Se abrirá la configuración completa**

---

## ⚙️ PASO 2: CONFIGURACIÓN BÁSICA

Después de seleccionar el repo, verás estos campos:

### **Name:**
```
uit-backend
```
(o el nombre que prefieras)

### **Region:**
Selecciona el más cercano a tu ubicación (ej: `Oregon (US West)` o `Frankfurt (EU Central)`)

### **Branch:**
```
main
```
(ya debería estar seleccionado)

### **Root Directory:**
```
server
```
⚠️ **MUY IMPORTANTE:** Escribe `server` aquí (sin barra al final)

### **Runtime:**
```
Node
```
(ya debería estar seleccionado)

### **Build Command:**
```
npm install
```

### **Start Command:**
```
npm start
```

### **Instance Type:**
Selecciona **`Free`** (para empezar, luego puedes cambiar)

---

## 🔐 PASO 3: VARIABLES DE ENTORNO

1. **Scroll hacia abajo** hasta encontrar **"Environment Variables"** o **"Advanced"**

2. **Click en "Add Environment Variable"** para cada una:

```
NODE_ENV = production
```

```
PORT = 5000
```

```
DB_NAME = uit
```

```
JWT_SECRET = (genera uno - ver abajo)
```

⚠️ **NO agregues aún** `DB_HOST`, `DB_USER`, `DB_PASS` (los agregaremos después cuando tengamos MySQL)

---

## 🔑 GENERAR JWT_SECRET

Ejecuta esto en PowerShell para generar un JWT_SECRET seguro:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y úsalo como valor de `JWT_SECRET`.

---

## ✅ PASO 4: CREAR SERVICIO

1. **Revisa toda la configuración**
2. **Scroll hasta abajo**
3. **Click en el botón verde "Create Web Service"**

---

## ⏳ PASO 5: ESPERAR DESPLIEGUE

- Render empezará a construir y desplegar tu backend
- Esto puede tomar **5-10 minutos**
- Verás logs en tiempo real
- **Anota la URL** que te dará (algo como `https://uit-backend.onrender.com`)

---

## 📋 RESUMEN RÁPIDO

1. ✅ Click en `siste-tuit / uit-master`
2. ✅ Llenar:
   - Name: `uit-backend`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. ✅ Agregar variables de entorno (4 variables)
4. ✅ Click "Create Web Service"
5. ✅ Esperar despliegue

---

**¿Ya seleccionaste el repositorio?** Avísame y te guío con los siguientes pasos.

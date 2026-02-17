# ✅ CORRECCIONES NECESARIAS EN RENDER

## 📍 REGIÓN (Está bien)

**Oregon (US West)** está bien para Perú. Es una buena opción.

**Alternativas más cercanas (si las hay):**
- `São Paulo (South America)` - Si Render lo ofrece, sería la mejor opción
- `Oregon (US West)` - Buena opción (actual)
- `Frankfurt (EU Central)` - Más lejos pero también funciona

✅ **Puedes dejar Oregon, está bien.**

---

## ⚠️ CORRECCIONES IMPORTANTES

### 1. **Root Directory** (CRÍTICO)
**Debe ser:**
```
server
```

⚠️ **Si está vacío, escríbelo ahora.** Esto le dice a Render que el código del backend está en la carpeta `server`.

---

### 2. **Build Command** (CORREGIR)
**Actual:** `$ npm install`  
**Debe ser:**
```
npm install
```

✅ Si configuraste `Root Directory: server`, entonces `npm install` está bien.  
❌ Si `Root Directory` está vacío, debe ser: `cd server && npm install`

---

### 3. **Start Command** (CORREGIR - MUY IMPORTANTE)
**Actual:** `$ node index.js`  
**Debe ser:**
```
npm start
```

⚠️ **Esto es CRÍTICO.** Tu `package.json` tiene el script `start`, no uses `node index.js` directamente.

---

### 4. **Instance Type** (CAMBIAR)
**Actual:** `Starter` ($7/mes)  
**Debe ser:** `Free` ($0/mes)

✅ **Cambia a "Free" para empezar.** Puedes actualizar después si necesitas más recursos.

---

### 5. **Environment Variables** (AGREGAR)
**Debes agregar estas 4 variables:**

1. Click en **"+ Add Environment Variable"**

2. Agregar una por una:

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
JWT_SECRET = 6cddfb4d94d65cdca203dbb4fbcc4e8f71a713795d6b231d5bc0ebd7259831e35060233ab423e576fa63576b4192d69a6aa932173569276e95b64467eae01c57
```

⚠️ **NO agregues aún** `DB_HOST`, `DB_USER`, `DB_PASS` (los agregaremos después cuando tengamos MySQL).

---

## 📋 CHECKLIST DE CORRECCIONES

- [ ] ✅ Region: Oregon está bien (o cambia a São Paulo si está disponible)
- [ ] ⚠️ Root Directory: Debe ser `server`
- [ ] ⚠️ Build Command: Debe ser `npm install`
- [ ] ⚠️ Start Command: Debe ser `npm start` (NO `node index.js`)
- [ ] ⚠️ Instance Type: Cambiar a `Free`
- [ ] ⚠️ Environment Variables: Agregar las 4 variables

---

## ✅ DESPUÉS DE CORREGIR

1. Scroll hasta abajo
2. Click en **"Deploy Web Service"** (botón negro)
3. Esperar 5-10 minutos
4. Anotar la URL que te dé

---

**¿Ya hiciste las correcciones?** Avísame y verificamos que todo esté bien antes de desplegar.

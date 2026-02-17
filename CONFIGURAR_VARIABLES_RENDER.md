# ⚙️ CONFIGURAR VARIABLES EN RENDER

## ✅ VARIABLES QUE YA TIENES (CORRECTAS)

- ✅ `JWT_SECRET` = (ya configurado)
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `5000`

---

## 🔄 CAMBIOS NECESARIOS

### **1. Cambiar DB_NAME**

- **Actual:** `DB_NAME` = `uit`
- **Cambiar a:** `DB_NAME` = `railway`

**¿Por qué?** Porque la base de datos en Railway se llama `railway`, no `uit`.

**Cómo hacerlo:**
1. Haz click en el **icono de lápiz** (✏️) al lado de `DB_NAME`
2. Cambia el valor de `uit` a `railway`
3. Click en **"Save Changes"**

---

## ➕ VARIABLES QUE FALTAN (AGREGAR)

Necesitas agregar estas 4 variables nuevas:

### **Variable 1: DB_HOST**
1. Click en **"+ Create environment group"** o busca el botón **"Edit"** → **"+ Add Variable"**
2. **Key:** `DB_HOST`
3. **Value:** `metro.proxy.rlwy.net`
4. Click en **"Save Changes"**

### **Variable 2: DB_USER**
1. Click en **"+ Add Variable"**
2. **Key:** `DB_USER`
3. **Value:** `root`
4. Click en **"Save Changes"**

### **Variable 3: DB_PASS**
1. Click en **"+ Add Variable"**
2. **Key:** `DB_PASS`
3. **Value:** `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
4. Click en **"Save Changes"**

### **Variable 4: DB_PORT**
1. Click en **"+ Add Variable"**
2. **Key:** `DB_PORT`
3. **Value:** `25047`
4. Click en **"Save Changes"**

---

## ✅ RESULTADO FINAL

Después de los cambios, deberías tener estas 8 variables:

| Key | Value |
|-----|-------|
| `DB_HOST` | `metro.proxy.rlwy.net` |
| `DB_USER` | `root` |
| `DB_PASS` | `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD` |
| `DB_NAME` | `railway` ← **CAMBIADO** |
| `DB_PORT` | `25047` |
| `JWT_SECRET` | (ya existe) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

---

## 🚀 DESPUÉS DE GUARDAR

1. Render detectará los cambios automáticamente
2. Verás **"Redeploying..."** en el dashboard
3. Espera **2-3 minutos**
4. El servicio volverá a estar **"Live"**

---

## 📋 RESUMEN

1. ✅ **Cambiar** `DB_NAME` de `uit` a `railway`
2. ✅ **Agregar** `DB_HOST` = `metro.proxy.rlwy.net`
3. ✅ **Agregar** `DB_USER` = `root`
4. ✅ **Agregar** `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
5. ✅ **Agregar** `DB_PORT` = `25047`
6. ✅ Esperar redeploy automático

---

**¿Ves el botón "Edit" o "+ Add Variable"? Empieza cambiando `DB_NAME` y luego agrega las 4 variables que faltan.**

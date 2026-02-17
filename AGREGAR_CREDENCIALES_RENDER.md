# 🔐 AGREGAR CREDENCIALES EN RENDER

## ✅ CREDENCIALES DE RAILWAY (YA LAS TIENES)

Basado en lo que veo en tu pantalla:

| Variable | Valor |
|----------|-------|
| **Host** | `metro.proxy.rlwy.net` (público) |
| **Puerto** | `25047` |
| **Usuario** | `root` |
| **Contraseña** | `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD` |
| **Base de Datos** | `railway` |

**⚠️ IMPORTANTE:** Usamos `metro.proxy.rlwy.net` y puerto `25047` porque Render está FUERA de Railway y necesita conexión pública.

---

## 🎯 PASO A PASO: AGREGAR EN RENDER

### **Paso 1: Ir a Render Dashboard**

1. **Abre:** https://dashboard.render.com
2. **Haz click en:** `uit-backend` (tu servicio de backend)

---

### **Paso 2: Ir a Environment Variables**

1. **En el menú lateral izquierdo**, busca:
   - **"Environment"** ← Click aquí
   - O: **"Settings"** → **"Environment Variables"**

---

### **Paso 3: Agregar Variables (Una por Una)**

Haz click en **"+ Add Environment Variable"** y agrega:

#### **Variable 1: DB_HOST**
- **Key:** `DB_HOST`
- **Value:** `metro.proxy.rlwy.net`
- **Click:** "Save Changes"

#### **Variable 2: DB_USER**
- **Key:** `DB_USER`
- **Value:** `root`
- **Click:** "Save Changes"

#### **Variable 3: DB_PASS**
- **Key:** `DB_PASS`
- **Value:** `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
- **Click:** "Save Changes"

#### **Variable 4: DB_NAME**
- **Key:** `DB_NAME`
- **Value:** `railway`
- **Click:** "Save Changes"

#### **Variable 5: DB_PORT**
- **Key:** `DB_PORT`
- **Value:** `25047`
- **Click:** "Save Changes"

---

### **Paso 4: Verificar Variables Agregadas**

Deberías ver estas 5 variables en Render:

- ✅ `DB_HOST` = `metro.proxy.rlwy.net`
- ✅ `DB_USER` = `root`
- ✅ `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
- ✅ `DB_NAME` = `railway`
- ✅ `DB_PORT` = `25047`

---

### **Paso 5: Render Redeployeará Automáticamente**

1. Render detectará los cambios
2. Verás **"Redeploying..."** en el dashboard
3. Espera **2-3 minutos**
4. El servicio volverá a estar **"Live"**

---

## ✅ RESUMEN RÁPIDO

1. ✅ Ir a Render → `uit-backend` → **Environment**
2. ✅ Agregar `DB_HOST` = `metro.proxy.rlwy.net`
3. ✅ Agregar `DB_USER` = `root`
4. ✅ Agregar `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD`
5. ✅ Agregar `DB_NAME` = `railway`
6. ✅ Agregar `DB_PORT` = `25047`
7. ✅ Esperar redeploy automático

---

## 🚀 SIGUIENTE PASO (DESPUÉS DEL REDEPLOY)

Una vez que el backend esté conectado a MySQL, ejecutaremos las **migraciones** para crear todas las tablas de la base de datos.

---

**¿Ya estás en Render? Ve a `uit-backend` → Environment y agrega las 5 variables.**

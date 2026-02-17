# 🗄️ USAR PLANETSCALE (ALTERNATIVA A JAWSDB)

## ✅ PLANETSCALE ES MEJOR OPCIÓN

**Ventajas de PlanetScale:**
- ✅ **Más fácil de usar** que JawsDB
- ✅ **Plan gratuito** disponible (perfecto para empezar)
- ✅ **Muy confiable** y rápido
- ✅ **Funciona perfectamente** con Render
- ✅ **Interfaz moderna** y fácil
- ✅ **Puedes actualizar a pago** después si necesitas

---

## 🚀 CREAR CUENTA EN PLANETSCALE

### **PASO 1: Ir a PlanetScale**

1. **Ir a:** https://planetscale.com
2. **Click en:** "Sign up" o "Get started" (arriba a la derecha)
3. **O ir directamente a:** https://planetscale.com/sign-up

---

### **PASO 2: Crear Cuenta**

Puedes registrarte con:
- **GitHub** (más fácil - solo un click)
- **Email** (tradicional)

**Recomendado:** Usar GitHub (más rápido)

---

### **PASO 3: Crear Base de Datos**

1. Después de iniciar sesión, verás el Dashboard
2. **Click en:** "Create database" o "New database"
3. **Configuración:**
   - **Database name:** `uit`
   - **Region:** Selecciona la más cercana (US East, US West, etc.)
   - **Plan:** Selecciona **"Scaler"** ($29/mes) o **"Hobby"** (gratis para empezar)
4. **Click en:** "Create database"

---

### **PASO 4: Obtener Credenciales**

1. Después de crear, click en tu base de datos `uit`
2. **Click en:** "Connect" o "Connection strings"
3. **Selecciona:** "Node.js" o "General"
4. **Copia estas credenciales:**
   - **Host** (algo como: `xxxxx.psdb.cloud`)
   - **Username**
   - **Password**
   - **Database name** (`uit`)

---

## 💰 PLANES DE PLANETSCALE

### **Plan Hobby (GRATIS)** - Para empezar
- ✅ 1 GB Storage
- ✅ 1 Billion row reads/mes
- ✅ 10 Million row writes/mes
- ✅ Suficiente para empezar

### **Plan Scaler ($29/mes)** - Para producción
- ✅ 10 GB Storage
- ✅ 10 Billion row reads/mes
- ✅ 100 Million row writes/mes
- ✅ Mejor rendimiento

---

## 💡 RECOMENDACIÓN

**Para empezar:** Usa el plan **"Hobby" (GRATIS)**
- Es suficiente para probar
- Puedes actualizar después si necesitas más
- No requiere tarjeta

**Para producción:** Si necesitas más, actualiza a **"Scaler" ($29/mes)**

---

## ⚙️ DESPUÉS DE CREAR LA DB

1. Copiar credenciales de PlanetScale
2. Ir a Render → uit-backend → Environment Variables
3. Agregar: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
4. Render redeployeará automáticamente

---

**¿Quieres que te guíe con PlanetScale?** Es más fácil y confiable que JawsDB.

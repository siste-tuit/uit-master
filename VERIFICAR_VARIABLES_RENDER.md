# ✅ VERIFICAR VARIABLES EN RENDER

## ✅ CÓDIGO ACTUALIZADO Y SUBIDO

El código ya está en GitHub y Render debería estar redeployeando automáticamente.

---

## 🔍 PASO 1: VERIFICAR VARIABLES EN RENDER

**IMPORTANTE:** Asegúrate de que tengas estas 5 variables:

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Click en:** `uit-backend` → **Environment**
3. **Verifica que tengas TODAS estas variables:**

| Variable | Valor Esperado |
|----------|----------------|
| `DB_HOST` | `metro.proxy.rlwy.net` |
| `DB_PORT` | `25047` ← **MUY IMPORTANTE** |
| `DB_USER` | `root` |
| `DB_PASS` | `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD` |
| `DB_NAME` | `railway` |

**⚠️ Si falta `DB_PORT`, agrégalo ahora:**
- **Key:** `DB_PORT`
- **Value:** `25047`

---

## ⏳ PASO 2: ESPERAR REDEPLOY

1. **Render detectará el cambio automáticamente**
2. **Ve a:** `uit-backend` → **Events** o **Logs**
3. **Verás:** "Redeploying..." o "Deploying..."
4. **Espera 2-3 minutos** hasta que diga "Live"

---

## 🧪 PASO 3: PROBAR CONEXIÓN NUEVAMENTE

Una vez que el servicio esté "Live":

1. **Ve a:** `uit-backend` → **Shell**
2. **Ejecuta:**
   ```bash
   npm run migrate:all
   ```

---

## 🚨 SI SIGUE FALLANDO

Si después del redeploy sigue dando `ETIMEDOUT`:

### **Opción A: Verificar que Railway permita conexiones externas**

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL → **Settings**
3. **Busca:** "Public Networking" o "Allow External Connections"
4. **Habilítalo** si está disponible

### **Opción B: Verificar logs detallados**

1. **En Render Shell**, ejecuta:
   ```bash
   node -e "console.log('DB_HOST:', process.env.DB_HOST); console.log('DB_PORT:', process.env.DB_PORT); console.log('DB_USER:', process.env.DB_USER); console.log('DB_NAME:', process.env.DB_NAME);"
   ```
2. **Verifica que los valores sean correctos**

### **Opción C: Probar conexión directa**

En Render Shell, prueba:
```bash
node -e "import('mysql2/promise').then(mysql => { const conn = mysql.createConnection({host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME}); conn.then(c => {console.log('✅ Conectado!'); c.end();}).catch(e => console.error('❌ Error:', e)); });"
```

---

## ✅ RESUMEN

1. ✅ Verificar que `DB_PORT` esté en Render
2. ⏳ Esperar redeploy automático
3. ⏳ Probar migraciones nuevamente
4. ⏳ Si falla, verificar configuración de Railway

---

**¿Ya verificaste que `DB_PORT` esté en Render? Si no está, agrégalo ahora.**

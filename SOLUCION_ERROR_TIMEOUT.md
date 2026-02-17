# 🔧 SOLUCIÓN: ERROR ETIMEDOUT

## ❌ PROBLEMA

El error `connect ETIMEDOUT` significa que Render no puede conectarse a MySQL en Railway.

**Posibles causas:**
1. ❌ Railway bloquea conexiones externas por defecto
2. ❌ El puerto no está configurado en el código
3. ❌ Firewall o restricciones de red

---

## ✅ SOLUCIÓN 1: VERIFICAR VARIABLES EN RENDER

Primero, verifica que las variables estén correctas:

1. **Ve a Render** → `uit-backend` → **Environment**
2. **Verifica que tengas:**
   - `DB_HOST` = `metro.proxy.rlwy.net` ✅
   - `DB_PORT` = `25047` ✅
   - `DB_USER` = `root` ✅
   - `DB_PASS` = `BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD` ✅
   - `DB_NAME` = `railway` ✅

---

## ✅ SOLUCIÓN 2: ACTUALIZAR CÓDIGO (YA HECHO)

Ya actualicé `server/src/config/db.js` para incluir:
- ✅ Puerto (`DB_PORT`)
- ✅ Timeouts aumentados (60 segundos)

**Necesitas hacer commit y push a GitHub para que Render actualice el código:**

```bash
git add server/src/config/db.js
git commit -m "Fix: Agregar puerto y timeouts a conexión MySQL"
git push origin main
```

Render redeployeará automáticamente.

---

## ✅ SOLUCIÓN 3: VERIFICAR CONEXIÓN PÚBLICA EN RAILWAY

Railway puede requerir configuración adicional para conexiones externas:

1. **Ve a Railway Dashboard**
2. **Click en:** MySQL → **Settings**
3. **Busca opciones como:**
   - "Public Networking"
   - "Allow External Connections"
   - "Network Access"
4. **Habilita conexiones públicas** si está disponible

---

## ✅ SOLUCIÓN 4: USAR MYSQL_PUBLIC_URL (ALTERNATIVA)

Si Railway proporciona `MYSQL_PUBLIC_URL`, podemos usarla directamente:

1. **En Railway**, copia el valor de `MYSQL_PUBLIC_URL`
2. **En Render**, agrega una variable:
   - **Key:** `DATABASE_URL`
   - **Value:** `mysql://root:BXToJmvfhUtkYkYNdHnSCtVdMkfcXBmD@metro.proxy.rlwy.net:25047/railway`

Y luego modificar el código para usar esta URL.

---

## 🧪 PASO A PASO: PROBAR CONEXIÓN

### **Paso 1: Hacer commit y push**

```bash
cd "D:\Empresa UIT\UIT-master"
git add server/src/config/db.js
git commit -m "Fix: Agregar puerto y timeouts a conexión MySQL"
git push origin main
```

### **Paso 2: Esperar redeploy en Render**

1. Render detectará el cambio automáticamente
2. Verás "Redeploying..." en el dashboard
3. Espera 2-3 minutos

### **Paso 3: Probar conexión nuevamente**

1. **Ve a Render** → `uit-backend` → **Shell**
2. **Ejecuta:**
   ```bash
   npm run migrate:all
   ```

---

## 🔍 VERIFICAR LOGS

Si sigue fallando, revisa los logs:

1. **Render** → `uit-backend` → **Logs**
2. **Busca mensajes de error** relacionados con MySQL
3. **Copia los errores** y avísame

---

## 🚨 ALTERNATIVA: USAR PLANETSCALE O JAWSDB

Si Railway sigue dando problemas, podemos cambiar a:
- **PlanetScale** (gratis, fácil de usar)
- **JawsDB** (gratis en plan básico)

---

## ✅ RESUMEN

1. ✅ Verificar variables en Render
2. ✅ Hacer commit y push del código actualizado
3. ✅ Esperar redeploy
4. ✅ Probar migraciones nuevamente
5. ⏳ Si falla, verificar configuración de red en Railway

---

**¿Quieres que te ayude a hacer el commit y push ahora?**

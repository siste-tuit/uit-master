# 🚀 Instrucciones para Ejecutar el Sistema ERP Textil

## 📋 Requisitos Previos

- ✅ Node.js instalado
- ✅ MySQL corriendo
- ✅ Base de datos `uit` creada
- ✅ Variables de entorno configuradas (o usar los valores por defecto)

---

## 🎯 Opción 1: Ejecutar Manualmente (Recomendado)

### **Terminal 1 - Backend (Servidor)**

Abre una terminal PowerShell en la carpeta `server` y ejecuta:

```powershell
cd D:\UIT-master\server

# Configurar variables de entorno (ajusta según tu configuración)
$env:DB_HOST='localhost'
$env:DB_USER='root'
$env:DB_PASS='Muni2025...'
$env:DB_NAME='uit'
$env:PORT='5000'
$env:JWT_SECRET='uit_master_secret_123'

# Ejecutar servidor
npm run dev
```

**Deberías ver:**
```
Server running on http://localhost:5000
```

---

### **Terminal 2 - Frontend**

Abre OTRA terminal PowerShell en la carpeta `frontend` y ejecuta:

```powershell
cd D:\UIT-master\frontend

# Ejecutar frontend
npm run dev
```

**Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🎯 Opción 2: Script Automatizado (Próximamente)

Si prefieres, puedo crear un script `.bat` o `.ps1` que ejecute ambos servidores automáticamente.

---

## ✅ Verificación

Una vez que ambos servidores estén corriendo:

1. **Backend:** Abre en el navegador: `http://localhost:5000/ping`
   - Deberías ver: `{"now":"2024-..."}`

2. **Frontend:** Abre en el navegador: `http://localhost:3000`
   - Deberías ver la página de login

---

## 🔐 Credenciales de Prueba

Una vez en la página de login, puedes usar estas credenciales (si están configuradas en la base de datos):

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@textil.com | (la que tengas configurada) |
| Sistemas | sistemas@textil.com | (la que tengas configurada) |
| Gerencia | gerencia@textil.com | (la que tengas configurada) |
| Ingeniería | ingenieria@textil.com | (la que tengas configurada) |
| Producción | (email del usuario) | (la que tengas configurada) |

---

## ⚠️ Solución de Problemas

### Error: "Cannot find module"
```powershell
# En cada carpeta (server y frontend), ejecuta:
npm install
```

### Error: "ECONNREFUSED" o "Failed to fetch"
- Verifica que el backend esté corriendo en el puerto 5000
- Verifica que MySQL esté corriendo
- Verifica las credenciales de la base de datos en las variables de entorno

### Puerto 5000 o 3000 ya en uso
```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr ":5000"
netstat -ano | findstr ":3000"

# Matar el proceso (reemplaza PID con el número que aparezca)
taskkill /PID <PID> /F
```

---

## 📝 Notas Importantes

1. **Ambos servidores deben estar corriendo simultáneamente**
2. **No cierres las terminales** mientras uses el sistema
3. **El backend debe iniciarse primero** (aunque el frontend puede iniciarse después)
4. **Los cambios en el código se recargarán automáticamente** gracias a Vite (frontend) y nodemon (backend)

---

## 🔄 Para Detener los Servidores

Presiona `Ctrl + C` en cada terminal donde está corriendo un servidor.

---

**¿Necesitas ayuda?** Verifica que ambos procesos estén corriendo con:
```powershell
netstat -ano | findstr ":5000 :3000"
```











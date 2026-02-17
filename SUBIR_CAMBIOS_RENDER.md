# 🚀 Guía para Subir Cambios a Render y Railway

## 📋 Cambios Pendientes

### Archivos Modificados (Correcciones de Usuarios):
- ✅ `frontend/src/components/Sidebar.tsx` - Corrección del error de map()
- ✅ `frontend/src/context/AuthContext.tsx` - Normalización de roles
- ✅ `server/src/controllers/authController.js` - Normalización de roles en backend
- ⚠️ `frontend/src/pages/Contabilidad/ContabilidadFacturasPage.tsx` - (modificado previamente)

### Archivos Nuevos:
- ✅ `SOLUCION_ERROR_USUARIOS.md` - Documentación de la solución
- ✅ `server/verificar-usuarios.js` - Script de verificación

---

## 🔄 Proceso de Despliegue

### Paso 1: Agregar Cambios al Staging

```bash
# Agregar solo los archivos de corrección importantes
git add frontend/src/components/Sidebar.tsx
git add frontend/src/context/AuthContext.tsx
git add server/src/controllers/authController.js
git add SOLUCION_ERROR_USUARIOS.md
git add server/verificar-usuarios.js

# Si también quieres agregar ContabilidadFacturasPage.tsx
git add frontend/src/pages/Contabilidad/ContabilidadFacturasPage.tsx
```

### Paso 2: Hacer Commit

```bash
git commit -m "fix: Corregir error de usuarios no funcionales - normalización de roles

- Normalizar roles en Sidebar.tsx para evitar errores de map()
- Normalizar roles en AuthContext al cargar desde localStorage
- Normalizar roles en authController.js antes de enviar al frontend
- Agregar mapeo de roles alternativos (produccion/usuario -> usuarios)
- Agregar script de verificación de usuarios
- Documentar solución completa"
```

### Paso 3: Push a GitHub

```bash
git push origin main
```

### Paso 4: Render Detectará Automáticamente

Render está configurado para:
- **Frontend (Static Site)**: Se reconstruye automáticamente cuando detecta cambios en `main`
- **Backend (Web Service)**: Se redesplega automáticamente cuando detecta cambios en `main`

**Tiempo estimado:** 2-5 minutos para el despliegue completo

---

## ✅ Verificación Post-Despliegue

### 1. Verificar que Render está desplegando

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Revisa el servicio del **Frontend** (Static Site)
3. Revisa el servicio del **Backend** (Web Service)
4. Deberías ver "Building..." o "Deploying..." en estado

### 2. Probar el Login

Una vez que el despliegue termine:

1. Abre tu aplicación frontend en Render
2. Intenta iniciar sesión con uno de los usuarios afectados:
   - AyC@textil.com
   - DyM@textil.com
   - Emanuel@textil.com
   - etc.

3. Verifica que:
   - ✅ El login funciona correctamente
   - ✅ El sidebar se renderiza sin errores
   - ✅ Los módulos del rol "usuarios" son visibles
   - ✅ No hay errores en la consola del navegador

### 3. Verificar Logs en Render

Si hay problemas:

1. Ve al servicio del **Backend** en Render
2. Haz clic en "Logs"
3. Busca errores relacionados con autenticación o roles

---

## 🔍 Comandos Rápidos

### Ver estado actual:
```bash
git status
```

### Ver cambios específicos:
```bash
git diff frontend/src/components/Sidebar.tsx
git diff frontend/src/context/AuthContext.tsx
git diff server/src/controllers/authController.js
```

### Deshacer cambios (si es necesario):
```bash
git restore frontend/src/components/Sidebar.tsx
git restore frontend/src/context/AuthContext.tsx
git restore server/src/controllers/authController.js
```

---

## ⚠️ Notas Importantes

1. **Render detecta automáticamente** los cambios en la rama `main` de GitHub
2. **No necesitas hacer nada manual** en Render después del push
3. **El despliegue puede tardar 2-5 minutos**
4. **Los usuarios deberán limpiar su localStorage** si tienen sesiones guardadas con roles no normalizados:
   ```javascript
   localStorage.removeItem('erp_user');
   localStorage.removeItem('erp_token');
   ```

---

## 🆘 Si Algo Sale Mal

### Si el despliegue falla en Render:

1. Revisa los logs en Render Dashboard
2. Verifica que las variables de entorno estén correctas
3. Verifica que el build del frontend compile sin errores:
   ```bash
   cd frontend
   npm run build
   ```

### Si necesitas hacer un despliegue manual:

1. En Render Dashboard, ve a tu servicio
2. Haz clic en "Manual Deploy"
3. Selecciona "Deploy latest commit"

---

**Fecha:** 16 de Febrero, 2026

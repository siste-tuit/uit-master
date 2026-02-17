# ⚠️ ERROR AL SUBIR A GITHUB - SOLUCIÓN

## 🔴 ERROR ENCONTRADO

```
remote: Permission denied to mjesus1999.
fatal: unable to access 'https://github.com/siste-tuit/uit-master.git/': 403
```

**Causa:** Git está usando el usuario `mjesus1999` pero el repositorio es de `siste-tuit`.

---

## ✅ SOLUCIÓN RÁPIDA

### OPCIÓN A: Usar Personal Access Token (RECOMENDADO)

1. **Crear Token en GitHub:**
   - Ir a https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Nombre: "Render Deployment" (o cualquier nombre)
   - Seleccionar: `repo` (todos los permisos de repos)
   - Click "Generate token"
   - **COPIA EL TOKEN** (solo se muestra una vez)

2. **Cuando Git pida contraseña:**
   - Usuario: `siste-tuit`
   - Contraseña: **PEGAR EL TOKEN** (no tu contraseña de GitHub)

### OPCIÓN B: Cambiar URL con Token en el comando

Usar el token directamente en la URL del remote.

---

## 🚀 COMANDOS PARA SOLUCIONAR

### Si ya tienes el token:

```powershell
cd "D:\Empresa UIT\UIT-master"

# Remover remote actual
git remote remove origin

# Agregar con token (reemplaza TU_TOKEN con tu token)
git remote add origin https://TU_TOKEN@github.com/siste-tuit/uit-master.git

# O usar tu usuario (más seguro):
git remote add origin https://siste-tuit@github.com/siste-tuit/uit-master.git

# Intentar push de nuevo
git push -u origin main
```

Cuando pida contraseña, usa el **TOKEN** (no tu contraseña normal).

---

## 📋 PASO A PASO SIMPLE

1. **Ir a:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Nombre:** "Render" (cualquier nombre)
4. **Seleccionar:** Solo `repo` (marca esa casilla)
5. **Click:** "Generate token" (abajo)
6. **COPIAR EL TOKEN** (aparece una vez, guárdalo)

7. **Ejecutar:**
   ```powershell
   git push -u origin main
   ```

8. **Cuando pida:**
   - Username: `siste-tuit`
   - Password: **PEGAR EL TOKEN** (no tu contraseña)

---

## ✅ VERIFICACIÓN

Si funcionó, verás:
```
Enumerating objects: ...
Counting objects: 100% ...
Writing objects: 100% ...
To https://github.com/siste-tuit/uit-master.git
```

---

**¿Ya creaste el token?** Cuando lo tengas, ejecutamos `git push` de nuevo.

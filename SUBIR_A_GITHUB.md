# 📤 CÓMO SUBIR TU CÓDIGO A GITHUB

## 🎯 SITUACIÓN ACTUAL

- ❌ Tu código NO está en GitHub todavía
- ✅ Necesitas subirlo antes de desplegar en Render

---

## 📋 PASO A PASO COMPLETO

### PASO 1: Crear Repositorio en GitHub

1. **Ir a https://github.com**
2. **Click en "+" (arriba derecha) → "New repository"**
3. **Configurar:**
   ```
   Repository name: uit-master (o sistema-uit)
   Description: Sistema ERP UIT Textil
   Visibility: Private (recomendado) o Public
   ⚠️ NO marques "Initialize with README"
   ⚠️ NO marques "Add .gitignore"
   ⚠️ NO marques "Choose a license"
   ```
4. **Click en "Create repository"**

---

### PASO 2: GitHub te Mostrará Comandos

Después de crear el repo, GitHub mostrará una página con comandos.

**Si ya tienes código local** (tu caso), usa los comandos que dicen:
"…or push an existing repository from the command line"

---

### PASO 3: Ejecutar Comandos desde tu PC

**Abre PowerShell** en la carpeta de tu proyecto y ejecuta:

```powershell
# Ir a tu carpeta
cd "D:\Empresa UIT\UIT-master"

# Inicializar Git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Sistema UIT listo para producción"

# Cambiar a rama main
git branch -M main

# Agregar remoto de GitHub (REEMPLAZA TU-USUARIO con tu usuario)
git remote add origin https://github.com/TU-USUARIO/uit-master.git

# Subir código
git push -u origin main
```

**⚠️ IMPORTANTE:** Reemplaza `TU-USUARIO` con tu usuario real de GitHub.

**Ejemplo:**
Si tu usuario es `siste-tuit`, sería:
```
git remote add origin https://github.com/siste-tuit/uit-master.git
```

---

### PASO 4: Autenticación en GitHub

Cuando ejecutes `git push`, GitHub pedirá:
- **Usuario de GitHub**
- **Contraseña** (o Personal Access Token)

**Si pide Token:**
1. Ir a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generar nuevo token
3. Dar permisos: `repo`
4. Copiar token y usarlo como contraseña

---

### PASO 5: Verificar en GitHub

1. **Refrescar la página de tu repositorio en GitHub**
2. **Deberías ver todos tus archivos**
3. **Listo!** Ahora puedes volver a Render

---

## ✅ DESPUÉS DE SUBIR

**Vuelve a Render:**
1. Refresh la página de Render
2. O vuelve a "New" → "Web Service"
3. Click en "GitHub" (ya autorizado)
4. Ahora deberías ver tu repositorio "uit-master"
5. Selecciónalo y continúa

---

## ❓ ¿NECESITAS AYUDA?

**Dime:**
1. ¿Ya creaste el repositorio en GitHub?
2. ¿Qué nombre le pusiste?
3. ¿Cuál es tu usuario de GitHub?

Y te doy los comandos exactos para tu caso. 🚀

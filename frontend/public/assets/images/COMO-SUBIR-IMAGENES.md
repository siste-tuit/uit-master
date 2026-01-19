# 📸 Cómo Subir Imágenes

## 📁 Ubicación Exacta

```
D:\UIT-master\frontend\public\assets\images\
```

## 🎯 Pasos para Subir Imágenes

### Opción 1: Arrastrar y Soltar
1. Abre el **Explorador de Archivos** de Windows
2. Navega a: `D:\UIT-master\frontend\public\assets\images\`
3. Determina en qué subcarpeta va tu imagen
4. Arrastra tu imagen desde su ubicación actual a la carpeta correcta

### Opción 2: Copiar y Pegar
1. Encuentra tu imagen original
2. Clic derecho → **Copiar**
3. Ve a `D:\UIT-master\frontend\public\assets\images\[carpeta]`
4. Clic derecho → **Pegar**

### Opción 3: Desde VS Code / Cursor
1. En el explorador lateral, abre: `frontend → public → assets → images`
2. Selecciona la carpeta donde quieres poner tu imagen
3. Clic derecho en la carpeta → **Reveal in File Explorer**
4. Copia tus imágenes ahí

## 📂 ¿En Qué Carpeta Subo Mi Imagen?

| Tipo de Imagen | Carpeta |
|---------------|---------|
| Logo de empresa, logos de clientes | `logos/` |
| Fotos de productos textiles (polos, camisetas, etc.) | `productos/` |
| Fotos de perfil de usuarios | `usuarios/` |
| Gráficos, charts, visualizaciones | `reportes/` |
| Iconos de líneas de producción, dashboards | `dashboard/` |
| Fondos, patrones, imágenes generales | `general/` |

## ✅ Ejemplos Prácticos

### Ejemplo 1: Logo de la Empresa
**Imagen**: `uit-logo.png`  
**Subir a**: `frontend/public/assets/images/logos/uit-logo.png`  
**Usar en código**: 
```tsx
<img src="/assets/images/logos/uit-logo.png" alt="Logo UIT" />
```

### Ejemplo 2: Foto de Producto
**Imagen**: `polo-basico-azul.jpg`  
**Subir a**: `frontend/public/assets/images/productos/polo-basico-azul.jpg`  
**Usar en código**:
```tsx
<img src="/assets/images/productos/polo-basico-azul.jpg" alt="Polo Básico Azul" />
```

### Ejemplo 3: Icono de Línea de Producción
**Imagen**: `linea-ac-icon.png`  
**Subir a**: `frontend/public/assets/images/dashboard/linea-ac-icon.png`  
**Usar en código**:
```tsx
<img src="/assets/images/dashboard/linea-ac-icon.png" alt="Línea A&C" />
```

## ⚠️ Consejos Importantes

### Nombres de Archivo
✅ **Buenos nombres**:
- `polo-basico-azul.jpg`
- `logo-uit.png`
- `linea-ac-icon.png`
- `usuario-juan-perez.jpg`

❌ **Nombres malos**:
- `IMG_1234.jpg` (no descriptivo)
- `Logo UI.PNG` (mayúsculas y espacios)
- `foto (1).jpg` (espacios y caracteres especiales)
- `producto-final-version-2-final.jpg` (muy largo)

### Formatos Recomendados
- **JPG**: Para fotos de productos y usuarios
- **PNG**: Para logos y gráficos con transparencia
- **SVG**: Para iconos escalables
- **WebP**: Para imágenes optimizadas (si tienes)

### Tamaño
- Optimiza las imágenes antes de subirlas
- Para web: máximo 500KB por imagen
- Usa herramientas como [TinyPNG](https://tinypng.com/) o [Squoosh](https://squoosh.app/)

## 🚀 Después de Subir

Una vez que subas las imágenes:

1. **Reinicia el servidor de desarrollo** (si está corriendo):
   ```bash
   Ctrl + C  # Detener servidor
   npm run dev  # Iniciar de nuevo
   ```

2. **Limpia la caché del navegador** si no ves las imágenes:
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

3. **Verifica que las imágenes aparezcan** en tu aplicación

## 📝 Estructura Final

```
frontend/public/assets/images/
├── logos/
│   ├── uit-logo.png
│   ├── lacoste-logo.png
│   └── marmaxx-logo.png
├── productos/
│   ├── polo-basico-azul.jpg
│   ├── camiseta-deportiva.jpg
│   └── pantalon-casual.jpg
├── usuarios/
│   ├── luis-rodriguez.jpg
│   └── default-avatar.png
├── reportes/
│   ├── chart-produccion.png
│   └── icono-grafico.png
├── dashboard/
│   ├── linea-ac-icon.png
│   ├── linea-dm-icon.png
│   └── logo-erp-textil.png
└── general/
    ├── fondo-textil.jpg
    └── placeholder.jpg
```

## ❓ Preguntas Frecuentes

**¿Puedo crear nuevas subcarpetas?**  
✅ Sí, puedes crear todas las que necesites dentro de `images/`

**¿Las imágenes se guardan en Git?**  
⚠️ Depende. Si son muchas o muy grandes, considera usar `.gitignore` y subirlas aparte

**¿Necesito reiniciar el servidor?**  
✅ Solo la primera vez. Después Vite las detecta automáticamente

**¿Funciona con imágenes desde internet?**  
❌ Este sistema es para archivos locales. Para imágenes remotas usa la URL completa

**¿Puedo usar imágenes de otras carpetas?**  
✅ Sí, puedes usar cualquier archivo desde `public/` con `/ruta/desde/raiz`


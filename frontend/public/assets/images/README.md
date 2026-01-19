# 📁 Carpeta de Imágenes

Esta carpeta contiene todas las imágenes utilizadas en la aplicación ERP Textil.

## 📋 Estructura Recomendada

```
images/
├── logos/              # Logos de la empresa y aplicaciones
├── productos/          # Imágenes de productos textiles
├── usuarios/           # Fotos de perfil de usuarios
├── reportes/           # Imágenes para reportes (gráficos, etc.)
├── dashboard/          # Iconos y gráficos para dashboards
└── general/            # Imágenes generales
```

## 🔗 Cómo Usar las Imágenes

### En componentes React/TypeScript:

```tsx
// Opción 1: Usando ruta pública (recomendado)
<img src="/assets/images/productos/polo-basico.jpg" alt="Polo Básico" />

// Opción 2: Importando desde src/assets (para optimización)
import productoImg from '@/assets/images/productos/polo-basico.jpg';
<img src={productoImg} alt="Polo Básico" />
```

### En CSS:

```css
.background {
  background-image: url('/assets/images/general/pattern.jpg');
}
```

## 📝 Notas Importantes

- **Formatos recomendados**: JPG para fotos, PNG para iconos con transparencia, SVG para gráficos vectoriales
- **Tamaño**: Optimizar imágenes antes de subirlas
- **Nombres**: Usar nombres descriptivos y en minúsculas con guiones
- **Responsive**: Considerar múltiples tamaños para diferentes dispositivos

## 🎨 Imágenes Sugeridas para Implementar

### Para el Dashboard de Ingeniería:
- Iconos de las líneas de producción (A&C, D&M, Elena Tex, etc.)
- Gráficos de producción
- Indicadores de estado

### Para Inventario:
- Fotos de productos textiles
- Iconos de categorías (Materia Prima, Insumos, Producto Terminado)
- Diseños de prendas

### Para Reportes:
- Gráficos y charts
- Logos de clientes (Lacoste, Marmaxx, etc.)

### Para el Sistema General:
- Logo de la empresa UIT
- Logo ERP Textil
- Fotos de perfil de usuarios


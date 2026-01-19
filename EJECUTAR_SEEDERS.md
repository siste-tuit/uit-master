# Cómo Ejecutar Seeders para Tener Datos de Ejemplo

## Datos de Inventario

Para que la página de **Inventario** muestre datos, ejecuta:

```bash
cd server
node src/seeders/seedInventario.js
```

Esto creará:
- Items de inventario para Ingeniería (hilos, telas, tintes, etc.)
- Items de inventario para Mantenimiento (aceites, filtros, repuestos, etc.)

## Datos de Producción

Para que la página de **Producción** muestre datos, necesitas que:

1. **Usuarios de producción** envíen reportes diarios desde "Mi Producción" → "Enviar Reporte"
2. **O** que **Ingeniería** envíe reportes a los usuarios desde "Producción" → "Enviar Reporte a Usuario"

Los reportes se guardan en la tabla `reportes_diarios` y aparecen automáticamente en las estadísticas de Gerencia.

## Nota sobre Ventas

La página de **Ventas** actualmente usa datos mock. Para conectar con datos reales, necesitarías:
- Crear una tabla de ventas en la base de datos
- Crear un endpoint en el backend
- Conectar el frontend con el endpoint

## Resumen

✅ **Producción**: Datos reales (depende de reportes enviados)
✅ **Inventario**: Datos reales (ejecuta el seeder para datos de ejemplo)
⚠️ **Ventas**: Datos mock (no conectado al backend)


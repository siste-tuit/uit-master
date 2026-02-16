# Solución al error 403 en Dashboard y estadísticas

## Problema

- **Consola:** `Failed to load resource: the server responded with a status of 403 ()`
- **Endpoints afectados:** `/api/trabajadores`, `/api/reportes-produccion/estadisticas/:id`, reportes con `?fecha=...`
- **UI:** "No se pudieron cargar las estadísticas" en Dashboard Usuario y en otros dashboards.

## Causa

El middleware de autorización (`authorizeRoles`) en el backend solo permite el rol **`usuarios`** (plural) en rutas de producción (trabajadores, estadísticas, reportes).

En la base de datos existen **dos roles** muy parecidos:

- **`usuario`** (singular), ID 4  
- **`usuarios`** (plural), ID 12  

Si un usuario tiene asignado el rol **`usuario`** (singular), el backend lo rechazaba con **403** porque la ruta solo acepta **`usuarios`** (plural).

## Cambio realizado

En **`server/src/middleware/authMiddleware.js`** se normaliza el rol después de leerlo de la base de datos:

- **`usuario`** → se trata como **`usuarios`**
- **`produccion`** → se trata como **`usuarios`**

Así, tanto los usuarios con rol `usuario` como `usuarios` (y `produccion`) pueden acceder a:

- `/api/trabajadores`
- `/api/reportes-produccion/estadisticas/:usuario_id`
- `/api/reportes-produccion/reportes-diarios/...`
- `/api/asistencia`
- Y el resto de rutas que exigen rol `usuarios`.

## Archivo modificado

- `server/src/middleware/authMiddleware.js`: mapeo de roles `usuario` y `produccion` a `usuarios` antes de usar `req.user.role`.

## Despliegue

1. Hacer commit y push del cambio.
2. En [Render](https://dashboard.render.com), el **Web Service** del backend se redesplegará solo.
3. Esperar a que el despliegue termine (estado "Live").
4. Probar de nuevo el Dashboard y las estadísticas; no hace falta cambiar nada en el frontend.

## Cómo comprobar

1. Iniciar sesión con un usuario de producción (rol `usuario` o `usuarios`).
2. Ir al **Dashboard Usuario** (o al dashboard que daba error).
3. Confirmar que ya no aparece "No se pudieron cargar las estadísticas" y que no hay 403 en la consola para `/api/trabajadores` ni `/api/reportes-produccion/...`.

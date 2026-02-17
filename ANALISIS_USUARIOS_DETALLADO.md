# Análisis detallado de usuarios – ERP Textil

**Fecha:** 16 de febrero de 2026  
**Usuarios analizados:** 13  
**Fuente:** Base de datos del sistema (consulta en vivo)

---

## 1. Resumen ejecutivo

| Métrica | Valor |
|--------|--------|
| Total usuarios analizados | 13 |
| Usuarios que existen en BD | 13 (100 %) |
| Usuarios activos | 13 (100 %) |
| Usuarios con rol válido | 13 (100 %) |
| Usuarios con problemas | 0 |

**Conclusión:** Los 13 usuarios están correctamente dados de alta, activos y con el rol adecuado para operar en el sistema.

---

## 2. Listado detallado por usuario

| # | Email | Nombre completo | Rol | ID rol | Estado | Departamento |
|---|--------|------------------|-----|--------|--------|--------------|
| 1 | AyC@textil.com | Ana García | usuarios | 12 | Activo | (según BD) |
| 2 | AyC2@textil.com | Carlos Mendoza | usuarios | 12 | Activo | (según BD) |
| 3 | AyC3@textil.com | Carmen Torres | usuarios | 12 | Activo | (según BD) |
| 4 | AyC4@textil.com | Carmen Vega | usuarios | 12 | Activo | (según BD) |
| 5 | DyM@textil.com | Fernando Díaz | usuarios | 12 | Activo | (según BD) |
| 6 | Elenatex@textil.com | Juan Pérez | usuarios | 12 | Activo | (según BD) |
| 7 | Emanuel@textil.com | Luis Sánchez | usuarios | 12 | Activo | (según BD) |
| 8 | Emanuel2@textil.com | María López | usuarios | 12 | Activo | (según BD) |
| 9 | JflStyle@textil.com | Miguel Herrera | usuarios | 12 | Activo | (según BD) |
| 10 | Juanazea@textil.com | Patricia López | usuarios | 12 | Activo | (según BD) |
| 11 | Myl@textil.com | Pedro Martínez | usuarios | 12 | Activo | (según BD) |
| 12 | Myl2@textil.com | Roberto Torres | usuarios | 12 | Activo | (según BD) |
| 13 | Velasquez@textil.com | Sandra Morales | usuarios | 12 | Activo | (según BD) |

- **Rol asignado:** `usuarios` (ID 12).  
- **Descripción del rol en sistema:** “Registro de producción y consulta de stock”.  
- **Ruta de inicio tras login:** `/produccion/dashboard` (Dashboard de producción).

---

## 3. Rol «usuarios» – qué pueden hacer

Estos 13 usuarios tienen el rol **usuarios**, que en el ERP está pensado para **operadores de producción**. Sus permisos y pantallas son:

### 3.1 Módulos a los que tienen acceso (menú lateral)

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/produccion/dashboard` | Panel con estadísticas propias (hoy, semanal, mensual). |
| Mi Producción | `/produccion/mi-produccion` | Ver reportes enviados por Ingeniería y descargar PDF. |
| Trabajadores | `/produccion/trabajadores` | Gestionar hasta 15 trabajadores propios (CRUD). |
| Asistencia | `/produccion/asistencia` | Registrar entrada/salida y refrigerio de sus trabajadores. |
| Perfil | `/produccion/profile` | Ver y editar su perfil. |

### 3.2 APIs que pueden usar (backend)

- **Autenticación:** login, logout, token JWT.
- **Reportes de producción:**  
  - Ver sus estadísticas: `GET /api/reportes-produccion/estadisticas/:usuario_id`  
  - Ver reportes diarios propios: `GET /api/reportes-produccion/reportes-diarios/usuario/:usuario_id`  
  - Recibir/consultar pedidos recibidos: `GET /api/reportes-produccion/pedidos-recibidos/:usuario_id`
- **Trabajadores:**  
  - Listar, crear, editar y eliminar solo sus trabajadores: `GET/POST/PUT/DELETE /api/trabajadores`
- **Asistencia:**  
  - Ver y crear/actualizar registros de asistencia de sus trabajadores: `GET/POST /api/asistencia`

Todo lo anterior está restringido por `usuario_id`: cada usuario solo ve y modifica sus propios datos (trabajadores, reportes, asistencia).

### 3.3 Lo que no pueden hacer (por diseño)

- No tienen acceso a: Administración, Sistemas, Mantenimiento, Contabilidad, Ingeniería (como rol ingeniería), Gerencia (como rol gerencia).
- No pueden ver datos de otros usuarios ni gestionar usuarios del sistema.
- No pueden ver reportes ni estadísticas de otros operadores.

---

## 4. Roles existentes en el sistema (referencia)

En la base de datos existen, entre otros, estos roles:

| ID | Nombre | Uso típico |
|----|--------|------------|
| 1 | administrador | Acceso total al ERP. |
| 2 | contabilidad | Finanzas y facturación. |
| 3 | gerencia | Solo lectura de dashboards y métricas. |
| 4 | usuario | Alternativa al rol “usuarios”; en el código se mapea a “usuarios” para menú y permisos. |
| 5 | sistemas | Incidencias, logs, configuración. |
| 6 | ingenieria | Producción, reportes, flujos, inventario. |
| 7 | mantenimiento | Equipos, órdenes de trabajo, repuestos, calendario. |
| 8 | produccion | En el código se mapea a “usuarios” (mismo acceso que operadores). |
| 12 | usuarios | Rol asignado a los 13 usuarios analizados. |

Los 13 usuarios están correctamente asignados al rol **usuarios (ID 12)**.

---

## 5. Comprobaciones realizadas

Para cada uno de los 13 correos se verificó:

1. **Existencia:** El usuario existe en la tabla `usuarios`.
2. **Estado:** `is_active` = activo.
3. **Rol:** Tiene `rol_id = 12` y el rol se llama `usuarios`.
4. **Rol válido en frontend:** El nombre `usuarios` existe en `roleModules` y tiene asignados los módulos de producción (Dashboard, Mi Producción, Trabajadores, Asistencia, Perfil).
5. **Sin problemas detectados:** Ningún usuario aparece con “Sin rol”, “Rol inválido” o “Usuario inactivo”.

El script utilizado es `server/verificar-usuarios.js`, que se ejecutó contra la base de datos del proyecto.

---

## 6. Recomendaciones

1. **Contraseñas:** Asegurar que cada usuario tenga una contraseña segura; si se usan contraseñas por defecto, planificar cambio en el primer acceso o vía administrador.
2. **Último acceso:** Si en el futuro quieres analizar inactividad, puedes usar los campos `last_login` y `created_at` de la tabla `usuarios` (el script actual no los imprime; se pueden añadir al script si lo deseas).
3. **Trabajadores por usuario:** Cada usuario con rol “usuarios” puede tener hasta 15 trabajadores activos; si necesitas estadísticas de “cuántos trabajadores tiene cada uno”, se puede añadir una consulta en `verificar-usuarios.js` o un reporte aparte.
4. **Mantener rol actual:** No es necesario cambiar el rol de estos 13 usuarios; la configuración actual es la correcta para operadores de producción.

---

## 7. Cómo volver a ejecutar el análisis

Desde la raíz del proyecto:

```bash
cd server
node verificar-usuarios.js
```

Requisitos: tener configurado `.env` en `server/` con las variables de conexión a la base de datos (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` o `DB_URL`).

---

**Documento generado a partir de la ejecución del script de verificación y de la revisión del código del ERP (roles, rutas y controladores).**

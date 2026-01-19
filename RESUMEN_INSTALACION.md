# ✅ Instalación Completada - UIT Master ERP

## 📋 Resumen de lo Realizado

### ✅ Base de Datos MySQL
- **Base de datos creada**: `uit` en MySQL Workbench
- **Contraseña configurada**: `Muni2025...` en `server/.env`
- **13 tablas creadas** exitosamente

### ✅ Datos Iniciales
- **8 roles** insertados: administrador, contabilidad, gerencia, usuarios, sistemas, ingenieria, mantenimiento, producción
- **7 departamentos** insertados: administracion, sistemas, ingenieria, gerencia, contabilidad, mantenimiento, usuarios
- **1 usuario admin** creado: `admin@textil.com` / `demo123`
- **Configuración de empresa** insertada

### ✅ Backend (Server)
- **Puerto**: 5000 ✅ FUNCIONANDO
- **URL**: http://localhost:5000
- **Estado**: Servidor activo y respondiendo

### ✅ Frontend
- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Todas las URLs actualizadas** de puerto 3001 → 5000
- **Rutas de dashboards corregidas**

### ✅ Archivos Creados/Modificados
- ✅ `server/.env` - Configuración de MySQL
- ✅ `server/package.json` - Script `migrate` agregado
- ✅ `server/src/seeders/insertRoles.js` - Creado
- ✅ Todos los contextos del frontend actualizados
- ✅ `INSTRUCCIONES_MYSQL.md` - Guía creada
- ✅ `PASOS_MYSQL.md` - Instrucciones detalladas
- ✅ `CREAR_BASE_DATOS.sql` - Script SQL

---

## 🚀 Cómo Usar el Sistema

### 1. Iniciar Backend
```powershell
cd D:\UIT-master\server
npm run dev
```

### 2. Iniciar Frontend (en otra terminal)
```powershell
cd D:\UIT-master\frontend
npm run dev     # ⚠️ IMPORTANTE: NO usar "npm start", usar "npm run dev"
```

### 3. Acceder a la Aplicación
- **URL**: http://localhost:3000
- **Login**: admin@textil.com
- **Contraseña**: demo123

---

## 👤 Credenciales de Acceso

| Rol | Email | Contraseña | Dashboard |
|-----|-------|------------|-----------|
| Administrador | admin@textil.com | demo123 | /administracion/dashboard |
| Contabilidad | - | - | /contabilidad/dashboard |
| Gerencia | - | - | /gerencia/dashboard |
| Usuario | - | - | /produccion/dashboard |
| Sistemas | - | - | /sistemas/dashboard |
| Ingeniería | - | - | /ingenieria/dashboard |
| Mantenimiento | - | - | /mantenimiento/dashboard |

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales
1. `roles` - Roles del sistema
2. `usuarios` - Usuarios
3. `departamentos` - Departamentos
4. `productos` - Productos
5. `inventario` - Movimientos de inventario
6. `configuracion_empresa` - Configuración
7. `incidencias` - Sistema de incidencias
8. `logs` - Logs del sistema
9. `equipos` - Equipos de mantenimiento
10. `repuestos` - Repuestos
11. `ordenes_trabajo` - Órdenes de mantenimiento
12. `ot_repuestos` - Relación OT-Repuestos
13. `calendario_mantenimiento` - Calendario

---

## 🔧 Comandos Útiles

### Base de Datos
```powershell
# Ejecutar migraciones
cd server
npm run migrate

# Poblar datos iniciales
node src/seeders/insertRoles.js
node src/seeders/insertDepartamentos.js
node src/seeders/insertConfiguracion.js
node src/seeders/seedAdmin.js
```

### Desarrollo
```powershell
# Backend
cd server
npm run dev  # Puerto 5000

# Frontend
cd frontend
npm run dev  # Puerto 3000
```

---

## 📁 Estructura del Proyecto

```
D:\UIT-master\
├── server\                    # Backend MySQL
│   ├── .env                  # Configuración MySQL
│   ├── src\
│   │   ├── config\           # Configuración BD
│   │   ├── controllers\      # Controladores
│   │   ├── routes\           # Rutas API
│   │   ├── seeders\          # Datos iniciales
│   │   └── scripts\          # Migraciones
│   └── package.json
├── frontend\                  # Frontend React + Vite
│   ├── src\
│   │   ├── components\       # Componentes
│   │   ├── context\          # Contextos React
│   │   ├── pages\            # Páginas
│   │   └── App.tsx           # Router principal
│   └── package.json
└── INSTRUCCIONES_MYSQL.md    # Guía de MySQL
```

---

## ⚠️ Notas Importantes

1. **MySQL Workbench**: La base de datos `uit` está lista para ver todas las tablas
2. **Contraseña**: Si cambias la contraseña de MySQL, actualiza `server/.env`
3. **Puertos**: Backend 5000, Frontend 3000
4. **Usuario Admin**: Ya existe y está activo
5. **Paleta Verde**: El frontend usa paleta verde UIT como preferido

---

## 🎉 ¡Todo Listo!

El sistema está completamente configurado y listo para usar. 

**Abre tu navegador en http://localhost:3000 y comienza a usar el ERP UIT Master.**


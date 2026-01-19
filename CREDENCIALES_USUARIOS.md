# 🔐 Credenciales de Usuarios - UIT Master ERP

## 📋 Usuarios Disponibles

Todos los usuarios tienen la contraseña: **demo123**

### 👨‍💼 Administrador
- **Email**: admin@textil.com
- **Nombre**: Carlos Mendoza
- **Rol**: administrador
- **Departamento**: Administración
- **Acceso**: Completo al sistema

### 💼 Contabilidad
- **Email**: contabilidad@textil.com
- **Nombre**: María López
- **Rol**: contabilidad
- **Departamento**: Contabilidad
- **Acceso**: Gestión financiera y facturación

### 📊 Gerencia
- **Email**: gerencia@textil.com
- **Nombre**: Juan Pérez
- **Rol**: gerencia
- **Departamento**: Gerencia
- **Acceso**: Dashboards estratégicos y métricas

### 💻 Sistemas
- **Email**: sistemas@textil.com
- **Nombre**: Ana García
- **Rol**: sistemas
- **Departamento**: Sistemas
- **Acceso**: Gestión de incidencias y configuración

### ⚙️ Ingeniería
- **Email**: ingenieria@textil.com
- **Nombre**: Daniel . P
- **Rol**: ingenieria
- **Departamento**: Ingeniería
- **Acceso**: Gestión de proyectos

### 🔧 Mantenimiento
- **Email**: mantenimiento@textil.com
- **Nombre**: Pedro Martínez
- **Rol**: mantenimiento
- **Departamento**: Mantenimiento
- **Acceso**: Gestión de equipos y órdenes

### 👷 Usuarios de Producción (13 usuarios)
Todos tienen la contraseña: **demo123**

1. **Ana García** - AyC@textil.com (Línea: A&C - CHINCHA GREEN)
2. **Carlos Mendoza** - AyC2@textil.com (Línea: A&C 2 - CHINCHA GREEN)
3. **Carmen Torres** - AyC3@textil.com (Línea: A&C 3 - CHINCHA GREEN)
4. **Carmen Vega** - AyC4@textil.com (Línea: A&C 4 - CHINCHA GREEN)
5. **Fernando Díaz** - DyM@textil.com (Línea: D&M - CHINCHA GREEN)
6. **Juan Pérez** - Elenatex@textil.com (Línea: ELENA TEX - CHINCHA GREEN)
7. **Luis Sánchez** - Emanuel@textil.com (Línea: EMANUEL - CHINCHA GREEN)
8. **María López** - Emanuel2@textil.com (Línea: EMANUEL 2 - CHINCHA GREEN)
9. **Miguel Herrera** - JflStyle@textil.com (Línea: JFL STYLE - CHINCHA GREEN)
10. **Patricia López** - Juanazea@textil.com (Línea: JUANA ZEA - CHINCHA GREEN)
11. **Pedro Martínez** - Myl@textil.com (Línea: M&L - CHINCHA GREEN)
12. **Roberto Torres** - Myl2@textil.com (Línea: M&L 2 - CHINCHA GREEN)
13. **Sandra Morales** - Velasquez@textil.com (Línea: VELASQUEZ - CHINCHA GREEN)

- **Rol**: usuarios
- **Departamento**: Producción
- **Acceso**: Registro de producción

---

## 🚀 Cómo Agregar Más Usuarios

Si necesitas agregar más usuarios, puedes:

1. **Desde la aplicación** (requiere acceso de administrador):
   - Ve a la sección de Usuarios
   - Haz clic en "Agregar Usuario"
   - Completa el formulario

2. **Desde la terminal** (creando tu propio seeder):
   ```powershell
   cd D:\UIT-master\server
   node src/seeders/seedMultipleUsers.js
   ```

3. **Crear script personalizado**:
   - Edita `seedMultipleUsers.js`
   - Agrega tus usuarios a la lista
   - Ejecuta el script

---

## ⚠️ Seguridad

**IMPORTANTE**: En producción, asegúrate de:
- Cambiar todas las contraseñas por defecto
- Implementar políticas de contraseñas seguras
- Habilitar autenticación de dos factores (2FA)
- Restringir accesos por IP si es necesario

---

## 📝 Notas

- Todos los usuarios están activos por defecto
- La contraseña para todos es: **demo123**
- Puedes modificar cualquier usuario desde la interfaz de administrador
- Los avatares son emojis que puedes cambiar


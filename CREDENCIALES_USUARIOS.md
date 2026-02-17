# 🔐 Credenciales de Usuarios - UIT Master ERP

## 📋 Usuarios Disponibles

- **Contraseña por defecto (si no se indica otra):** `demo123`

### 👨‍💼 Administrador
- **Email**: admin@textil.com
- **Nombre**: Carlos Mendoza
- **Rol**: administrador
- **Departamento**: Administración
- **Acceso**: Completo al sistema
- **Contraseña**: `Adm226....`

### 💼 Contabilidad
- **Email**: contabilidad@textil.com
- **Nombre**: María López
- **Rol**: contabilidad
- **Departamento**: Contabilidad
- **Acceso**: Gestión financiera y facturación
- **Contraseña**: `Ctd620...`

### 📊 Gerencia
- **Email**: gerencia@textil.com
- **Nombre**: Juan Pérez
- **Rol**: gerencia
- **Departamento**: Gerencia
- **Acceso**: Dashboards estratégicos y métricas
- **Contraseña**: `geR202...`

### 💻 Sistemas
- **Email**: sistemas@textil.com
- **Nombre**: Ana García
- **Rol**: sistemas
- **Departamento**: Sistemas
- **Acceso**: Gestión de incidencias y configuración
- **Contraseña**: `siS2026...`

### ⚙️ Ingeniería
- **Email**: ingenieria@textil.com
- **Nombre**: Daniel . P
- **Rol**: ingenieria
- **Departamento**: Ingeniería
- **Acceso**: Gestión de proyectos
- **Contraseña**: `inG226...`

### 🔧 Mantenimiento
- **Email**: mantenimiento@textil.com
- **Nombre**: Pedro Martínez
- **Rol**: mantenimiento
- **Departamento**: Mantenimiento
- **Acceso**: Gestión de equipos y órdenes
- **Contraseña**: `MAT266...`

### 👷 Usuarios de Producción (9 usuarios)
Cada usuario de producción tiene ahora una contraseña distinta:

1. **Hover Rojas** - hover.rojas@textil.com - Contraseña: `Hov226...`
2. **Maycol** - maycol@textil.com - Contraseña: `Myc226...`
3. **Alicia** - alicia@textil.com - Contraseña: `Alc226...`
4. **Elena** - elena@textil.com - Contraseña: `Ele226...`
5. **Rosa** - rosa@textil.com - Contraseña: `Ros226...`
6. **Alfredo** - alfredo@textil.com - Contraseña: `Alf226...`
7. **Eduardo** - eduardo@textil.com - Contraseña: `Edu226...`
8. **Juana** - juana@textil.com - Contraseña: `Jun226...`
9. **Alisson** - alisson@textil.com - Contraseña: `Als226...`

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
   cd "D:\Empresa UIT\UIT-master\server"
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


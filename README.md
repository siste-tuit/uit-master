# ERP Textil - Sistema de Gestión Empresarial

Sistema ERP interno desarrollado específicamente para plantas textiles pequeñas y medianas.

## Características Principales

### Módulos Implementados
- 📦 **Gestión de Inventarios**: Control de materias primas, productos en proceso y terminados
- 🏭 **Producción**: Órdenes de producción, planificación y control de calidad
- 🛒 **Compras**: Gestión de proveedores y órdenes de compra
- 💰 **Ventas**: Clientes, cotizaciones y facturación
- 📊 **Dashboard**: KPIs y reportes en tiempo real

### Tecnologías Utilizadas
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Estado**: Redux Toolkit

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd erp-textil

# Instalar dependencias
npm run install-all

# Configurar base de datos
# Crear base de datos PostgreSQL llamada 'erp_textil'
createdb erp_textil

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de BD
```

### Ejecución
```bash
# Desarrollo (frontend + backend)
npm run dev

# Solo backend
npm run server

# Solo frontend
npm run client
```

## Estructura del Proyecto

```
erp-textil/
├── frontend/          # Aplicación React
├── backend/           # API Node.js
├── database/          # Scripts de BD
└── docs/             # Documentación
```

## Características Específicas para Textil

- **Control de Lotes**: Seguimiento completo de materias primas
- **Gestión de Colores**: Sistema de códigos para tintes
- **Control de Calidad**: Registro de pruebas técnicas
- **Planificación**: Considerando tiempos de secado y tintura

## Usuarios por Defecto

- **Admin**: admin@textil.com / admin123
- **Producción**: prod@textil.com / prod123
- **Ventas**: ventas@textil.com / ventas123

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles.

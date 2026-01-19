# ERP Textil - Frontend

Sistema ERP moderno para planta textil desarrollado con React + Vite + TailwindCSS.

## 🚀 Características

- **Framework**: React 18 con Vite
- **Estilos**: TailwindCSS con paleta verde predominante
- **Routing**: React Router DOM con rutas protegidas
- **Gráficos**: Recharts para métricas y visualizaciones
- **Autenticación**: Sistema de roles con 4 niveles de acceso
- **Responsive**: Diseño adaptable a móviles y tablets

## 👥 Roles del Sistema

1. **Admin**: Acceso completo a todos los módulos
2. **Contabilidad**: Gestión financiera y facturación
3. **Gerencia**: Dashboards y métricas estratégicas
4. **Usuario**: Registro de producción y consulta de stock

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🔐 Credenciales de Demostración

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@textil.com | demo123 |
| Contabilidad | contabilidad@textil.com | demo123 |
| Gerencia | gerencia@textil.com | demo123 |
| Usuario | usuario@textil.com | demo123 |

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.tsx     # Navegación lateral
│   ├── Navbar.tsx      # Barra superior
│   ├── Cards.tsx       # Tarjetas de métricas
│   ├── Charts.tsx      # Componentes de gráficos
│   └── Layout.tsx      # Layout principal
├── pages/              # Páginas por rol
│   ├── LoginPage.tsx   # Página de login
│   ├── AdminDashboard.tsx
│   ├── ContabilidadDashboard.tsx
│   ├── GerenciaDashboard.tsx
│   └── UsuarioDashboard.tsx
├── context/            # Contextos de React
│   └── AuthContext.tsx # Manejo de autenticación
├── data/               # Datos mock
│   └── mockData.ts     # Datos de ejemplo
└── App.tsx            # Componente principal
```

## 🎨 Paleta de Colores

- **Primary**: Verde oscuro (#2E7D32)
- **Secondary**: Verde profesional (#4CAF50)
- **Accent**: Verde claro (#66BB6A)

## 📊 Funcionalidades por Rol

### Admin
- Dashboard completo con métricas
- Gestión de inventario
- Recursos humanos
- Reportes y análisis
- Acciones rápidas

### Contabilidad
- Métricas financieras
- Facturación reciente
- Resumen de cuentas
- Análisis de costos

### Gerencia
- KPIs estratégicos
- Análisis de mercado
- Objetivos empresariales
- Tendencias de ventas

### Usuario
- Registro de producción
- Estado del inventario
- Historial personal
- Objetivos diarios

## 🔧 Tecnologías Utilizadas

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Recharts
- Context API

## 📱 Responsive Design

El sistema está optimizado para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# El servidor se ejecutará en http://localhost:3000
```

## 📦 Build para Producción

```bash
# Construir aplicación
npm run build

# Los archivos se generarán en la carpeta dist/
```

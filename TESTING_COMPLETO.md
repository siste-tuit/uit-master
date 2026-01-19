# 🧪 PLAN DE TESTING COMPLETO - Sistema UIT

## ✅ TESTING YA REALIZADO

1. ✅ Configuración de URLs (14 páginas actualizadas)
2. ✅ Errores de TypeScript corregidos
3. ✅ Estructura de base de datos verificada
4. ✅ Autenticación y roles probados
5. ✅ Módulos principales identificados
6. ✅ Build de frontend verificado
7. ✅ Variables de entorno configuradas

---

## 🔍 TESTING PENDIENTE (CRÍTICO)

### 1. 🧪 Testing Funcional End-to-End

#### 1.1 Autenticación Completa
- [ ] **Login con todos los roles**:
  - [ ] Administrador (`admin@textil.com`)
  - [ ] Gerencia (`gerencia@textil.com`)
  - [ ] Ingeniería (`ingenieria@textil.com`)
  - [ ] Producción (13 usuarios)
  - [ ] Sistemas (`sistemas@textil.com`)
  - [ ] Contabilidad (`contabilidad@textil.com`)

- [ ] **Verificar redirecciones por rol**:
  - [ ] Admin → `/administracion/dashboard`
  - [ ] Gerencia → `/gerencia/production`
  - [ ] Ingeniería → `/ingenieria/dashboard`
  - [ ] Producción → `/produccion/dashboard`
  - [ ] Sistemas → `/sistemas/dashboard`

- [ ] **Logout y sesiones**:
  - [ ] Logout limpia el token
  - [ ] Rutas protegidas bloquean acceso sin token
  - [ ] Token expirado redirige a login

#### 1.2 Módulo de Producción
- [ ] **Dashboard de Producción**:
  - [ ] Carga métricas correctamente
  - [ ] Gráficos se renderizan
  - [ ] Datos se actualizan en tiempo real

- [ ] **Mi Producción** (Usuario Producción):
  - [ ] Ver pedidos recibidos
  - [ ] Registrar producción diaria
  - [ ] Ver historial de reportes
  - [ ] Generar PDF de reportes

- [ ] **Líneas de Producción**:
  - [ ] Listar líneas activas
  - [ ] Ver estado de cada línea
  - [ ] Asignar usuarios a líneas

#### 1.3 Módulo de Ingeniería
- [ ] **Dashboard de Ingeniería**:
  - [ ] Ver líneas de producción en tiempo real
  - [ ] Registrar producción desde ingeniería
  - [ ] Actualizar estado de líneas

- [ ] **Gestión de Pedidos**:
  - [ ] Crear nuevo pedido
  - [ ] Asignar pedido a usuario producción
  - [ ] Ver pedidos enviados

- [ ] **Flujos de Salida**:
  - [ ] Generar flujo de salida
  - [ ] Enviar flujo a Sistemas
  - [ ] Ver historial de flujos

- [ ] **Inventario**:
  - [ ] Ver items de inventario
  - [ ] Agregar nuevo item
  - [ ] Actualizar stock
  - [ ] Eliminar item

#### 1.4 Módulo de Gerencia
- [ ] **Dashboard de Producción**:
  - [ ] Ver estadísticas consolidadas
  - [ ] Gráficos de producción
  - [ ] Métricas de calidad

- [ ] **Dashboard de Inventario**:
  - [ ] Estadísticas de inventario
  - [ ] Items con stock bajo
  - [ ] Costos totales

#### 1.5 Módulo de Sistemas
- [ ] **Dashboard de Sistemas**:
  - [ ] Ver métricas del sistema
  - [ ] Incidencias pendientes
  - [ ] Logs recientes

- [ ] **Gestión de Incidencias**:
  - [ ] Crear incidencia
  - [ ] Asignar incidencia
  - [ ] Cambiar estado de incidencia
  - [ ] Filtrar incidencias

- [ ] **Flujos Recibidos**:
  - [ ] Ver flujos pendientes
  - [ ] Marcar como revisado
  - [ ] Marcar como procesado

- [ ] **Asistencia Global**:
  - [ ] Ver registros de asistencia
  - [ ] Filtrar por fecha/área
  - [ ] Exportar datos

- [ ] **Gestión de Usuarios**:
  - [ ] Listar usuarios
  - [ ] Crear usuario
  - [ ] Editar usuario
  - [ ] Eliminar/desactivar usuario

#### 1.6 Módulo de Administración
- [ ] **Dashboard de Admin**:
  - [ ] Ver métricas globales
  - [ ] Gráficos de producción
  - [ ] Métricas financieras

- [ ] **Gestión de Usuarios**:
  - [ ] CRUD completo de usuarios
  - [ ] Asignar roles
  - [ ] Cambiar departamentos

- [ ] **Configuración**:
  - [ ] Ver configuración empresa
  - [ ] Editar configuración
  - [ ] Guardar cambios

---

### 2. 🔌 Testing de API Endpoints

#### 2.1 Endpoints de Autenticación
- [ ] `POST /api/auth/login` - Login con credenciales válidas
- [ ] `POST /api/auth/login` - Login con credenciales inválidas
- [ ] `GET /api/auth/verify` - Verificar token válido
- [ ] `GET /api/auth/verify` - Verificar token inválido/expirado

#### 2.2 Endpoints de Producción
- [ ] `GET /api/produccion/ingenieria` - Listar líneas de producción
- [ ] `GET /api/produccion/lineas-con-usuarios` - Líneas con usuarios asignados
- [ ] `GET /api/produccion/mi-produccion?usuario_id=X` - Producción de usuario
- [ ] `POST /api/produccion/registrar` - Registrar producción
- [ ] `GET /api/produccion/metricas` - Métricas de producción

#### 2.3 Endpoints de Reportes
- [ ] `GET /api/reportes-produccion/usuarios-produccion` - Listar usuarios
- [ ] `GET /api/reportes-produccion/pedidos-recibidos/:userId` - Pedidos recibidos
- [ ] `GET /api/reportes-produccion/reportes-diarios` - Reportes diarios
- [ ] `GET /api/reportes-produccion/estadisticas-gerencia` - Estadísticas gerencia
- [ ] `POST /api/reportes-produccion/reportes-diarios` - Crear reporte

#### 2.4 Endpoints de Inventario
- [ ] `GET /api/inventario/por-departamento?departamento=X` - Items por departamento
- [ ] `GET /api/inventario/estadisticas-gerencia` - Estadísticas
- [ ] `POST /api/inventario/items` - Crear item
- [ ] `PUT /api/inventario/items/:id` - Actualizar item
- [ ] `DELETE /api/inventario/items/:id` - Eliminar item

#### 2.5 Endpoints de Flujos
- [ ] `GET /api/flujos-salida/recibidos` - Flujos recibidos
- [ ] `POST /api/flujos-salida/enviar` - Enviar flujo
- [ ] `PUT /api/flujos-salida/:id/estado` - Actualizar estado

#### 2.6 Endpoints de Incidencias
- [ ] `GET /api/incidencias` - Listar incidencias
- [ ] `GET /api/incidencias/:id` - Obtener incidencia
- [ ] `POST /api/incidencias` - Crear incidencia
- [ ] `PUT /api/incidencias/:id` - Actualizar incidencia

#### 2.7 Endpoints de Usuarios
- [ ] `GET /api/users` - Listar usuarios
- [ ] `GET /api/users/:id` - Obtener usuario
- [ ] `POST /api/users` - Crear usuario
- [ ] `PUT /api/users/:id` - Actualizar usuario
- [ ] `DELETE /api/users/:id` - Eliminar usuario

---

### 3. 🗄️ Testing de Base de Datos

#### 3.1 Migraciones
- [ ] Ejecutar `npm run migrate:all` desde cero
- [ ] Verificar que todas las tablas se crean
- [ ] Verificar foreign keys
- [ ] Verificar índices

#### 3.2 Seeders
- [ ] Ejecutar seeders de roles
- [ ] Ejecutar seeders de usuarios admin
- [ ] Ejecutar seeders de usuarios producción
- [ ] Verificar datos insertados

#### 3.3 Integridad de Datos
- [ ] Probar inserción de datos válidos
- [ ] Probar inserción de datos inválidos (debe fallar)
- [ ] Probar eliminación en cascada
- [ ] Probar actualización de relaciones

---

### 4. 🌐 Testing de Integración Frontend-Backend

#### 4.1 Comunicación API
- [ ] Verificar que todas las peticiones usan `API_BASE_URL_CORE`
- [ ] Verificar manejo de errores de conexión
- [ ] Verificar timeout de peticiones
- [ ] Verificar CORS configurado correctamente

#### 4.2 Manejo de Errores
- [ ] Error 401 (No autorizado) → Redirige a login
- [ ] Error 403 (Prohibido) → Muestra mensaje apropiado
- [ ] Error 404 (No encontrado) → Manejo adecuado
- [ ] Error 500 (Error servidor) → Muestra mensaje al usuario
- [ ] Error de red → Muestra mensaje de conexión

#### 4.3 Carga de Datos
- [ ] Páginas cargan datos del backend correctamente
- [ ] Loading states funcionan
- [ ] Empty states se muestran cuando no hay datos
- [ ] Refresh de datos funciona

---

### 5. 🎨 Testing de UI/UX

#### 5.1 Responsive Design
- [ ] Probar en móvil (< 640px)
- [ ] Probar en tablet (640px - 1024px)
- [ ] Probar en desktop (> 1024px)
- [ ] Probar navegación móvil
- [ ] Verificar menús responsive

#### 5.2 Navegación
- [ ] Navegación entre páginas funciona
- [ ] Breadcrumbs correctos
- [ ] Botones de retroceso funcionan
- [ ] Links externos abren correctamente

#### 5.3 Formularios
- [ ] Validación de campos requeridos
- [ ] Mensajes de error claros
- [ ] Submit funciona correctamente
- [ ] Loading en submit
- [ ] Mensajes de éxito

#### 5.4 Gráficos y Visualizaciones
- [ ] Gráficos se renderizan correctamente
- [ ] Datos se muestran correctamente
- [ ] Tooltips funcionan
- [ ] Zoom/pan en gráficos (si aplica)

---

### 6. ⚡ Testing de Rendimiento

#### 6.1 Tiempos de Carga
- [ ] Tiempo de carga inicial < 3 segundos
- [ ] Tiempo de carga de páginas < 2 segundos
- [ ] Tiempo de respuesta API < 500ms
- [ ] Build de producción optimizado

#### 6.2 Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Code splitting (si aplica)
- [ ] Compresión de assets
- [ ] Caché de peticiones (si aplica)

---

### 7. 🔒 Testing de Seguridad

#### 7.1 Autenticación
- [ ] Contraseñas hasheadas (bcrypt)
- [ ] JWT tokens expiran correctamente
- [ ] No se puede acceder sin token
- [ ] Tokens en localStorage (considerar httpOnly cookies en futuro)

#### 7.2 Autorización
- [ ] Usuarios solo ven lo permitido por su rol
- [ ] Endpoints protegidos por middleware
- [ ] Validación de datos en backend

#### 7.3 Variables de Entorno
- [ ] `.env` no está en Git
- [ ] Credenciales no en código
- [ ] JWT_SECRET es seguro

---

### 8. 🧪 Testing Manual (Checklist de Usuario)

#### 8.1 Flujo Completo de Producción
1. [ ] Login como usuario de producción
2. [ ] Ver pedidos recibidos
3. [ ] Registrar producción diaria
4. [ ] Ver mi producción histórica
5. [ ] Generar reporte PDF

#### 8.2 Flujo Completo de Ingeniería
1. [ ] Login como ingeniería
2. [ ] Ver líneas de producción
3. [ ] Crear pedido para producción
4. [ ] Enviar pedido a usuario producción
5. [ ] Generar flujo de salida
6. [ ] Enviar flujo a Sistemas

#### 8.3 Flujo Completo de Gerencia
1. [ ] Login como gerencia
2. [ ] Ver dashboard de producción
3. [ ] Ver estadísticas consolidadas
4. [ ] Ver dashboard de inventario
5. [ ] Exportar reportes

#### 8.4 Flujo Completo de Sistemas
1. [ ] Login como sistemas
2. [ ] Ver incidencias
3. [ ] Crear nueva incidencia
4. [ ] Ver flujos recibidos
5. [ ] Marcar flujo como procesado
6. [ ] Ver asistencia global

---

### 9. 🐛 Testing de Bugs Conocidos

#### 9.1 Verificar Fixes Aplicados
- [ ] ✅ URLs hardcodeadas eliminadas
- [ ] ✅ Errores TypeScript corregidos
- [ ] ✅ `pdf.setFont` corregido
- [ ] ✅ Tipos `ProductionMetric` corregidos

#### 9.2 Verificar que No Regresaron
- [ ] No hay URLs `localhost:5000` hardcodeadas
- [ ] Build de frontend no tiene errores críticos
- [ ] Todas las páginas usan `API_BASE_URL_CORE`

---

### 10. 📱 Testing de Navegadores

#### 10.1 Navegadores a Probar
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Edge (última versión)
- [ ] Safari (si es posible)

#### 10.2 Verificaciones por Navegador
- [ ] Login funciona
- [ ] Navegación funciona
- [ ] Gráficos se renderizan
- [ ] Formularios funcionan
- [ ] No hay errores en consola

---

## 📋 PRIORIDADES DE TESTING

### 🔴 CRÍTICO (Hacer antes de producción)
1. ✅ Testing de autenticación completa
2. ✅ Testing de módulos principales (Producción, Ingeniería, Gerencia)
3. ✅ Testing de API endpoints críticos
4. ✅ Testing de migraciones
5. ✅ Testing de integración Frontend-Backend

### 🟡 IMPORTANTE (Hacer si hay tiempo)
6. Testing de UI/UX responsive
7. Testing de rendimiento
8. Testing de seguridad avanzado
9. Testing de múltiples navegadores

### 🟢 OPCIONAL (Mejoras futuras)
10. Testing automatizado (Jest, Cypress)
11. Testing de carga (stress testing)
12. Testing de accesibilidad

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar Testing Crítico**: Probar autenticación y módulos principales
2. **Verificar API Endpoints**: Usar Postman o curl para probar endpoints
3. **Probar Migraciones**: Ejecutar `npm run migrate:all` en entorno limpio
4. **Testing Manual**: Seguir flujos de usuario completos
5. **Documentar Bugs**: Crear lista de issues encontrados

---

## 📊 CHECKLIST DE TESTING RÁPIDO (30 minutos)

Si solo tienes 30 minutos, prueba esto:

- [ ] Login con 3 roles diferentes
- [ ] Verificar dashboard carga datos
- [ ] Probar crear/editar en 1 módulo principal
- [ ] Verificar que errores se manejan correctamente
- [ ] Probar en móvil (responsive)
- [ ] Verificar build de producción funciona

---

**¿Listo para empezar el testing?** Prioriza lo CRÍTICO primero. 🧪

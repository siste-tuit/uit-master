import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/Auth/LoginPage';
import AdminDashboard from './pages/Administracion/AdminDashboard';
import AdminUsersPage from './pages/Administracion/AdminUsersPage';
import AdminConfigPage from './pages/Administracion/AdminConfigPage';
import AdminReportsPage from './pages/Administracion/AdminReportsPage';
import SistemasDashboard from './pages/Sistemas/SistemasDashboard';
import IncidenciasPage from './pages/Sistemas/IncidenciasPage';
import FlujosRecibidosPage from './pages/Sistemas/FlujosRecibidosPage';
import AsistenciaGlobalPage from './pages/Sistemas/AsistenciaGlobalPage';
import UsuariosPage from './pages/Sistemas/UsuariosPage';
import LogsPage from './pages/Sistemas/LogsPage';
import MantenimientoDashboard from './pages/Mantenimiento/MantenimientoDashboard';
import EquiposPage from './pages/Mantenimiento/EquiposPage';
import OrdenesTrabajoPage from './pages/Mantenimiento/OrdenesTrabajoPage';
import RepuestosPage from './pages/Mantenimiento/RepuestosPage';
import CalendarioMantenimientoPage from './pages/Mantenimiento/CalendarioMantenimientoPage';
import ContabilidadDashboard from './pages/Contabilidad/ContabilidadDashboard';
import ContabilidadFinanzasPage from './pages/Contabilidad/ContabilidadFinanzasPage';
import ContabilidadFacturacionPage from './pages/Contabilidad/ContabilidadFacturacionPage';
import ContabilidadReportesPage from './pages/Contabilidad/ContabilidadReportesPage';
import GerenciaProduccionPage from './pages/Gerencia/GerenciaProduccionPage';
import GerenciaInventarioPage from './pages/Gerencia/GerenciaInventarioPage';
import UsuarioDashboard from './pages/Produccion/UsuarioDashboard';
import UsuarioMiProduccionPage from './pages/Produccion/UsuarioMiProduccionPage';
import TrabajadoresPage from './pages/Produccion/TrabajadoresPage';
import AsistenciaPage from './pages/Produccion/AsistenciaPage';;
import UsuarioPerfilPage from './pages/Produccion/UsuarioPerfilPage';
import IngenieriaDashboard from './pages/Ingenieria/IngenieriaDashboard';
import IngenieriaProduccionPage from './pages/Ingenieria/IngenieriaProduccionPage';
import IngenieriaHistorialPage from './pages/Ingenieria/IngenieriaHistorialPage';
import IngenieriaReportesPage from './pages/Ingenieria/IngenieriaReportesPage';
import IngenieriaInventarioPage from './pages/Ingenieria/IngenieriaInventarioPage';
import IngenieriaReportesUsuariosPage from './pages/Ingenieria/IngenieriaReportesUsuariosPage';
import IngenieriaFichaEntregaPage from './pages/Ingenieria/IngenieriaFichaEntregaPage';
import IngenieriaFichaSalidaPage from './pages/Ingenieria/IngenieriaFichaSalidaPage';

// PROVIDERS
import { UsuariosProvider } from './context/UsuariosContext';
import { DepartamentoProvider } from './context/DepartamentContext';
import { ConfiguracionProvider } from './context/ConfigContext';
import { IncidenciasProvider } from './context/IncidenciasContext';
import { LogsProvider } from './context/LogContext';
import { EquipoProvider } from './context/EquipoContext';
import { OrdenTrabajoProvider } from './context/OrdenContext';
import { RepuestoProvider } from './context/RepuestoContext';
import { CalendarioProvider } from './context/CalendarioContext';
function App() {
  return (
    <AuthProvider>
      <UsuariosProvider>
        <LogsProvider>
          <IncidenciasProvider>
            <DepartamentoProvider>
              <EquipoProvider>
                <OrdenTrabajoProvider>
                  <RepuestoProvider>
                    <CalendarioProvider>
                      <ConfiguracionProvider>
                        <Router
                          future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true
                          }}
                        >
                          <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={<Navigate to="/login" replace />} />

                            <Route path="/" element={<Layout />}>
                              <Route
                                path="administracion/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['administrador', 'gerencia']}>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="administracion/users"
                                element={
                                  <ProtectedRoute allowedRoles={['administrador', 'gerencia']}>
                                    <AdminUsersPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="administracion/config"
                                element={
                                  <ProtectedRoute allowedRoles={['administrador', 'gerencia']}>
                                    <AdminConfigPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="administracion/reports"
                                element={
                                  <ProtectedRoute allowedRoles={['administrador', 'gerencia']}>
                                    <AdminReportsPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="sistemas/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <SistemasDashboard />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="sistemas/incidencias"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <IncidenciasPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="sistemas/flujos-recibidos"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <FlujosRecibidosPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="sistemas/asistencia"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <AsistenciaGlobalPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="sistemas/usuarios"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <UsuariosPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="sistemas/logs"
                                element={
                                  <ProtectedRoute allowedRoles={['sistemas', 'gerencia']}>
                                    <LogsPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="mantenimiento/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['mantenimiento', 'gerencia']}>
                                    <MantenimientoDashboard />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="mantenimiento/equipos"
                                element={
                                  <ProtectedRoute allowedRoles={['mantenimiento', 'gerencia']}>
                                    <EquiposPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="mantenimiento/ordenes"
                                element={
                                  <ProtectedRoute allowedRoles={['mantenimiento', 'gerencia']}>
                                    <OrdenesTrabajoPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="mantenimiento/repuestos"
                                element={
                                  <ProtectedRoute allowedRoles={['mantenimiento', 'gerencia']}>
                                    <RepuestosPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="mantenimiento/calendario"
                                element={
                                  <ProtectedRoute allowedRoles={['mantenimiento', 'gerencia']}>
                                    <CalendarioMantenimientoPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="contabilidad/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['contabilidad', 'gerencia']}>
                                    <ContabilidadDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="contabilidad/finances"
                                element={
                                  <ProtectedRoute allowedRoles={['contabilidad', 'gerencia']}>
                                    <ContabilidadFinanzasPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="contabilidad/billing"
                                element={
                                  <ProtectedRoute allowedRoles={['contabilidad', 'gerencia']}>
                                    <ContabilidadFacturacionPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="contabilidad/reports"
                                element={
                                  <ProtectedRoute allowedRoles={['contabilidad', 'gerencia']}>
                                    <ContabilidadReportesPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="gerencia/production"
                                element={
                                  <ProtectedRoute allowedRoles={['gerencia']}>
                                    <GerenciaProduccionPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="gerencia/sales"
                                element={
                                  <ProtectedRoute allowedRoles={['gerencia']}>
                                    <Navigate to="/gerencia/production" replace />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="gerencia/inventory"
                                element={
                                  <ProtectedRoute allowedRoles={['gerencia']}>
                                    <GerenciaInventarioPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="ingenieria/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/produccion"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaProduccionPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/reportes"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaReportesPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/ficha-entrega"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaFichaEntregaPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/ficha-salida"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaFichaSalidaPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/inventario"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaInventarioPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/historial"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaHistorialPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="ingenieria/reportes-usuarios"
                                element={
                                  <ProtectedRoute allowedRoles={['ingenieria', 'gerencia']}>
                                    <IngenieriaReportesUsuariosPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="produccion/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={['usuarios']}>
                                    <UsuarioDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="produccion/mi-produccion"
                                element={
                                  <ProtectedRoute allowedRoles={['usuarios']}>
                                    <UsuarioMiProduccionPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="produccion/profile"
                                element={
                                  <ProtectedRoute allowedRoles={['usuarios']}>
                                    <UsuarioPerfilPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="produccion/trabajadores"
                                element={
                                  <ProtectedRoute allowedRoles={['usuarios']}>
                                    <TrabajadoresPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="produccion/asistencia"
                                element={
                                  <ProtectedRoute allowedRoles={['usuarios']}>
                                    <AsistenciaPage />
                                  </ProtectedRoute>
                                }
                              />
                            </Route>
                          </Routes>
                        </Router>
                      </ConfiguracionProvider>
                    </CalendarioProvider>
                  </RepuestoProvider>
                </OrdenTrabajoProvider>
              </EquipoProvider>
            </DepartamentoProvider>
          </IncidenciasProvider>
        </LogsProvider>
      </UsuariosProvider>
    </AuthProvider >
  );
}

export default App;

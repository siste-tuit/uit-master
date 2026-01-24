import express from 'express';
import {
    recibirPedido,
    enviarPedidoAUsuario,
    enviarReporteDiario,
    enviarReporteAUsuario,
    getReportesPorUsuario,
    getTodosLosReportes,
    getPedidosRecibidosPorUsuario,
    getEstadisticasUsuario,
    getEstadisticasGerencia,
    getUsuariosProduccion,
    getHistorialIngenieria
} from '../controllers/reportesProduccionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas para pedidos recibidos
// Ingeniería puede enviar pedidos a usuarios de producción
router.post('/pedidos-recibidos/enviar', authenticateToken, authorizeRoles(['ingenieria']), enviarPedidoAUsuario);
// Usuarios de producción pueden ver sus pedidos recibidos (solo lectura)
router.get('/pedidos-recibidos/:usuario_id', authenticateToken, authorizeRoles(['usuarios']), getPedidosRecibidosPorUsuario);
// Obtener lista de usuarios de producción (para Ingeniería)
router.get('/usuarios-produccion', authenticateToken, authorizeRoles(['ingenieria', 'gerencia']), getUsuariosProduccion);
// Mantener ruta antigua por compatibilidad (deprecated)
router.post('/pedidos-recibidos', authenticateToken, authorizeRoles(['usuarios']), recibirPedido);

// Rutas para reportes diarios
// Ingeniería puede enviar reportes a usuarios de producción
router.post('/reportes-diarios/enviar', authenticateToken, authorizeRoles(['ingenieria']), enviarReporteAUsuario);
// Usuarios de producción pueden enviar sus propios reportes
router.post('/reportes-diarios', authenticateToken, authorizeRoles(['usuarios']), enviarReporteDiario);
// Usuarios de producción pueden ver sus reportes (incluyendo los enviados por Ingeniería)
router.get('/reportes-diarios/usuario/:usuario_id', authenticateToken, authorizeRoles(['usuarios']), getReportesPorUsuario);
// Ingeniería puede ver todos los reportes
router.get('/reportes-diarios', authenticateToken, authorizeRoles(['ingenieria', 'gerencia']), getTodosLosReportes);

// Rutas para estadísticas
// Ruta para estadísticas del usuario (usuarios de producción)
router.get('/estadisticas/:usuario_id', authenticateToken, authorizeRoles(['usuarios']), getEstadisticasUsuario);
// Ruta para estadísticas agregadas para Gerencia (diarias, semanales, mensuales, efectividad por usuario)
router.get('/estadisticas-gerencia', authenticateToken, authorizeRoles(['gerencia']), getEstadisticasGerencia);
// Historial de documentos para Ingeniería y Gerencia
router.get('/historial', authenticateToken, authorizeRoles(['ingenieria', 'gerencia']), getHistorialIngenieria);

export default router;


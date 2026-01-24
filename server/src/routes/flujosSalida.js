import express from 'express';
import {
  enviarFlujoSalida,
  getFlujosRecibidos,
  actualizarEstadoFlujo,
  getUsuariosSistemas
} from '../controllers/flujosSalidaController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ingeniería puede enviar flujos de salida a Sistemas
router.post('/enviar', authenticateToken, authorizeRoles(['ingenieria']), enviarFlujoSalida);

// Obtener usuarios de Sistemas (para que Ingeniería pueda seleccionar)
router.get('/usuarios-sistemas', authenticateToken, authorizeRoles(['ingenieria']), getUsuariosSistemas);

// Sistemas puede ver sus flujos recibidos
router.get('/recibidos', authenticateToken, authorizeRoles(['sistemas', 'gerencia']), getFlujosRecibidos);

// Sistemas puede actualizar el estado de un flujo
router.put('/:id/estado', authenticateToken, authorizeRoles(['sistemas']), actualizarEstadoFlujo);

export default router;


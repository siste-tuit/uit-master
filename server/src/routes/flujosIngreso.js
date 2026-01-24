import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { enviarFlujoIngreso, getFlujosIngreso } from '../controllers/flujosIngresoController.js';

const router = express.Router();

// Ingeniería registra flujos de ingreso
router.post('/', authenticateToken, authorizeRoles(['ingenieria']), enviarFlujoIngreso);

// Ingeniería/Gerencia pueden ver flujos de ingreso
router.get('/', authenticateToken, authorizeRoles(['ingenieria', 'gerencia']), getFlujosIngreso);

export default router;

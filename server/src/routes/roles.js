// routes/roles.js

import express from 'express';
import { getAllRoles } from '../controllers/roleController.js';
// Importa middleware de autenticación si proteges esta ruta
// import { protect, restrictTo } from '../middleware/authMiddleware.js'; 

const router = express.Router();
router.get('/', getAllRoles); 

export default router;
import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    getConfiguracionFacturas,
    updateConfiguracionFacturas
} from "../controllers/configuracionFacturasController.js";

const router = express.Router();

router.use(authenticateToken);

// Rutas de configuración de facturas
router.get("/", authorizeRoles(['contabilidad', 'administrador', 'gerencia']), getConfiguracionFacturas); // Lectura para contabilidad, admin y gerencia
router.post("/", authorizeRoles(['contabilidad', 'administrador']), updateConfiguracionFacturas); // Escritura solo para contabilidad y admin

export default router;

import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    getContabilidadDashboard,
    getPlanilla,
    getInventarioGeneral,
    getFacturas,
    createFactura
} from "../controllers/contabilidadController.js";

const router = express.Router();

router.use(authenticateToken);
const lecturaRoles = ['contabilidad', 'gerencia'];

router.get("/dashboard", authorizeRoles(lecturaRoles), getContabilidadDashboard);
router.get("/planilla", authorizeRoles(lecturaRoles), getPlanilla);
router.get("/inventario", authorizeRoles(lecturaRoles), getInventarioGeneral);
router.get("/facturas", authorizeRoles(lecturaRoles), getFacturas);
router.post("/facturas", authorizeRoles('contabilidad'), createFactura);

export default router;

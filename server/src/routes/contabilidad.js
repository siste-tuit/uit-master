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
router.use(authorizeRoles('contabilidad'));

router.get("/dashboard", getContabilidadDashboard);
router.get("/planilla", getPlanilla);
router.get("/inventario", getInventarioGeneral);
router.get("/facturas", getFacturas);
router.post("/facturas", createFactura);

export default router;

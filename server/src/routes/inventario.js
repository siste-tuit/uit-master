import express from "express";
import { getInventarioPorDepartamento, getResumenInventarioDepartamentos, crearItemInventario, actualizarItemInventario, eliminarItemInventario, getEstadisticasInventarioGerencia } from "../controllers/inventarioController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/por-departamento", getInventarioPorDepartamento);
router.get("/resumen-departamentos", getResumenInventarioDepartamentos);
router.get("/estadisticas-gerencia", authenticateToken, authorizeRoles(['gerencia']), getEstadisticasInventarioGerencia);
router.post("/items", crearItemInventario);
router.put("/items/:id", actualizarItemInventario);
router.delete("/items/:id", eliminarItemInventario);

export default router;


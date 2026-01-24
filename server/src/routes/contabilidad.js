import express from "express";
import { getIngresosMensuales, getMetricasFinancieras, getRegistrosFinancierosRecientes } from "../controllers/contabilidadController.js";

const router = express.Router();

router.get("/ingresos-mensuales", getIngresosMensuales);
router.get("/metricas", getMetricasFinancieras);
router.get("/registros", getRegistrosFinancierosRecientes);

export default router;


import express from "express";
import { getIngresosMensuales, getMetricasFinancieras } from "../controllers/contabilidadController.js";

const router = express.Router();

router.get("/ingresos-mensuales", getIngresosMensuales);
router.get("/metricas", getMetricasFinancieras);

export default router;


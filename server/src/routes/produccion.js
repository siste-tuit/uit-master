import express from "express";
import { getMetricasProduccion, getProduccionIngenieria, registrarProduccion, actualizarEstadoLinea, getProduccionPorPeriodo, getMiProduccion, getLineasConUsuarios } from "../controllers/produccionController.js";

const router = express.Router();

router.get("/metricas", getMetricasProduccion);
router.get("/periodo", getProduccionPorPeriodo);
router.get("/ingenieria", getProduccionIngenieria);
router.get("/lineas-con-usuarios", getLineasConUsuarios);
router.get("/mi-produccion", getMiProduccion);
router.post("/registrar", registrarProduccion);
router.put("/linea/:id/estado", actualizarEstadoLinea);

export default router;


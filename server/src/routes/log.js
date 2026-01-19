// src/routes/logs.js
import express from "express";
import { getLogs, createLog, getResumenLogs } from "../controllers/logsController.js";

const router = express.Router();

// 📋 Obtener todos los logs (con filtros opcionales)
router.get("/", getLogs);

// 🧮 Obtener resumen general de logs
router.get("/resumen", getResumenLogs);

// 📝 Registrar un nuevo log
router.post("/", createLog);

export default router;

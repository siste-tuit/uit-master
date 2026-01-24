import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    getRegistrosAsistencia,
    createOrUpdateRegistroAsistencia,
    getResumenAsistencia,
    getRegistrosAsistenciaGlobal
} from "../controllers/asistenciaController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para usuarios (solo ven sus datos)
router.get("/", authorizeRoles('usuarios'), getRegistrosAsistencia);
router.get("/resumen", authorizeRoles('usuarios'), getResumenAsistencia);
router.post("/", authorizeRoles('usuarios'), createOrUpdateRegistroAsistencia);
router.put("/", authorizeRoles('usuarios'), createOrUpdateRegistroAsistencia); // También acepta PUT para actualizar

// Ruta para sistemas (visualizar todo)
router.get("/admin/global", authorizeRoles(['sistemas', 'gerencia']), getRegistrosAsistenciaGlobal);

export default router;


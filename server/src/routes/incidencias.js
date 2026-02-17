import express from "express";
import {
    getIncidencias,
    getIncidenciaById,
    createIncidencia,
    updateIncidencia,
    deleteIncidencia,
    createIncidenciaSoporte,
} from "../controllers/incidenciasController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getIncidencias);            // GET /api/incidencias
router.get("/:id", getIncidenciaById);      // GET /api/incidencias/:id
router.post("/", createIncidencia);         // POST /api/incidencias

// Endpoint específico para tickets de soporte creados por usuarios de producción
router.post(
    "/soporte",
    authenticateToken,
    authorizeRoles("usuarios"),
    createIncidenciaSoporte
);                                          // POST /api/incidencias/soporte

router.put("/:id", updateIncidencia);       // PUT /api/incidencias/:id
router.delete("/:id", deleteIncidencia);    // DELETE /api/incidencias/:id

export default router;

import express from "express";
import {
    getIncidencias,
    getIncidenciaById,
    createIncidencia,
    updateIncidencia,
    deleteIncidencia,
} from "../controllers/incidenciasController.js";

const router = express.Router();

router.get("/", getIncidencias);            // GET /api/incidencias
router.get("/:id", getIncidenciaById);      // GET /api/incidencias/:id
router.post("/", createIncidencia);         // POST /api/incidencias
router.put("/:id", updateIncidencia);       // PUT /api/incidencias/:id
router.delete("/:id", deleteIncidencia);    // DELETE /api/incidencias/:id

export default router;

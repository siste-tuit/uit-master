import express from "express";
import {
    getEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from "../controllers/equipoController.js";

const router = express.Router();

router.get("/", getEquipos);         // GET /api/equipos
router.get("/:id", getEquipoById);   // GET /api/equipos/:id
router.post("/", createEquipo);      // POST /api/equipos
router.put("/:id", updateEquipo);    // PUT /api/equipos/:id
router.delete("/:id", deleteEquipo); // DELETE /api/equipos/:id

export default router;
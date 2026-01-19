import express from "express";
import {
    getEventosCalendario,
    getEventoCalendarioById,
    createEventoCalendario,
    updateEventoCalendario,
    deleteEventoCalendario,
} from "../controllers/calendarioController.js";

const router = express.Router();

router.get("/", getEventosCalendario);         // GET /api/calendario
router.get("/:id", getEventoCalendarioById);   // GET /api/calendario/:id
router.post("/", createEventoCalendario);      // POST /api/calendario
router.put("/:id", updateEventoCalendario);    // PUT /api/calendario/:id
router.delete("/:id", deleteEventoCalendario); // DELETE /api/calendario/:id

export default router;
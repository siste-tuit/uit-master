import express from "express";
import {
    getOrdenesTrabajo,
    getOrdenTrabajoById,
    createOrdenTrabajo,
    updateOrdenTrabajo,
    deleteOrdenTrabajo,
} from "../controllers/ordenController.js";

const router = express.Router();

router.get("/", getOrdenesTrabajo);         // GET /api/ordenes-trabajo
router.get("/:id", getOrdenTrabajoById);   // GET /api/ordenes-trabajo/:id
router.post("/", createOrdenTrabajo);      // POST /api/ordenes-trabajo
router.put("/:id", updateOrdenTrabajo);    // PUT /api/ordenes-trabajo/:id
router.delete("/:id", deleteOrdenTrabajo); // DELETE /api/ordenes-trabajo/:id

export default router;
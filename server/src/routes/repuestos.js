import express from "express";
import {
    getRepuestos,
    getRepuestoById,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
} from "../controllers/repuestoController.js";

const router = express.Router();

router.get("/", getRepuestos);         // GET /api/repuestos
router.get("/:id", getRepuestoById);   // GET /api/repuestos/:id
router.post("/", createRepuesto);      // POST /api/repuestos
router.put("/:id", updateRepuesto);    // PUT /api/repuestos/:id
router.delete("/:id", deleteRepuesto); // DELETE /api/repuestos/:id

export default router;
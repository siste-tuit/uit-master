// src/routes/departament.js
import express from "express";
import {
    getDepartamentos,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
} from "../controllers/departamentController.js";

const router = express.Router();

router.get("/", getDepartamentos);        // GET /api/departamentos
router.post("/", createDepartamento);     // POST /api/departamentos
router.put("/:id", updateDepartamento);   // PUT /api/departamentos/:id
router.delete("/:id", deleteDepartamento);// DELETE /api/departamentos/:id

export default router;

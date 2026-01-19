// src/routes/config.js
import express from "express";
import {
  getConfiguracion,
  updateConfiguracion,
} from "../controllers/configController.js";

const router = express.Router();

router.get("/", getConfiguracion);      // GET /api/configuracion
router.put("/:id", updateConfiguracion);   // PUT /api/configuracion

export default router;

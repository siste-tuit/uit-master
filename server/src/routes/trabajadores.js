import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    getTrabajadoresByUsuario,
    createTrabajador,
    updateTrabajador,
    deleteTrabajador
} from "../controllers/trabajadoresController.js";

const router = express.Router();

// Todas las rutas requieren autenticación Y rol de usuarios
router.use(authenticateToken);
router.use(authorizeRoles('usuarios'));

router.get("/", getTrabajadoresByUsuario);
router.post("/", createTrabajador);
router.put("/:trabajadorId", updateTrabajador);
router.delete("/:trabajadorId", deleteTrabajador);

export default router;


// routes/users.js

import express from 'express';
import { getAllUsers, createUser, updateUser, toggleUserStatus } from '../controllers/userController.js';
// Importa middleware de autenticación si ya lo tienes, para proteger estas rutas
// import { protect, restrictTo } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Nota: En un ERP real, todas estas rutas deberían estar protegidas 
// (ej: protect, restrictTo('administrador', 'sistemas')).

// Listar todos los usuarios
router.get('/', getAllUsers);

// Crear nuevo usuario
router.post('/', createUser);

// Actualizar datos de un usuario por ID
router.put('/:id', updateUser);

// Activar/Desactivar cuenta por ID
router.patch('/:id/status', toggleUserStatus);

export default router;
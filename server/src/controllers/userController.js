// controllers/userController.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

// --- Funciones de Utilidad ---

// Función para obtener todos los usuarios con información de su rol
async function fetchAllUsers() {
    const [rows] = await pool.query(`
        SELECT 
            u.id, u.email, u.nombre_completo as name, u.departamento as department, u.avatar, 
            u.is_active, u.created_at, u.last_login,
            r.nombre as role_name, r.id as role_id
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        ORDER BY u.created_at DESC
    `);
    return rows;
}

// --- Operaciones del Controlador ---

/**
 * [GET] Listar todos los usuarios
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await fetchAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al listar usuarios.' });
    }
};

/**
 * [POST] Crear un nuevo usuario (Requiere que se envíe una contraseña)
 */
export const createUser = async (req, res) => {
    try {
        const { email, password, name, role_id, department, avatar } = req.body;

        if (!email || !password || !name || !role_id) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        // 1. Verificar si el usuario ya existe
        const [existingUser] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso.' });
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const userId = uuidv4();

        // 3. Insertar el nuevo usuario
        await pool.query(
            `INSERT INTO usuarios 
            (id, email, password, nombre_completo, rol_id, departamento, avatar, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [userId, email, hashedPassword, name, role_id, department || null, avatar || '👤']
        );

        // Opcional: retornar la lista actualizada o solo el usuario creado
        const users = await fetchAllUsers();
        res.status(201).json({ 
            message: 'Usuario creado exitosamente.',
            users: users // Retornamos la lista para actualizar el estado del frontend
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * [PUT] Actualizar datos de un usuario
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role_id, department, avatar, new_password } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (name) { updateFields.push("nombre_completo = ?"); updateValues.push(name); }
        if (role_id) { updateFields.push("rol_id = ?"); updateValues.push(role_id); }
        if (department) { updateFields.push("departamento = ?"); updateValues.push(department); }
        if (avatar) { updateFields.push("avatar = ?"); updateValues.push(avatar); }

        // Si se proporciona una nueva contraseña, hashearla
        if (new_password) {
            const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
            updateFields.push("password = ?");
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar.' });
        }

        const query = `
            UPDATE usuarios 
            SET ${updateFields.join(', ')} 
            WHERE id = ?
        `;

        await pool.query(query, [...updateValues, id]);

        const users = await fetchAllUsers();
        res.status(200).json({ 
            message: 'Usuario actualizado exitosamente.',
            users: users
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * [PATCH] Desactivar / Activar una cuenta (is_active)
 */
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; // Esperamos un booleano (true/false)

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ message: 'El campo is_active es obligatorio y debe ser booleano.' });
        }

        await pool.query(
            "UPDATE usuarios SET is_active = ? WHERE id = ?",
            [is_active, id]
        );
        
        const users = await fetchAllUsers();
        res.status(200).json({ 
            message: `Cuenta de usuario ${is_active ? 'activada' : 'desactivada'} exitosamente.`,
            users: users
        });

    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
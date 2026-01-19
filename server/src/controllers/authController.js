// controllers/authController.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; // Asumo que el pool de DB está aquí
import dotenv from 'dotenv';

dotenv.config();

// Se recomienda usar un valor más alto en producción, ej: 10
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo';

/**
 * Registra un nuevo usuario (ADMIN ONLY) - Función de ayuda.
 * Nota: En un ERP, el registro de usuarios NO es público.
 * @param {string} email
 * @param {string} password
 * @param {string} nombre_completo
 * @param {string} rol_id
 * @param {string} departamento
 */
export const registerUser = async (req, res) => {
    try {
        const { email, password, nombre_completo, rol_id, departamento } = req.body;

        // 1. Verificar si el usuario ya existe
        const [existingUser] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. Insertar el nuevo usuario
        const [result] = await pool.query(
            `INSERT INTO usuarios 
            (id, email, password, nombre_completo, rol_id, departamento, is_active)
            VALUES (UUID(), ?, ?, ?, ?, ?, TRUE)`, // Usando UUID() para el ID
            [email, hashedPassword, nombre_completo, rol_id, departamento]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


/**
 * Función de login del usuario. Genera un JWT al ser exitoso.
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar el usuario por email
        const [rows] = await pool.query(
            `SELECT 
                u.id, u.email, u.password, u.nombre_completo as name, u.departamento, u.avatar, u.is_active, 
                r.nombre as role, r.dashboard_path 
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        const user = rows[0];

        // 2. Verificar si el usuario existe y está activo
        if (!user || !user.is_active) {
            // Usamos un mensaje genérico para seguridad
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 3. Comparar la contraseña hasheada
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 4. Generar el Token Web JSON (JWT)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' } // Token expira en 8 horas
        );

        // 5. Actualizar last_login
        await pool.query(
            "UPDATE usuarios SET last_login = NOW() WHERE id = ?",
            [user.id]
        );

        // 6. Preparar datos del usuario para el frontend
        // Excluir el campo 'password' antes de enviarlo
        const { password: _, ...userData } = user;

        // 7. Asegurar que el dashboard_path sea correcto (fallback si está desactualizado)
        let dashboardPath = user.dashboard_path;
        
        // Si el rol es gerencia y el path apunta al dashboard eliminado, usar production
        if (user.role === 'gerencia' && dashboardPath === '/gerencia/dashboard') {
            dashboardPath = '/gerencia/production';
            console.log(`⚠️ Dashboard path corregido para gerencia: ${dashboardPath}`);
        }

        // El frontend recibirá el token y los datos del usuario (sin password)
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token: token,
            user: userData, // Contiene id, email, name, role, departamento, etc.
            dashboardPath: dashboardPath
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * Función de Logout (Solo para consistencia, el lado del servidor solo invalida el token si usa una lista negra)
 * En este caso, solo enviamos un mensaje de éxito. El frontend es el que realmente elimina el token.
 */
export const logoutUser = (req, res) => {
    // En un sistema simple basado en JWT, el logout es manejado principalmente por el cliente
    // eliminando el token. El servidor solo confirma la acción.
    res.status(200).json({ success: true, message: 'Logout exitoso. Por favor, elimina el token en el cliente.' });
};
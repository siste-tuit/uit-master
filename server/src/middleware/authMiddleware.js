import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const isDev = process.env.NODE_ENV !== 'production';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado en el entorno');
}

/**
 * Middleware para verificar el token JWT
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token de acceso requerido' 
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Obtener información del usuario desde la base de datos
        const [users] = await pool.query(
            `SELECT 
                u.id, 
                u.email, 
                u.nombre_completo as name, 
                u.is_active,
                r.nombre as role
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no válido o inactivo' 
            });
        }

        // Agregar información del usuario al request
        const userRole = users[0].role || null;
        
        // Normalizar el rol (trim y lower case para comparaciones consistentes)
        const userRoleNormalizado = userRole ? userRole.toString().trim().toLowerCase() : null;
        
        req.user = {
            id: users[0].id,
            email: users[0].email,
            name: users[0].name,
            role: userRoleNormalizado // Siempre usar el normalizado
        };

        if (isDev) {
            console.log(`[authenticateToken] Usuario autenticado: ${users[0].email}`);
            console.log(`   - Rol original en BD: "${userRole}"`);
            console.log(`   - Rol normalizado guardado: "${userRoleNormalizado}"`);
        }

        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expirado' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido' 
            });
        }

        return res.status(401).json({ 
            success: false,
            message: 'Error de autenticación' 
        });
    }
};

/**
 * Middleware para verificar roles específicos
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            if (isDev) {
                console.log('[authorizeRoles] Autorizacion fallida: Usuario no autenticado');
            }
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no autenticado' 
            });
        }

        const userRole = req.user.role; // Ya está normalizado desde authenticateToken
        
        // Manejar diferentes formas de pasar los roles
        // Si se pasa como authorizeRoles(['rol1', 'rol2']), allowedRoles[0] será el array
        // Si se pasa como authorizeRoles('rol1', 'rol2'), allowedRoles será ['rol1', 'rol2']
        let rolesPermitidos = [];
        if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
            rolesPermitidos = allowedRoles[0];
        } else {
            rolesPermitidos = allowedRoles;
        }
        
        // Normalizar roles permitidos (convertir a minúsculas y trim)
        const rolesPermitidosNormalizados = rolesPermitidos.map(r => {
            const rol = r.toString().trim().toLowerCase();
            return rol;
        });

        if (isDev) {
            console.log(`[authorizeRoles] Verificando autorizacion:`);
            console.log(`   - Usuario: ${req.user.email}`);
            console.log(`   - Rol del usuario (ya normalizado): "${userRole}"`);
            console.log(`   - Roles permitidos (originales):`, rolesPermitidos);
            console.log(`   - Roles permitidos (normalizados):`, rolesPermitidosNormalizados);
            console.log(`   - Rol permitido: ${rolesPermitidosNormalizados.includes(userRole)}`);
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!userRole || !rolesPermitidosNormalizados.includes(userRole)) {
            if (isDev) {
                console.log(`[authorizeRoles] Autorizacion fallida:`);
                console.log(`   - Usuario: ${req.user.email}`);
                console.log(`   - Rol del usuario: "${userRole}"`);
                console.log(`   - Roles requeridos:`, rolesPermitidosNormalizados);
            }
            return res.status(403).json({ 
                success: false,
                message: `No tienes permisos para acceder a este recurso. Tu rol: ${userRole || 'sin rol'}` 
            });
        }

        if (isDev) {
            console.log(`[authorizeRoles] Autorizacion exitosa - Usuario: ${req.user.email}, Rol: ${userRole}`);
        }
        next();
    };
};


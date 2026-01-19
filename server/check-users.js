import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Muni2025...',
    database: process.env.DB_NAME || 'uit'
});
async function checkUsers() {
    try {
        console.log('Verificando usuarios...\n');
        
        const [users] = await pool.query(`
            SELECT u.email, u.nombre_completo, u.password, u.is_active, r.nombre as role
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            ORDER BY u.email
        `);

        if (users.length === 0) {
            console.log('No hay usuarios. Necesitas ejecutar los seeders.');
            process.exit(1);
        }

        console.log(`${users.length} usuarios encontrados:\n`);
        
        for (const user of users) {
            console.log(`Email: ${user.email}`);
            console.log(`Nombre: ${user.nombre_completo}`);
            console.log(`Rol: ${user.role || 'Sin rol'}`);
            console.log(`Activo: ${user.is_active ? 'Sí' : 'No'}`);
            console.log(`Password hash: ${user.password.substring(0, 20)}...`);
            
            // Probar contraseña demo123
            const isValid = await bcrypt.compare('demo123', user.password);
            console.log(`Contraseña demo123 válida: ${isValid ? 'Sí' : 'No'}`);
            console.log('---');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();


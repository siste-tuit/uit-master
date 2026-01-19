import { pool } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function actualizarDashboardGerencia() {
    try {
        console.log('🔄 Actualizando dashboard_path para gerencia...');

        const [result] = await pool.query(
            `UPDATE roles 
             SET dashboard_path = '/gerencia/production' 
             WHERE nombre = 'gerencia'`
        );

        console.log(`✅ Dashboard path actualizado para gerencia`);
        console.log(`   - Filas afectadas: ${result.affectedRows}`);

        // Verificar el cambio
        const [roles] = await pool.query(
            `SELECT nombre, dashboard_path FROM roles WHERE nombre = 'gerencia'`
        );

        if (roles.length > 0) {
            console.log(`✅ Confirmación: ${roles[0].nombre} -> ${roles[0].dashboard_path}`);
        }

    } catch (error) {
        console.error('❌ Error al actualizar dashboard_path:', error);
    } finally {
        await pool.end();
    }
}

actualizarDashboardGerencia();

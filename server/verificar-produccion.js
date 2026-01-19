import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Muni2025...',
    database: process.env.DB_NAME || 'uit'
});

async function verificarDatos() {
    try {
        console.log('📊 Verificando datos guardados en MySQL:\n');
        
        // Verificar líneas de producción
        const [lineas] = await pool.query(`
            SELECT id, nombre, status, objetivo_diario, updated_at 
            FROM lineas_produccion 
            ORDER BY nombre 
            LIMIT 5
        `);
        
        console.log('✅ Líneas de Producción (primeras 5):');
        lineas.forEach((linea, index) => {
            console.log(`   ${index + 1}. ${linea.nombre}`);
            console.log(`      - Estado: ${linea.status}`);
            console.log(`      - Objetivo: ${linea.objetivo_diario} unidades`);
            console.log(`      - Última actualización: ${linea.updated_at}`);
        });

        // Verificar registros de producción
        const [registros] = await pool.query(`
            SELECT 
                rp.id,
                lp.nombre as linea,
                rp.fecha,
                rp.cantidad_producida,
                rp.cantidad_defectuosa,
                rp.eficiencia,
                rp.calidad,
                rp.updated_at
            FROM registros_produccion rp
            INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
            ORDER BY rp.updated_at DESC
            LIMIT 5
        `);
        
        console.log('\n✅ Registros de Producción (últimos 5):');
        registros.forEach((reg, index) => {
            console.log(`   ${index + 1}. ${reg.linea} - ${reg.fecha}`);
            console.log(`      - Producida: ${reg.cantidad_producida} unidades`);
            console.log(`      - Defectuosa: ${reg.cantidad_defectuosa} unidades`);
            console.log(`      - Eficiencia: ${reg.eficiencia}%`);
            console.log(`      - Calidad: ${reg.calidad}%`);
            console.log(`      - Última actualización: ${reg.updated_at}`);
        });

        console.log('\n✅ Todos los datos están guardados correctamente en MySQL');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarDatos();


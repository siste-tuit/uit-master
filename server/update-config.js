import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Muni2025...',
    database: process.env.DB_NAME || 'uit'
});

async function updateConfig() {
    try {
        console.log('Actualizando configuración de la empresa...\n');
        
        const newData = {
            email: 'unioninnovatextil@gmail.com',
            direccion: 'Av. Pedro Moreno Lote 2 OTR . Barrio cercado ( Grifo Green), Chincha Alta, Peru',
            ruc: '206141194619'
        };

        // Primero verificar si existe el registro
        const [existing] = await pool.query(
            'SELECT * FROM configuracion_empresa WHERE id = 1'
        );

        let query, params;

        if (existing.length === 0) {
            // Si no existe, crear el registro
            console.log('No existe configuración, creando nuevo registro...');
            query = `
                INSERT INTO configuracion_empresa 
                (id, nombre, ruc, direccion, telefono, email, moneda, zona_horaria, createdAt, updatedAt)
                VALUES (1, 'Unión Innova Textil', ?, ?, '+51 987 654 321', ?, 'PEN', 'America/Lima', NOW(), NOW())
            `;
            params = [newData.ruc, newData.direccion, newData.email];
        } else {
            // Si existe, actualizar solo los campos especificados
            console.log('Actualizando configuración existente...');
            query = `
                UPDATE configuracion_empresa
                SET 
                    ruc = ?,
                    direccion = ?,
                    email = ?,
                    updatedAt = NOW()
                WHERE id = 1
            `;
            params = [newData.ruc, newData.direccion, newData.email];
        }

        const [result] = await pool.query(query, params);

        if (result.affectedRows > 0) {
            console.log('✅ Configuración actualizada correctamente!\n');
            console.log('Datos actualizados:');
            console.log(`   Email: ${newData.email}`);
            console.log(`   RUC: ${newData.ruc}`);
            console.log(`   Dirección: ${newData.direccion}`);
            
            // Verificar que se guardó correctamente
            const [verify] = await pool.query(
                'SELECT email, ruc, direccion FROM configuracion_empresa WHERE id = 1'
            );
            console.log('\n✅ Verificación en base de datos:');
            console.log(JSON.stringify(verify[0], null, 2));
        } else {
            console.log('⚠️ No se pudo actualizar la configuración');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateConfig();


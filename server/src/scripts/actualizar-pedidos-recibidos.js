// Script para agregar campo enviado_por a la tabla pedidos_recibidos
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function actualizarTablaPedidos() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Muni2025...',
            database: process.env.DB_NAME || 'uit'
        });

        console.log('🔄 Actualizando tabla pedidos_recibidos...\n');

        // Agregar columna enviado_por si no existe
        try {
            await connection.execute(`
                ALTER TABLE pedidos_recibidos 
                ADD COLUMN enviado_por VARCHAR(36) NULL COMMENT 'Usuario de Ingeniería que envió el pedido'
            `);
            console.log('✅ Columna enviado_por agregada');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columna enviado_por ya existe o error:', error.message);
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE pedidos_recibidos 
                ADD COLUMN fecha_envio TIMESTAMP NULL COMMENT 'Fecha en que se envió el pedido'
            `);
            console.log('✅ Columna fecha_envio agregada');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columna fecha_envio ya existe o error:', error.message);
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE pedidos_recibidos 
                ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente' COMMENT 'Estado del pedido'
            `);
            console.log('✅ Columna estado agregada');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columna estado ya existe o error:', error.message);
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE pedidos_recibidos 
                ADD COLUMN linea_produccion VARCHAR(36) NULL COMMENT 'ID de la línea de producción'
            `);
            console.log('✅ Columna linea_produccion agregada');
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columna linea_produccion ya existe o error:', error.message);
            }
        }

        // Agregar índices
        try {
            await connection.execute(`CREATE INDEX IF NOT EXISTS idx_enviado_por ON pedidos_recibidos(enviado_por)`);
            await connection.execute(`CREATE INDEX IF NOT EXISTS idx_estado ON pedidos_recibidos(estado)`);
            console.log('✅ Índices agregados');
        } catch (error) {
            console.log('⚠️ Índices ya existen o error:', error.message);
        }

        console.log('✅ Tabla pedidos_recibidos actualizada correctamente');

    } catch (error) {
        // Si el error es porque la columna ya existe, está bien
        if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column name')) {
            console.log('✅ Las columnas ya existen en la tabla');
        } else {
            console.error('❌ Error al actualizar tabla:', error);
            throw error;
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

actualizarTablaPedidos();


import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrateReportesProduccion() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Muni2025...',
            database: process.env.DB_NAME || 'uit'
        });

        console.log('🔄 Creando tablas para reportes de producción...\n');

        // Tabla para pedidos recibidos por usuarios de producción
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pedidos_recibidos (
                id VARCHAR(36) PRIMARY KEY,
                usuario_id VARCHAR(36) NOT NULL,
                numero_ficha VARCHAR(100) NOT NULL,
                numero_pedido VARCHAR(100) NOT NULL,
                cliente VARCHAR(255) NOT NULL,
                cantidad INT NOT NULL,
                fecha_recepcion DATE NOT NULL,
                observaciones TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_usuario_id (usuario_id),
                INDEX idx_fecha_recepcion (fecha_recepcion)
            )
        `);
        console.log('✅ Tabla pedidos_recibidos creada');

        // Tabla para reportes diarios de usuarios de producción
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reportes_diarios (
                id VARCHAR(36) PRIMARY KEY,
                usuario_id VARCHAR(36) NOT NULL,
                linea_id VARCHAR(36),
                fecha DATE NOT NULL,
                cantidad_producida INT NOT NULL DEFAULT 0,
                cantidad_defectuosa INT NOT NULL DEFAULT 0,
                cantidad_neta INT GENERATED ALWAYS AS (cantidad_producida - cantidad_defectuosa) STORED,
                observaciones TEXT,
                incidencias TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (linea_id) REFERENCES lineas_produccion(id) ON DELETE SET NULL,
                INDEX idx_usuario_id (usuario_id),
                INDEX idx_fecha (fecha),
                INDEX idx_linea_id (linea_id),
                UNIQUE KEY unique_usuario_fecha_linea (usuario_id, fecha, linea_id)
            )
        `);
        console.log('✅ Tabla reportes_diarios creada');

        console.log('\n✅ Migración completada exitosamente');
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

migrateReportesProduccion();


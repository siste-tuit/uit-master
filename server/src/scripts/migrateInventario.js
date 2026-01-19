// Migración para tabla de inventario por departamento

import { pool } from '../config/db.js';

async function runInventarioMigrations() {
    try {
        const tables = [
            // Tabla de items de inventario
            `CREATE TABLE IF NOT EXISTS items_inventario (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                nombre VARCHAR(200) NOT NULL,
                categoria VARCHAR(100) NOT NULL COMMENT 'Materia Prima, Insumos, Producto Terminado',
                stock_actual DECIMAL(10, 3) NOT NULL DEFAULT 0,
                stock_minimo DECIMAL(10, 3) NOT NULL DEFAULT 0,
                stock_maximo DECIMAL(10, 3) NOT NULL DEFAULT 0,
                unidad VARCHAR(20) NOT NULL COMMENT 'kg, metros, litros, unidades',
                costo DECIMAL(10, 2) DEFAULT 0.00,
                proveedor VARCHAR(200) NULL,
                departamento VARCHAR(50) NOT NULL COMMENT 'ingenieria, mantenimiento',
                status ENUM('disponible', 'bajo_stock', 'agotado') DEFAULT 'disponible',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_departamento(departamento),
                INDEX idx_status(status),
                INDEX idx_categoria(categoria)
            );`
        ];

        for (const sql of tables) {
            await pool.query(sql);
            console.log('✅ Tabla creada/existe');
        }

        console.log('✅ Migraciones de inventario completadas');
    } catch (error) {
        console.error('❌ Error en migraciones de inventario:', error);
        throw error;
    }
}

runInventarioMigrations()
    .then(() => {
        console.log('✅ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });


// Migración para tablas de contabilidad

import { pool } from '../config/db.js';

async function runContabilidadMigrations() {
    try {
        const tables = [
            // Tabla de registros financieros
            `CREATE TABLE IF NOT EXISTS registros_financieros (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                tipo ENUM('ingreso', 'egreso', 'gasto') NOT NULL,
                categoria VARCHAR(100) NOT NULL COMMENT 'Ej: Ventas, Compras, Mantenimiento',
                monto DECIMAL(15, 2) NOT NULL COMMENT 'Monto en PEN',
                descripcion TEXT NULL,
                fecha DATE NOT NULL COMMENT 'Fecha del registro financiero',
                usuario_id CHAR(36) NOT NULL COMMENT 'Usuario que creó el registro',
                aprobado_por CHAR(36) NULL COMMENT 'Usuario que aprobó el registro',
                status ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
                referencia VARCHAR(100) NULL COMMENT 'Ej: FACT-001, PED-123',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
                FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
                INDEX idx_tipo_fecha(tipo, fecha),
                INDEX idx_status(status),
                INDEX idx_fecha(fecha)
            );`
        ];

        for (const sql of tables) {
            await pool.query(sql);
            console.log('✅ Tabla creada/existe');
        }

        console.log('✅ Migraciones de contabilidad completadas');
    } catch (error) {
        console.error('❌ Error en migraciones de contabilidad:', error);
        throw error;
    }
}

runContabilidadMigrations()
    .then(() => {
        console.log('✅ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });


// Migración para tablas de trabajadores y asistencia
import pool from "../config/db.js";

async function runAsistenciaMigrations() {
    try {
        const tables = [
            // Tabla de trabajadores
            `CREATE TABLE IF NOT EXISTS trabajadores (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                usuario_id CHAR(36) NOT NULL COMMENT 'Usuario (línea de producción) que gestiona este trabajador',
                nombre_completo VARCHAR(150) NOT NULL,
                dni VARCHAR(20) NULL COMMENT 'Documento Nacional de Identidad',
                telefono VARCHAR(20) NULL,
                cargo VARCHAR(100) NULL COMMENT 'Ej: Operador, Supervisor, etc.',
                fecha_ingreso DATE NULL,
                is_activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_trabajador_usuario(usuario_id),
                INDEX idx_trabajador_activo(usuario_id, is_activo)
            );`,

            // Tabla de registros de asistencia
            `CREATE TABLE IF NOT EXISTS registros_asistencia (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                trabajador_id CHAR(36) NOT NULL,
                usuario_id CHAR(36) NOT NULL COMMENT 'Usuario que registra la asistencia',
                fecha DATE NOT NULL COMMENT 'Fecha del registro',
                hora_entrada TIME NULL COMMENT 'Hora de entrada al trabajo',
                hora_refrigerio_salida TIME NULL COMMENT 'Hora de salida a refrigerio',
                hora_refrigerio_llegada TIME NULL COMMENT 'Hora de llegada de refrigerio',
                hora_salida TIME NULL COMMENT 'Hora de salida del trabajo',
                horas_trabajadas DECIMAL(4, 2) NULL COMMENT 'Horas trabajadas calculadas',
                observaciones TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_registro_trabajador(trabajador_id),
                INDEX idx_registro_fecha(fecha),
                INDEX idx_registro_usuario(usuario_id),
                UNIQUE KEY uk_trabajador_fecha (trabajador_id, fecha)
            );`
        ];

        console.log('🔄 Iniciando migración de tablas de asistencia...\n');

        for (const table of tables) {
            try {
                await pool.query(table);
                console.log('✅ Tabla creada/verificada exitosamente');
            } catch (error) {
                console.error('❌ Error al crear tabla:', error.message);
                throw error;
            }
        }

        console.log('\n✅ Migración de asistencia completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

runAsistenciaMigrations();


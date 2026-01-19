// Migración para tablas de producción de ingeniería
import pool from "../config/db.js";

async function runProduccionMigrations() {
    try {
        const tables = [
            // Tabla de líneas de producción textil
            `CREATE TABLE IF NOT EXISTS lineas_produccion (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                nombre VARCHAR(200) NOT NULL UNIQUE COMMENT 'Ej: A&C - CHINCHA GREEN',
                objetivo_diario INT NOT NULL DEFAULT 2000 COMMENT 'Objetivo de producción diaria en unidades',
                status ENUM('activa', 'mantenimiento', 'detenida') DEFAULT 'activa',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_linea_status(status)
            );`,

            // Tabla de asignación de usuarios a líneas de producción
            `CREATE TABLE IF NOT EXISTS linea_usuario (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                linea_id CHAR(36) NOT NULL,
                usuario_id CHAR(36) NOT NULL,
                fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_remocion TIMESTAMP NULL,
                is_activo BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (linea_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_linea_usuario(linea_id, usuario_id),
                INDEX idx_usuario_activo(usuario_id, is_activo)
            );`,

            // Tabla de registros de producción diaria
            `CREATE TABLE IF NOT EXISTS registros_produccion (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                linea_id CHAR(36) NOT NULL,
                usuario_id CHAR(36) NOT NULL COMMENT 'Usuario que registró la producción',
                fecha DATE NOT NULL COMMENT 'Fecha de producción',
                cantidad_producida INT NOT NULL DEFAULT 0 COMMENT 'Cantidad producida en unidades',
                cantidad_objetivo INT NOT NULL DEFAULT 2000 COMMENT 'Objetivo del día',
                cantidad_defectuosa INT DEFAULT 0 COMMENT 'Cantidad de unidades defectuosas',
                eficiencia DECIMAL(5, 2) GENERATED ALWAYS AS (
                    CASE 
                        WHEN cantidad_objetivo > 0 
                        THEN ROUND((cantidad_producida / cantidad_objetivo) * 100, 2)
                        ELSE 0
                    END
                ) STORED COMMENT 'Eficiencia calculada automáticamente',
                calidad DECIMAL(5, 2) GENERATED ALWAYS AS (
                    CASE 
                        WHEN cantidad_producida > 0 
                        THEN ROUND(((cantidad_producida - cantidad_defectuosa) / cantidad_producida) * 100, 2)
                        ELSE 0
                    END
                ) STORED COMMENT 'Porcentaje de calidad calculado automáticamente',
                notas TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (linea_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY unique_linea_fecha (linea_id, fecha),
                INDEX idx_fecha_produccion(fecha),
                INDEX idx_linea_fecha(linea_id, fecha)
            );`
        ];

        for (const sql of tables) {
            await pool.query(sql);
            console.log(`✅ Migración de producción ejecutada`);
        }

        console.log("🎉 Todas las migraciones de producción se ejecutaron con éxito");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error en migraciones de producción:", err);
        process.exit(1);
    }
}

runProduccionMigrations();


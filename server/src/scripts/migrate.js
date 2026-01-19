// src/scripts/migrate.js
import pool from "../config/db.js";

async function runMigrations() {
    try {
        const tables = [
            // TABLA ROLES (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS roles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: administrador, ingenieria, produccion',
                descripcion VARCHAR(255) NULL,
                dashboard_path VARCHAR(100) NOT NULL COMMENT 'Ruta a la que redirecciona despues del login',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );`,

            // 2. TABLA USUARIOS (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS usuarios (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID para un ID único',
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña con bcrypt',
                nombre_completo VARCHAR(150) NOT NULL,
                rol_id INT NOT NULL,
                departamento VARCHAR(100) NOT NULL,
                avatar VARCHAR(10) NULL COMMENT 'Emoji o ruta de la imagen',
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
            );`,

            // TABLA PRODUCTOS (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS productos (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                sku VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del producto',
                nombre VARCHAR(150) NOT NULL,
                descripcion TEXT NULL,
                tipo_material VARCHAR(50) NULL COMMENT 'Ej: Algodón, Poliéster, Hilo, Tela',
                unidad_medida VARCHAR(20) NOT NULL COMMENT 'Ej: Kg, Metro, Unidad',
                costo_estandar DECIMAL(10, 2) DEFAULT 0.00,
                is_activo BOOLEAN DEFAULT TRUE,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );`,

            // INVENTARIO (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS inventario (
                id INT PRIMARY KEY AUTO_INCREMENT,
                producto_id CHAR(36) NOT NULL,
                almacen_id INT NULL COMMENT 'ID del almacén (si lo creas)',
                cantidad DECIMAL(10, 3) NOT NULL,
                tipo_movimiento VARCHAR(20) NOT NULL COMMENT 'ENTRADA o SALIDA',
                referencia VARCHAR(100) NULL COMMENT 'Ej: ORDEN-P001, COMPRA-F005',
                fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            );`,

            // CONFIGURACIÓN DE EMPRESA (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS configuracion_empresa (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(150) NOT NULL,
                ruc VARCHAR(20) NOT NULL UNIQUE,
                direccion VARCHAR(255) NULL,
                telefono VARCHAR(20) NULL,
                email VARCHAR(100) NULL,
                moneda VARCHAR(10) DEFAULT 'PEN' COMMENT 'Ej: PEN, USD, EUR',
                logo_url VARCHAR(255) NULL COMMENT 'Ruta o URL del logo',
                zona_horaria VARCHAR(50) DEFAULT 'America/Lima',
                politica_contrasena TEXT NULL COMMENT 'Política de contraseñas seguras (longitud, caracteres, etc.)',
                forzar_2fa BOOLEAN DEFAULT FALSE COMMENT 'Forzar autenticación de dos factores para usuarios',
                bloqueo_ips BOOLEAN DEFAULT FALSE COMMENT 'Si TRUE, restringe acceso por IPs no autorizadas',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ); `,

            // DEPARTAMENTOS (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS departamentos(
                id INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ej: Ingeniería, Producción, Sistemas',
                descripcion VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ); `,

            // INCIDENCIAS - ÁREA SISTEMAS (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS incidencias(
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                titulo VARCHAR(150) NOT NULL,
                descripcion TEXT NOT NULL,
                estado ENUM('pendiente', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'pendiente',
                prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
                reportado_por CHAR(36) NOT NULL COMMENT 'Usuario que reportó la incidencia',
                asignado_a CHAR(36) NULL COMMENT 'Usuario o técnico asignado',
                departamento_id INT NULL,
                fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_resolucion TIMESTAMP NULL,
                FOREIGN KEY(reportado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY(asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
                FOREIGN KEY(departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
            ); `,

            // LOGS DEL SISTEMA (EXISTENTE)
            `CREATE TABLE IF NOT EXISTS logs(
                id INT PRIMARY KEY AUTO_INCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nivel ENUM('ERROR', 'WARNING', 'INFO', 'DEBUG') NOT NULL,
                fuente ENUM('auth', 'database', 'api', 'frontend', 'system', 'security') DEFAULT 'system',
                mensaje TEXT NOT NULL,
                stack_trace TEXT NULL,
                usuario_id CHAR(36) NULL,
                ip VARCHAR(45) NULL,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
                INDEX idx_logs_nivel(nivel),
                INDEX idx_logs_fuente(fuente)
            ); `,

            // --- NUEVAS TABLAS DE MANTENIMIENTO ---

            // 9. TABLA EQUIPOS (Basado en 'Gestión de Equipos')
            `CREATE TABLE IF NOT EXISTS equipos (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Ej: EQ001, TELAR-03',
                nombre VARCHAR(150) NOT NULL COMMENT 'Ej: Hiladora Principal #1',
                descripcion TEXT NULL,
                estado ENUM('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO') DEFAULT 'OPERATIVO',
                linea_produccion VARCHAR(100) NULL COMMENT 'Ej: Hilado, Teñido, Tejeduria',
                horas_operacion DECIMAL(10, 2) DEFAULT 0.00,
                responsable_id CHAR(36) NULL COMMENT 'Usuario responsable del equipo',
                ultimo_mantenimiento DATE NULL,
                proximo_mantenimiento DATE NULL,
                ubicacion VARCHAR(100) NULL COMMENT 'Ej: Planta Baja, Sector A',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
            );`,

            // 10. TABLA REPUESTOS (Basado en 'Repuestos' - Inventario específico de Mantenimiento)
            `CREATE TABLE IF NOT EXISTS repuestos (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: R-001',
                nombre VARCHAR(150) NOT NULL COMMENT 'Ej: Rodamiento 6204',
                categoria VARCHAR(100) NOT NULL COMMENT 'Ej: Mecanico, Electrico, Hidraulico',
                stock INT NOT NULL DEFAULT 0,
                stock_minimo INT NOT NULL DEFAULT 0 COMMENT 'Para alerta de Stock bajo',
                ubicacion VARCHAR(50) NULL COMMENT 'Ej: A1-01',
                proveedor VARCHAR(100) NULL,
                costo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                is_critico BOOLEAN DEFAULT FALSE COMMENT 'Marca si es un repuesto crítico',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );`,

            // 11. TABLA ORDENES_TRABAJO (Basado en 'Órdenes de Trabajo')
            `CREATE TABLE IF NOT EXISTS ordenes_trabajo (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                equipo_id CHAR(36) NOT NULL,
                titulo VARCHAR(200) NOT NULL COMMENT 'Ej: Revisión Motor Principal Hiladora #1',
                descripcion TEXT NOT NULL,
                tipo ENUM('PREVENTIVO', 'CORRECTIVO', 'INSPECCION') DEFAULT 'CORRECTIVO',
                estado ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA') DEFAULT 'PENDIENTE',
                prioridad ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA',
                tiempo_estimado_h DECIMAL(5, 2) NULL COMMENT 'Tiempo estimado en horas',
                asignado_a CHAR(36) NULL COMMENT 'Técnico o Usuario asignado',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_vencimiento DATE NULL,
                fecha_finalizacion TIMESTAMP NULL,
                notas_finales TEXT NULL,
                FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
                FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL
            );`,

            // 12. TABLA OT_REPUESTOS (Relación muchos a muchos: Órdenes de Trabajo - Repuestos)
            `CREATE TABLE IF NOT EXISTS ot_repuestos (
                ot_id CHAR(36) NOT NULL,
                repuesto_id CHAR(36) NOT NULL,
                cantidad_requerida INT NOT NULL,
                cantidad_utilizada INT DEFAULT 0,
                PRIMARY KEY (ot_id, repuesto_id),
                FOREIGN KEY (ot_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
                FOREIGN KEY (repuesto_id) REFERENCES repuestos(id) ON DELETE RESTRICT
            );`,

            // 13. TABLA CALENDARIO_MANTENIMIENTO (Basado en 'Calendario de Mantenimiento')
            `CREATE TABLE IF NOT EXISTS calendario_mantenimiento (
                id CHAR(36) PRIMARY KEY COMMENT 'UUID',
                equipo_id CHAR(36) NOT NULL,
                nombre_evento VARCHAR(150) NOT NULL COMMENT 'Ej: Lubricación general, Cambio filtros',
                descripcion TEXT NULL,
                tipo ENUM('PREVENTIVO', 'CORRECTIVO', 'INSPECCION') DEFAULT 'PREVENTIVO',
                prioridad ENUM('BAJA', 'MEDIA', 'ALTA') DEFAULT 'MEDIA' COMMENT 'Prioridad del evento de calendario',
                fecha_programada DATE NOT NULL,
                hora_inicio TIME NULL,
                hora_fin TIME NULL,
                estado ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO') DEFAULT 'PROGRAMADO',
                ot_id CHAR(36) NULL COMMENT 'Referencia a la Orden de Trabajo si existe',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
                FOREIGN KEY (ot_id) REFERENCES ordenes_trabajo(id) ON DELETE SET NULL
            );`

        ];

        for (const sql of tables) {
            await pool.query(sql);
            console.log(`✅ Migración ejecutada: ${sql.split("(")[0].trim()} `);
        }

        console.log("🎉 Todas las migraciones se ejecutaron con éxito");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error en migraciones:", err);
        process.exit(1);
    }
}

runMigrations();
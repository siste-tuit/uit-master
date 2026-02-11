// Script unificado para ejecutar TODAS las migraciones del sistema
// Uso: node runAllMigrations.js

import { pool } from './src/config/db.js';
import mysql from 'mysql2/promise';

// Importar las funciones de migración (si están exportadas)
// Si no, ejecutaremos el SQL directamente

async function runAllMigrations() {
    let connection;
    try {
        console.log('🚀 Iniciando ejecución de TODAS las migraciones...\n');

        // Usar una conexión única para todas las migraciones
        connection = await pool.getConnection();

        // 1. Migración Core (roles, usuarios, productos, inventario, config)
        console.log('📦 Ejecutando migraciones CORE...');
        await runCoreMigrations(connection);
        console.log('✅ Migraciones CORE completadas\n');

        // 2. Migración Producción
        console.log('🏭 Ejecutando migraciones de PRODUCCIÓN...');
        await runProduccionMigrations(connection);
        console.log('✅ Migraciones PRODUCCIÓN completadas\n');

        // 3. Migración Inventario
        console.log('📦 Ejecutando migraciones de INVENTARIO...');
        await runInventarioMigrations(connection);
        console.log('✅ Migraciones INVENTARIO completadas\n');

        // 4. Migración Reportes Producción
        console.log('📊 Ejecutando migraciones de REPORTES PRODUCCIÓN...');
        await runReportesProduccionMigrations(connection);
        console.log('✅ Migraciones REPORTES PRODUCCIÓN completadas\n');

        // 5. Migración Contabilidad
        console.log('💰 Ejecutando migraciones de CONTABILIDAD...');
        await runContabilidadMigrations(connection);
        console.log('✅ Migraciones CONTABILIDAD completadas\n');

        // 6. Migración Asistencia
        console.log('⏰ Ejecutando migraciones de ASISTENCIA...');
        await runAsistenciaMigrations(connection);
        console.log('✅ Migraciones ASISTENCIA completadas\n');

        // 7. Migración Flujos Salida
        console.log('📥 Ejecutando migraciones de FLUJOS SALIDA...');
        await runFlujosSalidaMigrations(connection);
        console.log('✅ Migraciones FLUJOS SALIDA completadas\n');

        // 8. Migración Flujos Ingreso
        console.log('📤 Ejecutando migraciones de FLUJOS INGRESO...');
        await runFlujosIngresoMigrations(connection);
        console.log('✅ Migraciones FLUJOS INGRESO completadas\n');

        console.log('\n🎉 ¡TODAS las migraciones ejecutadas exitosamente!');
        console.log('✅ El sistema está listo para producción.\n');

    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
        // NO hacer process.exit aquí si queremos que continúe con otras tareas
        await pool.end();
    }
}

// Funciones de migración individuales
async function runCoreMigrations(connection) {
    // Tablas core del sistema (roles, usuarios, productos, inventario, etc.)
    const tables = [
        // TABLA ROLES
        `CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: administrador, ingenieria, produccion',
            descripcion VARCHAR(255) NULL,
            dashboard_path VARCHAR(100) NOT NULL COMMENT 'Ruta a la que redirecciona despues del login',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        // TABLA USUARIOS
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
        )`,
        
        // TABLA PRODUCTOS
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
        )`,
        
        // INVENTARIO
        `CREATE TABLE IF NOT EXISTS inventario (
            id INT PRIMARY KEY AUTO_INCREMENT,
            producto_id CHAR(36) NOT NULL,
            almacen_id INT NULL COMMENT 'ID del almacén (si lo creas)',
            cantidad DECIMAL(10, 3) NOT NULL,
            tipo_movimiento VARCHAR(20) NOT NULL COMMENT 'ENTRADA o SALIDA',
            referencia VARCHAR(100) NULL COMMENT 'Ej: ORDEN-P001, COMPRA-F005',
            fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`,
        
        // CONFIGURACIÓN DE EMPRESA
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
        )`,
        
        // DEPARTAMENTOS
        `CREATE TABLE IF NOT EXISTS departamentos(
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ej: Ingeniería, Producción, Sistemas',
            descripcion VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        // INCIDENCIAS
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
        )`,
        
        // LOGS DEL SISTEMA
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
        )`,
        
        // EQUIPOS
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
        )`,
        
        // REPUESTOS
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
        )`,
        
        // ORDENES_TRABAJO
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
        )`,
        
        // OT_REPUESTOS
        `CREATE TABLE IF NOT EXISTS ot_repuestos (
            ot_id CHAR(36) NOT NULL,
            repuesto_id CHAR(36) NOT NULL,
            cantidad_requerida INT NOT NULL,
            cantidad_utilizada INT DEFAULT 0,
            PRIMARY KEY (ot_id, repuesto_id),
            FOREIGN KEY (ot_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
            FOREIGN KEY (repuesto_id) REFERENCES repuestos(id) ON DELETE RESTRICT
        )`,
        
        // CALENDARIO_MANTENIMIENTO
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
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runProduccionMigrations(connection) {
    // Líneas de producción, reportes diarios, pedidos producción
    const tables = [
        `CREATE TABLE IF NOT EXISTS lineas_produccion (
            id VARCHAR(36) PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            objetivo_diario INT DEFAULT 2000,
            status ENUM('activa', 'mantenimiento', 'detenida') DEFAULT 'activa',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS linea_usuario (
            id VARCHAR(36) PRIMARY KEY,
            linea_id VARCHAR(36) NOT NULL,
            usuario_id VARCHAR(36) NOT NULL,
            fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_remocion TIMESTAMP NULL,
            is_activo BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (linea_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            INDEX idx_linea_usuario(linea_id, usuario_id),
            INDEX idx_usuario_activo(usuario_id, is_activo)
        )`,
        `CREATE TABLE IF NOT EXISTS registros_produccion (
            id VARCHAR(36) PRIMARY KEY,
            linea_id VARCHAR(36) NOT NULL,
            usuario_id VARCHAR(36) NOT NULL,
            fecha DATE NOT NULL,
            cantidad_producida INT NOT NULL DEFAULT 0,
            cantidad_objetivo INT NOT NULL DEFAULT 2000,
            cantidad_defectuosa INT DEFAULT 0,
            eficiencia DECIMAL(5, 2) GENERATED ALWAYS AS (
                CASE 
                    WHEN cantidad_objetivo > 0 
                    THEN ROUND((cantidad_producida / cantidad_objetivo) * 100, 2)
                    ELSE 0
                END
            ) STORED,
            calidad DECIMAL(5, 2) GENERATED ALWAYS AS (
                CASE 
                    WHEN cantidad_producida > 0 
                    THEN ROUND(((cantidad_producida - cantidad_defectuosa) / cantidad_producida) * 100, 2)
                    ELSE 0
                END
            ) STORED,
            notas TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (linea_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            UNIQUE KEY unique_linea_fecha (linea_id, fecha),
            INDEX idx_fecha_produccion(fecha),
            INDEX idx_linea_fecha(linea_id, fecha)
        )`,
        `CREATE TABLE IF NOT EXISTS reportes_diarios (
            id VARCHAR(36) PRIMARY KEY,
            usuario_id VARCHAR(36) NOT NULL,
            linea_produccion_id VARCHAR(36) NOT NULL,
            fecha DATE NOT NULL,
            cantidad_producida INT NOT NULL,
            cantidad_objetivo INT NOT NULL,
            cantidad_defectuosa INT DEFAULT 0,
            notas TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (linea_produccion_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS pedidos_produccion (
            id VARCHAR(36) PRIMARY KEY,
            usuario_id VARCHAR(36) NOT NULL,
            linea_produccion_id VARCHAR(36) NOT NULL,
            cliente VARCHAR(150) NOT NULL,
            ficha VARCHAR(100) NOT NULL,
            estilo_cliente VARCHAR(100) NULL,
            color VARCHAR(50) NULL,
            cantidad INT NOT NULL,
            operacion VARCHAR(100) NULL,
            codigo_operacion VARCHAR(50) NULL,
            fecha_envio DATE NULL,
            fecha_recojo DATE NULL,
            especificacion TEXT NULL,
            estado ENUM('pendiente', 'en_proceso', 'completado') DEFAULT 'pendiente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (linea_produccion_id) REFERENCES lineas_produccion(id) ON DELETE CASCADE
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runInventarioMigrations(connection) {
    // Tabla items_inventario para inventario por departamentos
    const tables = [
        `CREATE TABLE IF NOT EXISTS items_inventario (
            id VARCHAR(36) PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            stock_actual DECIMAL(10, 3) NOT NULL DEFAULT 0,
            stock_minimo DECIMAL(10, 3) NOT NULL DEFAULT 0,
            stock_maximo DECIMAL(10, 3) NOT NULL DEFAULT 0,
            unidad VARCHAR(20) NOT NULL DEFAULT 'unidad',
            departamento ENUM('ingenieria', 'mantenimiento') NOT NULL,
            status ENUM('disponible', 'bajo_stock', 'agotado') DEFAULT 'disponible',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_departamento (departamento),
            INDEX idx_status (status)
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runReportesProduccionMigrations(connection) {
    // Tablas para reportes de producción (debe ejecutarse DESPUÉS de runProduccionMigrations)
    const tables = [
        `CREATE TABLE IF NOT EXISTS pedidos_recibidos (
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
        )`,
        `CREATE TABLE IF NOT EXISTS reportes_diarios (
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
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runContabilidadMigrations(connection) {
    const tables = [
        `CREATE TABLE IF NOT EXISTS registros_financieros (
            id CHAR(36) PRIMARY KEY,
            tipo ENUM('ingreso', 'egreso', 'gasto') NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            monto DECIMAL(15, 2) NOT NULL,
            descripcion TEXT NULL,
            fecha DATE NOT NULL,
            usuario_id CHAR(36) NOT NULL,
            aprobado_por CHAR(36) NULL,
            status ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
            referencia VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
            FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS configuracion_facturas (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre_empresa VARCHAR(255) NOT NULL,
            direccion_empresa TEXT NULL,
            ruc_empresa VARCHAR(20) NULL,
            logo_url VARCHAR(500) NULL,
            info_pago TEXT NULL,
            notas_pie TEXT NULL,
            igv_porcentaje DECIMAL(5, 4) NOT NULL DEFAULT 0.18,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS facturas (
            id CHAR(36) PRIMARY KEY,
            referencia VARCHAR(100) NOT NULL,
            fecha_emision DATE NOT NULL,
            cliente_nombre VARCHAR(255) NOT NULL,
            cliente_direccion TEXT NULL,
            cliente_identificacion VARCHAR(50) NULL,
            subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
            igv DECIMAL(15, 2) NOT NULL DEFAULT 0,
            total DECIMAL(15, 2) NOT NULL DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pendiente',
            user_id CHAR(36) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
            INDEX idx_factura_fecha (fecha_emision),
            INDEX idx_factura_status (status)
        )`,
        `CREATE TABLE IF NOT EXISTS factura_items (
            id CHAR(36) PRIMARY KEY,
            factura_id CHAR(36) NOT NULL,
            item_descripcion VARCHAR(500) NOT NULL,
            cantidad DECIMAL(10, 3) NOT NULL DEFAULT 1,
            precio_unitario DECIMAL(15, 2) NOT NULL DEFAULT 0,
            subtotal_item DECIMAL(15, 2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
            INDEX idx_factura_items_factura (factura_id)
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runAsistenciaMigrations(connection) {
    const tables = [
        // Tabla de trabajadores (con campo area)
        `CREATE TABLE IF NOT EXISTS trabajadores (
            id CHAR(36) PRIMARY KEY COMMENT 'UUID',
            usuario_id CHAR(36) NOT NULL COMMENT 'Usuario (línea de producción) que gestiona este trabajador',
            nombre_completo VARCHAR(150) NOT NULL,
            dni VARCHAR(20) NULL COMMENT 'Documento Nacional de Identidad',
            telefono VARCHAR(20) NULL,
            cargo VARCHAR(100) NULL COMMENT 'Ej: Operador, Supervisor, etc.',
            area VARCHAR(100) NULL COMMENT 'Ej: Costura, Corte, Empaque, Control de Calidad',
            fecha_ingreso DATE NULL,
            is_activo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            INDEX idx_trabajador_usuario(usuario_id),
            INDEX idx_trabajador_activo(usuario_id, is_activo)
        )`,
        // Tabla de registros de asistencia (con todos los campos necesarios)
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
        )`
    ];

    for (const sql of tables) {
        await connection.query(sql);
    }
}

async function runFlujosSalidaMigrations(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS flujos_salida (
            id VARCHAR(36) PRIMARY KEY,
            usuario_sistemas_id VARCHAR(36) NOT NULL,
            usuario_ingenieria_id VARCHAR(36) NOT NULL,
            usuario_ingenieria_nombre VARCHAR(150) NOT NULL,
            usuario_ingenieria_email VARCHAR(100) NOT NULL,
            filtros JSON NOT NULL,
            filas JSON NOT NULL,
            total_filas INT NOT NULL DEFAULT 0,
            estado ENUM('pendiente', 'revisado', 'procesado') DEFAULT 'pendiente',
            fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_revision TIMESTAMP NULL,
            fecha_procesado TIMESTAMP NULL,
            observaciones TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_sistemas_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_ingenieria_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
}

async function runFlujosIngresoMigrations(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS flujos_ingreso (
            id VARCHAR(36) PRIMARY KEY,
            usuario_ingenieria_id VARCHAR(36) NOT NULL,
            usuario_ingenieria_nombre VARCHAR(150) NOT NULL,
            usuario_ingenieria_email VARCHAR(100) NOT NULL,
            filtros JSON NOT NULL,
            filas JSON NOT NULL,
            total_filas INT NOT NULL DEFAULT 0,
            fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_ingenieria_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
}

// Ejecutar todas las migraciones
runAllMigrations()
    .then(() => {
        console.log('✅ Proceso completado exitosamente.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

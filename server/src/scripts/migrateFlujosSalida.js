import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

async function migrateFlujosSalida() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'Muni2025...',
      database: process.env.DB_NAME || 'uit'
    });

    console.log('🔄 Creando tabla para flujos de salida...\n');

    // Tabla para flujos de salida enviados desde Ingeniería a Sistemas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flujos_salida (
        id VARCHAR(36) PRIMARY KEY,
        usuario_sistemas_id VARCHAR(36) NOT NULL COMMENT 'Usuario de Sistemas que recibirá el flujo',
        usuario_ingenieria_id VARCHAR(36) NOT NULL COMMENT 'Usuario de Ingeniería que envió el flujo',
        usuario_ingenieria_nombre VARCHAR(150) NOT NULL,
        usuario_ingenieria_email VARCHAR(100) NOT NULL,
        filtros JSON NOT NULL COMMENT 'Filtros aplicados: {linea, anio, mes, semana, dia}',
        filas JSON NOT NULL COMMENT 'Array de filas con los datos del flujo',
        total_filas INT NOT NULL DEFAULT 0,
        estado ENUM('pendiente', 'revisado', 'procesado') DEFAULT 'pendiente',
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_revision TIMESTAMP NULL,
        fecha_procesado TIMESTAMP NULL,
        observaciones TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_sistemas_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_ingenieria_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_sistemas (usuario_sistemas_id),
        INDEX idx_usuario_ingenieria (usuario_ingenieria_id),
        INDEX idx_estado (estado),
        INDEX idx_fecha_envio (fecha_envio)
      )
    `);
    console.log('✅ Tabla flujos_salida creada');

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

// Ejecutar si se llama directamente
migrateFlujosSalida()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  });

export default migrateFlujosSalida;


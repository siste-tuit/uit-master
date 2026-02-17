// Seeder para datos iniciales de producción
import { pool } from "../config/db.js";
import { randomUUID } from 'crypto';

async function seedProduccion() {
    try {
        console.log('🌱 Iniciando seed de producción...');

        // Obtener el ID del usuario de ingeniería
        const [usuarios] = await pool.query(
            "SELECT id, nombre_completo FROM usuarios WHERE email = 'ingenieria@textil.com'"
        );

        if (usuarios.length === 0) {
            console.log('⚠️ Usuario de ingeniería no encontrado. Ejecuta primero los seeders de usuarios.');
            process.exit(1);
        }

        const usuarioIngenieria = usuarios[0];
        console.log(`✅ Usuario de ingeniería encontrado: ${usuarioIngenieria.nombre_completo}`);

        // Solo los 9 usuarios de producción (por email) para asignar a líneas
        const emailsProduccion = [
            'hover.rojas@textil.com', 'maycol@textil.com', 'alicia@textil.com',
            'elena@textil.com', 'rosa@textil.com', 'alfredo@textil.com',
            'eduardo@textil.com', 'juana@textil.com', 'alisson@textil.com'
        ];
        const placeholders = emailsProduccion.map(() => '?').join(', ');
        const [todosUsuarios] = await pool.query(
            `SELECT u.id, u.nombre_completo 
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.is_active = TRUE AND r.nombre = 'usuarios' AND u.email IN (${placeholders})
             ORDER BY u.nombre_completo`,
            emailsProduccion
        );
        
        console.log(`✅ ${todosUsuarios.length} usuarios de producción (9) encontrados:`, 
                    todosUsuarios.map(u => u.nombre_completo).join(', '));

        // Líneas de producción (13 líneas para 13 usuarios)
        const lineas = [
            { nombre: 'A&C - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'A&C 2 - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'A&C 3 - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'A&C 4 - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'D&M - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'ELENA TEX - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'EMANUEL - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'EMANUEL 2 - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'JFL STYLE - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'JUANA ZEA - CHINCHA GREEN', objetivo: 2000, status: 'mantenimiento' },
            { nombre: 'M&L - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'M&L 2 - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
            { nombre: 'VELASQUEZ - CHINCHA GREEN', objetivo: 2000, status: 'activa' },
        ];

        // Insertar líneas de producción
        const lineasIds = [];
        for (const linea of lineas) {
            // Verificar si la línea ya existe
            const [existentes] = await pool.query(
                "SELECT id FROM lineas_produccion WHERE nombre = ?",
                [linea.nombre]
            );
            
            let lineaId;
            if (existentes.length > 0) {
                lineaId = existentes[0].id;
                // Actualizar la línea existente
                await pool.query(
                    `UPDATE lineas_produccion SET objetivo_diario = ?, status = ? WHERE id = ?`,
                    [linea.objetivo, linea.status, lineaId]
                );
            } else {
                // Crear nueva línea
                lineaId = randomUUID();
                await pool.query(
                    `INSERT INTO lineas_produccion (id, nombre, objetivo_diario, status) 
                     VALUES (?, ?, ?, ?)`,
                    [lineaId, linea.nombre, linea.objetivo, linea.status]
                );
            }
            lineasIds.push({ id: lineaId, nombre: linea.nombre });
        }
        console.log(`✅ ${lineasIds.length} líneas de producción creadas/actualizadas`);

        // Desactivar asignaciones de usuarios que no son de los 9 de producción
        const idsNueve = todosUsuarios.map(u => u.id);
        if (idsNueve.length > 0) {
            const ph = idsNueve.map(() => '?').join(', ');
            await pool.query(
                `UPDATE linea_usuario SET is_activo = FALSE WHERE usuario_id NOT IN (${ph})`,
                idsNueve
            );
        }
        
        // Asignar los 9 usuarios a TODAS las líneas (cada línea muestra los 9)
        for (const linea of lineasIds) {
            for (const usuario of todosUsuarios) {
                const [existentes] = await pool.query(
                    "SELECT id FROM linea_usuario WHERE linea_id = ? AND usuario_id = ?",
                    [linea.id, usuario.id]
                );
                if (existentes.length > 0) {
                    await pool.query("UPDATE linea_usuario SET is_activo = TRUE WHERE id = ?", [existentes[0].id]);
                } else {
                    await pool.query(
                        `INSERT INTO linea_usuario (id, linea_id, usuario_id, is_activo) VALUES (?, ?, ?, TRUE)`,
                        [randomUUID(), linea.id, usuario.id]
                    );
                }
            }
        }
        console.log(`✅ ${todosUsuarios.length} usuarios asignados a todas las ${lineasIds.length} líneas`);

        // Crear registros de producción para los últimos 7 días
        const hoy = new Date();
        const registros = [];
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            for (const linea of lineasIds) {
                if (linea.nombre.includes('JUANA ZEA') && i === 0) {
                    // JUANA ZEA está en mantenimiento hoy
                    continue;
                }
                
                const objetivo = 2000;
                // Producción realista con variación
                const variacion = (Math.random() * 0.2 - 0.1); // -10% a +10%
                const produccion = Math.round(objetivo * (0.85 + variacion));
                const defectuosas = Math.round(produccion * (0.02 + Math.random() * 0.03)); // 2-5% defectuosas
                
                // Verificar si ya existe un registro para esta línea y fecha
                const [existentes] = await pool.query(
                    "SELECT id FROM registros_produccion WHERE linea_id = ? AND fecha = ?",
                    [linea.id, fechaStr]
                );
                
                if (existentes.length > 0) {
                    // Actualizar registro existente
                    await pool.query(
                        `UPDATE registros_produccion 
                         SET cantidad_producida = ?, cantidad_objetivo = ?, cantidad_defectuosa = ?, updated_at = CURRENT_TIMESTAMP
                         WHERE id = ?`,
                        [produccion, objetivo, defectuosas, existentes[0].id]
                    );
                } else {
                    // Crear nuevo registro
                    const registroId = randomUUID();
                    await pool.query(
                        `INSERT INTO registros_produccion 
                         (id, linea_id, usuario_id, fecha, cantidad_producida, cantidad_objetivo, cantidad_defectuosa) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [registroId, linea.id, usuarioIngenieria.id, fechaStr, produccion, objetivo, defectuosas]
                    );
                }
            }
        }
        console.log('✅ Registros de producción creados para los últimos 7 días');

        console.log('🎉 Seed de producción completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed de producción:', error);
        process.exit(1);
    }
}

seedProduccion();


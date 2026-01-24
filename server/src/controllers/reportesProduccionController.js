import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Enviar pedido desde Ingeniería a un usuario de producción
export const enviarPedidoAUsuario = async (req, res) => {
    try {
        const { usuario_destino_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observaciones, estilo_cliente, color, linea_produccion, operacion, codigo_operacion, fecha_envio, fecha_recojo } = req.body;
        const enviado_por = req.user?.id; // Usuario de Ingeniería que envía

        console.log('📤 [enviarPedidoAUsuario] Nuevo pedido recibido:', {
            usuario_destino_id,
            numero_ficha,
            cliente,
            cantidad,
            enviado_por: req.user?.email || req.user?.id
        });

        if (!usuario_destino_id || !numero_ficha || !numero_pedido || !cliente || !cantidad || !fecha_recepcion) {
            console.error('❌ [enviarPedidoAUsuario] Faltan campos obligatorios');
            return res.status(400).json({ 
                success: false,
                message: 'Faltan campos obligatorios' 
            });
        }

        if (!enviado_por) {
            console.error('❌ [enviarPedidoAUsuario] Usuario no autenticado');
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no autenticado' 
            });
        }

        // Verificar que el usuario destino existe
        const [usuariosDestino] = await pool.query(
            `SELECT id, nombre_completo, email, is_active FROM usuarios WHERE id = ?`,
            [usuario_destino_id]
        );

        if (usuariosDestino.length === 0) {
            console.error(`❌ [enviarPedidoAUsuario] Usuario destino no encontrado: ${usuario_destino_id}`);
            return res.status(404).json({
                success: false,
                message: 'El usuario destino no existe en la base de datos'
            });
        }

        if (!usuariosDestino[0].is_active) {
            console.error(`❌ [enviarPedidoAUsuario] Usuario destino inactivo: ${usuariosDestino[0].email}`);
            return res.status(400).json({
                success: false,
                message: 'El usuario destino está inactivo'
            });
        }

        console.log(`✅ [enviarPedidoAUsuario] Usuario destino encontrado: ${usuariosDestino[0].nombre_completo} (${usuariosDestino[0].email})`);

        const id = uuidv4();

        // Construir observaciones completas
        let observacionesCompletas = observaciones || '';
        if (estilo_cliente) observacionesCompletas += `\nEstilo Cliente: ${estilo_cliente}`;
        if (color) observacionesCompletas += `\nColor: ${color}`;
        if (operacion) observacionesCompletas += `\nOperación: ${operacion}`;
        if (codigo_operacion) observacionesCompletas += `\nCódigo Operación: ${codigo_operacion}`;
        if (fecha_envio) observacionesCompletas += `\nFecha Envío: ${fecha_envio}`;
        if (fecha_recojo) observacionesCompletas += `\nFecha Recojo: ${fecha_recojo}`;

        // Insertar el pedido en la base de datos
        await pool.query(
            `INSERT INTO pedidos_recibidos 
             (id, usuario_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observaciones, enviado_por, fecha_envio, estado, linea_produccion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pendiente', ?)`,
            [id, usuario_destino_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observacionesCompletas.trim() || null, enviado_por, linea_produccion || null]
        );

        console.log(`✅ [enviarPedidoAUsuario] Pedido guardado exitosamente (ID: ${id})`);

        res.status(201).json({
            success: true,
            message: `Pedido enviado exitosamente a ${usuariosDestino[0]?.nombre_completo || 'usuario'}`,
            id,
            usuario_destino: {
                id: usuario_destino_id,
                nombre: usuariosDestino[0]?.nombre_completo,
                email: usuariosDestino[0]?.email
            }
        });
    } catch (error) {
        console.error('❌ [enviarPedidoAUsuario] Error al enviar pedido:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al enviar pedido',
            error: error.message
        });
    }
};

// Guardar pedido recibido (mantener por compatibilidad, pero ya no se usará)
export const recibirPedido = async (req, res) => {
    try {
        const { usuario_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observaciones } = req.body;

        if (!usuario_id || !numero_ficha || !numero_pedido || !cliente || !cantidad || !fecha_recepcion) {
            return res.status(400).json({ 
                message: 'Faltan campos obligatorios' 
            });
        }

        const id = uuidv4();

        await pool.query(
            `INSERT INTO pedidos_recibidos 
             (id, usuario_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observaciones, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
            [id, usuario_id, numero_ficha, numero_pedido, cliente, cantidad, fecha_recepcion, observaciones || null]
        );

        res.status(201).json({
            message: 'Pedido recibido registrado exitosamente',
            id
        });
    } catch (error) {
        console.error('❌ Error al registrar pedido recibido:', error);
        res.status(500).json({ message: 'Error al registrar pedido recibido' });
    }
};

// Enviar reporte desde Ingeniería a un usuario de producción
export const enviarReporteAUsuario = async (req, res) => {
    try {
        const { usuario_destino_id, linea_id, fecha, cantidad_producida, cantidad_defectuosa, observaciones, incidencias, dueno_linea, pedido_relacionado } = req.body;
        const enviado_por = req.user?.id; // Usuario de Ingeniería que envía

        console.log('📤 [enviarReporteAUsuario] Nuevo reporte recibido:', {
            usuario_destino_id,
            linea_id: linea_id || 'null',
            fecha,
            cantidad_producida,
            cantidad_defectuosa,
            dueno_linea: dueno_linea || 'no especificado',
            pedido_relacionado: pedido_relacionado || 'no especificado',
            enviado_por: req.user?.email || req.user?.id
        });

        if (!usuario_destino_id || !fecha || cantidad_producida === undefined) {
            console.error('❌ [enviarReporteAUsuario] Faltan campos obligatorios');
            return res.status(400).json({ 
                success: false,
                message: 'Faltan campos obligatorios: usuario_destino_id, fecha, cantidad_producida' 
            });
        }

        if (!enviado_por) {
            console.error('❌ [enviarReporteAUsuario] Usuario no autenticado');
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no autenticado' 
            });
        }

        // Verificar que el usuario destino existe
        const [usuariosDestino] = await pool.query(
            `SELECT id, nombre_completo, email, is_active FROM usuarios WHERE id = ?`,
            [usuario_destino_id]
        );

        if (usuariosDestino.length === 0) {
            console.error(`❌ [enviarReporteAUsuario] Usuario destino no encontrado: ${usuario_destino_id}`);
            return res.status(404).json({
                success: false,
                message: 'El usuario destino no existe en la base de datos'
            });
        }

        if (!usuariosDestino[0].is_active) {
            console.error(`❌ [enviarReporteAUsuario] Usuario destino inactivo: ${usuariosDestino[0].email}`);
            return res.status(400).json({
                success: false,
                message: 'El usuario destino está inactivo'
            });
        }

        console.log(`✅ [enviarReporteAUsuario] Usuario destino encontrado: ${usuariosDestino[0].nombre_completo} (${usuariosDestino[0].email})`);

        // Construir observaciones completas con información adicional
        let observacionesCompletas = observaciones || '';
        if (dueno_linea) observacionesCompletas += `\nDueño de la línea: ${dueno_linea}`;
        if (pedido_relacionado) observacionesCompletas += `\nPedido relacionado (ficha): ${pedido_relacionado}`;
        if (enviado_por) observacionesCompletas += `\nEnviado por: Ingeniería`;

        // Verificar si ya existe un reporte para este usuario, fecha y línea
        let query = `SELECT id FROM reportes_diarios WHERE usuario_id = ? AND fecha = ?`;
        let params = [usuario_destino_id, fecha];
        
        if (linea_id) {
            query += ` AND linea_id = ?`;
            params.push(linea_id);
        } else {
            query += ` AND linea_id IS NULL`;
        }
        
        const [existentes] = await pool.query(query, params);

        if (existentes.length > 0) {
            // Actualizar reporte existente
            const id = existentes[0].id;
            await pool.query(
                `UPDATE reportes_diarios 
                 SET cantidad_producida = ?, 
                     cantidad_defectuosa = ?, 
                     observaciones = ?,
                     incidencias = ?
                 WHERE id = ?`,
                [
                    cantidad_producida || 0, 
                    cantidad_defectuosa || 0, 
                    observacionesCompletas.trim() || null,
                    incidencias || null,
                    id
                ]
            );

            console.log(`✅ [enviarReporteAUsuario] Reporte actualizado exitosamente (ID: ${id})`);

            res.status(200).json({
                success: true,
                message: 'Reporte actualizado exitosamente',
                id
            });
        } else {
            // Crear nuevo reporte
            const id = uuidv4();
            await pool.query(
                `INSERT INTO reportes_diarios 
                 (id, usuario_id, linea_id, fecha, cantidad_producida, cantidad_defectuosa, observaciones, incidencias)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, 
                    usuario_destino_id, 
                    linea_id || null, 
                    fecha, 
                    cantidad_producida || 0, 
                    cantidad_defectuosa || 0, 
                    observacionesCompletas.trim() || null,
                    incidencias || null
                ]
            );

            console.log(`✅ [enviarReporteAUsuario] Reporte guardado exitosamente (ID: ${id})`);
            console.log(`   📋 Datos guardados en la BD:`);
            console.log(`      - usuario_id: ${usuario_destino_id} (${usuariosDestino[0]?.nombre_completo})`);
            console.log(`      - linea_id: ${linea_id || 'NULL'}`);
            console.log(`      - fecha: ${fecha}`);
            console.log(`      - cantidad_producida: ${cantidad_producida}`);
            console.log(`      - cantidad_defectuosa: ${cantidad_defectuosa || 0}`);
            console.log(`   📝 Observaciones guardadas: "${observacionesCompletas.trim()}"`);
            
            // Verificar que se guardó correctamente consultando la BD
            const [verificacion] = await pool.query(
                `SELECT id, usuario_id, linea_id, fecha, cantidad_producida FROM reportes_diarios WHERE id = ?`,
                [id]
            );
            if (verificacion.length > 0) {
                console.log(`   ✅ Verificación en BD exitosa:`, verificacion[0]);
            } else {
                console.log(`   ⚠️ ADVERTENCIA: No se pudo verificar el reporte en la BD después de guardarlo`);
            }

            res.status(201).json({
                success: true,
                message: `Reporte enviado exitosamente a ${usuariosDestino[0]?.nombre_completo || 'usuario'}`,
                id,
                usuario_destino: {
                    id: usuario_destino_id,
                    nombre: usuariosDestino[0]?.nombre_completo,
                    email: usuariosDestino[0]?.email
                },
                observaciones_guardadas: observacionesCompletas.trim()
            });
        }
    } catch (error) {
        console.error('❌ [enviarReporteAUsuario] Error al enviar reporte:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al enviar reporte',
            error: error.message
        });
    }
};

// Guardar reporte diario (mantener por compatibilidad - para usuarios de producción)
export const enviarReporteDiario = async (req, res) => {
    try {
        const { usuario_id, linea_id, fecha, cantidad_producida, cantidad_defectuosa, observaciones, incidencias } = req.body;

        if (!usuario_id || !fecha || cantidad_producida === undefined) {
            return res.status(400).json({ 
                message: 'Faltan campos obligatorios' 
            });
        }

        // Verificar si ya existe un reporte para este usuario y fecha
        // Si no hay linea_id, solo buscamos por usuario y fecha
        let query = `SELECT id FROM reportes_diarios WHERE usuario_id = ? AND fecha = ?`;
        let params = [usuario_id, fecha];
        
        if (linea_id) {
            query += ` AND linea_id = ?`;
            params.push(linea_id);
        } else {
            query += ` AND linea_id IS NULL`;
        }
        
        const [existentes] = await pool.query(query, params);

        if (existentes.length > 0) {
            // Actualizar reporte existente
            const id = existentes[0].id;
            await pool.query(
                `UPDATE reportes_diarios 
                 SET cantidad_producida = ?, 
                     cantidad_defectuosa = ?, 
                     observaciones = ?, 
                     incidencias = ?
                 WHERE id = ?`,
                [
                    cantidad_producida || 0, 
                    cantidad_defectuosa || 0, 
                    observaciones || null, 
                    incidencias || null,
                    id
                ]
            );

            res.status(200).json({
                message: 'Reporte diario actualizado exitosamente',
                id
            });
        } else {
            // Crear nuevo reporte
            const id = uuidv4();
            await pool.query(
                `INSERT INTO reportes_diarios 
                 (id, usuario_id, linea_id, fecha, cantidad_producida, cantidad_defectuosa, observaciones, incidencias)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, 
                    usuario_id, 
                    linea_id || null, 
                    fecha, 
                    cantidad_producida || 0, 
                    cantidad_defectuosa || 0, 
                    observaciones || null, 
                    incidencias || null
                ]
            );

            res.status(201).json({
                message: 'Reporte diario enviado exitosamente',
                id
            });
        }
    } catch (error) {
        console.error('❌ Error al enviar reporte diario:', error);
        res.status(500).json({ message: 'Error al enviar reporte diario' });
    }
};

// Obtener reportes de un usuario específico
export const getReportesPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;
        const usuario_autenticado = req.user?.id;

        console.log(`📊 [getReportesPorUsuario] Solicitud recibida:`);
        console.log(`   - usuario_id desde params: ${usuario_id}`);
        console.log(`   - usuario_id autenticado: ${usuario_autenticado}`);
        console.log(`   - fecha_inicio: ${fecha_inicio || 'ninguna'}`);
        console.log(`   - fecha_fin: ${fecha_fin || 'ninguna'}`);

        // Verificar que existen reportes en la tabla
        const [totalReportes] = await pool.query(
            `SELECT COUNT(*) as total FROM reportes_diarios`
        );
        console.log(`   - Total de reportes en la BD: ${totalReportes[0]?.total || 0}`);

        // Verificar reportes del usuario específico
        const [reportesUsuario] = await pool.query(
            `SELECT COUNT(*) as total FROM reportes_diarios WHERE usuario_id = ?`,
            [usuario_id]
        );
        console.log(`   - Total de reportes del usuario ${usuario_id}: ${reportesUsuario[0]?.total || 0}`);

        // Verificar que el usuario existe
        const [usuarioInfo] = await pool.query(
            `SELECT id, nombre_completo, email FROM usuarios WHERE id = ?`,
            [usuario_id]
        );
        if (usuarioInfo.length > 0) {
            console.log(`   - Usuario encontrado: ${usuarioInfo[0].nombre_completo} (${usuarioInfo[0].email})`);
        } else {
            console.log(`   ⚠️ Usuario ${usuario_id} no encontrado en la BD`);
        }

        let query = `
            SELECT 
                rd.*,
                lp.nombre as linea_nombre,
                u.nombre_completo as usuario_nombre,
                u.email as usuario_email
            FROM reportes_diarios rd
            LEFT JOIN lineas_produccion lp ON rd.linea_id = lp.id
            LEFT JOIN usuarios u ON rd.usuario_id = u.id
            WHERE rd.usuario_id = ?
        `;
        
        const params = [usuario_id];

        if (fecha_inicio) {
            query += ' AND rd.fecha >= ?';
            params.push(fecha_inicio);
        }

        if (fecha_fin) {
            query += ' AND rd.fecha <= ?';
            params.push(fecha_fin);
        }

        query += ' ORDER BY rd.fecha DESC, rd.fecha_creacion DESC';

        console.log(`   - Query SQL: ${query}`);
        console.log(`   - Parámetros:`, params);

        const [reportes] = await pool.query(query, params);

        console.log(`📊 [getReportesPorUsuario] Usuario: ${usuario_id}, Reportes encontrados: ${reportes.length}`);
        if (reportes.length > 0) {
            reportes.forEach((reporte, index) => {
                console.log(`   Reporte ${index + 1}:`, {
                    id: reporte.id,
                    fecha: reporte.fecha,
                    usuario_id: reporte.usuario_id,
                    cantidad_producida: reporte.cantidad_producida,
                    observaciones_completa: reporte.observaciones,
                    tiene_ingenieria: reporte.observaciones?.toLowerCase().includes('ingenieria') || false
                });
            });
        } else {
            console.log(`   ⚠️ No se encontraron reportes para el usuario ${usuario_id}`);
            // Intentar ver qué reportes existen con otros usuarios
            const [todosReportes] = await pool.query(
                `SELECT usuario_id, COUNT(*) as total FROM reportes_diarios GROUP BY usuario_id LIMIT 5`
            );
            if (todosReportes.length > 0) {
                console.log(`   📋 Reportes de otros usuarios (primeros 5):`);
                todosReportes.forEach(r => {
                    console.log(`      - Usuario ${r.usuario_id}: ${r.total} reportes`);
                });
            }
        }

        res.json({ reportes });
    } catch (error) {
        console.error('❌ Error al obtener reportes por usuario:', error);
        res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
    }
};

// Obtener estadísticas agregadas para Gerencia (diarias, semanales, mensuales)
export const getEstadisticasGerencia = async (req, res) => {
    try {
        console.log('📊 [getEstadisticasGerencia] Solicitando estadísticas para Gerencia');

        // Obtener todos los reportes
        const [todosReportes] = await pool.query(
            `SELECT 
                rd.*,
                (rd.cantidad_producida - rd.cantidad_defectuosa) as cantidad_neta,
                lp.nombre as linea_nombre,
                u.nombre_completo as usuario_nombre,
                u.email as usuario_email
            FROM reportes_diarios rd
            LEFT JOIN lineas_produccion lp ON rd.linea_id = lp.id
            LEFT JOIN usuarios u ON rd.usuario_id = u.id
            ORDER BY rd.fecha DESC`
        );

        console.log(`📊 [getEstadisticasGerencia] Total de reportes encontrados: ${todosReportes.length}`);

        // Calcular estadísticas diarias (últimos 7 días)
        const hoy = new Date();
        const ultimos7Dias = [];
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            const reportesDelDia = todosReportes.filter(r => r.fecha === fechaStr);
            const totalProducido = reportesDelDia.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const totalDefectuoso = reportesDelDia.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const totalNeto = totalProducido - totalDefectuoso;
            const porcentajeCalidad = totalProducido > 0 ? Math.round((totalNeto / totalProducido) * 100) : 0;

            ultimos7Dias.push({
                fecha: fechaStr,
                cantidad_producida: totalProducido,
                cantidad_defectuosa: totalDefectuoso,
                cantidad_neta: totalNeto,
                porcentaje_calidad: porcentajeCalidad,
                total_reportes: reportesDelDia.length
            });
        }

        // Calcular estadísticas semanales (últimas 4 semanas)
        const ultimas4Semanas = [];
        for (let i = 0; i < 4; i++) {
            const fechaFin = new Date(hoy);
            fechaFin.setDate(fechaFin.getDate() - (i * 7));
            const fechaInicio = new Date(fechaFin);
            fechaInicio.setDate(fechaInicio.getDate() - 6);
            
            const reportesSemana = todosReportes.filter(r => {
                const fechaReporte = new Date(r.fecha);
                return fechaReporte >= fechaInicio && fechaReporte <= fechaFin;
            });

            const totalProducido = reportesSemana.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const totalDefectuoso = reportesSemana.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const totalNeto = totalProducido - totalDefectuoso;
            const porcentajeCalidad = totalProducido > 0 ? Math.round((totalNeto / totalProducido) * 100) : 0;

            ultimas4Semanas.push({
                semana: i + 1,
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                cantidad_producida: totalProducido,
                cantidad_defectuosa: totalDefectuoso,
                cantidad_neta: totalNeto,
                porcentaje_calidad: porcentajeCalidad,
                total_reportes: reportesSemana.length,
                promedio_diario: Math.round(totalNeto / 7)
            });
        }

        // Calcular estadísticas mensuales (últimos 6 meses)
        const ultimos6Meses = [];
        for (let i = 0; i < 6; i++) {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            const mesNum = fecha.getMonth() + 1;
            const año = fecha.getFullYear();
            
            const reportesMes = todosReportes.filter(r => {
                const fechaReporte = new Date(r.fecha);
                return fechaReporte.getMonth() === fecha.getMonth() && 
                       fechaReporte.getFullYear() === fecha.getFullYear();
            });

            const totalProducido = reportesMes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const totalDefectuoso = reportesMes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const totalNeto = totalProducido - totalDefectuoso;
            const porcentajeCalidad = totalProducido > 0 ? Math.round((totalNeto / totalProducido) * 100) : 0;
            const diasDelMes = new Date(año, mesNum, 0).getDate();

            ultimos6Meses.push({
                mes: mes,
                mes_numero: mesNum,
                año: año,
                cantidad_producida: totalProducido,
                cantidad_defectuosa: totalDefectuoso,
                cantidad_neta: totalNeto,
                porcentaje_calidad: porcentajeCalidad,
                total_reportes: reportesMes.length,
                promedio_diario: Math.round(totalNeto / diasDelMes)
            });
        }

        // Calcular efectividad por usuario
        const usuariosMap = {};
        todosReportes.forEach(reporte => {
            const usuarioId = reporte.usuario_id;
            if (!usuariosMap[usuarioId]) {
                usuariosMap[usuarioId] = {
                    usuario: {
                        id: reporte.usuario_id,
                        nombre: reporte.usuario_nombre,
                        email: reporte.usuario_email
                    },
                    reportes: []
                };
            }
            usuariosMap[usuarioId].reportes.push(reporte);
        });

        const efectividadPorUsuario = Object.values(usuariosMap).map(usuarioData => {
            const reportes = usuarioData.reportes;
            const totalProducido = reportes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const totalDefectuoso = reportes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const totalNeto = totalProducido - totalDefectuoso;
            const porcentajeCalidad = totalProducido > 0 ? Math.round((totalNeto / totalProducido) * 100) : 0;
            const totalReportes = reportes.length;
            const promedioDiario = totalReportes > 0 ? Math.round(totalNeto / totalReportes) : 0;

            // Calcular efectividad (basado en calidad y producción)
            // Efectividad = (Calidad * 0.7) + (Producción relativa * 0.3)
            // Para simplificar, usamos porcentaje de calidad como base de efectividad
            const efectividad = porcentajeCalidad;

            return {
                ...usuarioData,
                metricas: {
                    total_producido: totalProducido,
                    total_defectuoso: totalDefectuoso,
                    total_neto: totalNeto,
                    porcentaje_calidad: porcentajeCalidad,
                    efectividad: efectividad,
                    total_reportes: totalReportes,
                    promedio_diario: promedioDiario
                }
            };
        }).sort((a, b) => b.metricas.efectividad - a.metricas.efectividad); // Ordenar por efectividad descendente

        // Calcular totales generales
        const totalGeneralProducido = todosReportes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
        const totalGeneralDefectuoso = todosReportes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
        const totalGeneralNeto = totalGeneralProducido - totalGeneralDefectuoso;
        const porcentajeCalidadGeneral = totalGeneralProducido > 0 
            ? Math.round((totalGeneralNeto / totalGeneralProducido) * 100) 
            : 0;

        res.json({
            totales: {
                total_producido: totalGeneralProducido,
                total_defectuoso: totalGeneralDefectuoso,
                total_neto: totalGeneralNeto,
                porcentaje_calidad: porcentajeCalidadGeneral,
                total_reportes: todosReportes.length,
                total_usuarios: efectividadPorUsuario.length
            },
            diarios: ultimos7Dias.reverse(), // Ordenar de más antiguo a más reciente
            semanales: ultimas4Semanas.reverse(),
            mensuales: ultimos6Meses.reverse(),
            efectividad_por_usuario: efectividadPorUsuario
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas para Gerencia:', error);
        res.status(500).json({ 
            message: 'Error al obtener estadísticas', 
            error: error.message 
        });
    }
};

// Obtener todos los reportes para Ingeniería (todos los usuarios)
export const getTodosLosReportes = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, usuario_id } = req.query;

        let query = `
            SELECT 
                rd.*,
                (rd.cantidad_producida - rd.cantidad_defectuosa) as cantidad_neta,
                lp.nombre as linea_nombre,
                u.nombre_completo as usuario_nombre,
                u.email as usuario_email
            FROM reportes_diarios rd
            LEFT JOIN lineas_produccion lp ON rd.linea_id = lp.id
            LEFT JOIN usuarios u ON rd.usuario_id = u.id
            WHERE 1=1
        `;
        
        const params = [];

        if (usuario_id) {
            query += ' AND rd.usuario_id = ?';
            params.push(usuario_id);
        }

        if (fecha_inicio) {
            query += ' AND rd.fecha >= ?';
            params.push(fecha_inicio);
        }

        if (fecha_fin) {
            query += ' AND rd.fecha <= ?';
            params.push(fecha_fin);
        }

        query += ' ORDER BY rd.fecha DESC, u.nombre_completo ASC, rd.fecha_creacion DESC';

        const [reportes] = await pool.query(query, params);

        // Agrupar por usuario para facilitar la visualización
        const reportesPorUsuario = reportes.reduce((acc, reporte) => {
            const usuarioId = reporte.usuario_id;
            if (!acc[usuarioId]) {
                acc[usuarioId] = {
                    usuario: {
                        id: reporte.usuario_id,
                        nombre: reporte.usuario_nombre,
                        email: reporte.usuario_email
                    },
                    reportes: []
                };
            }
            acc[usuarioId].reportes.push(reporte);
            return acc;
        }, {});

        // Calcular métricas por usuario
        const usuariosConMetricas = Object.values(reportesPorUsuario).map(usuarioData => {
            const reportes = usuarioData.reportes;
            const totalProducido = reportes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const totalDefectuoso = reportes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const totalNeto = totalProducido - totalDefectuoso;
            const totalReportes = reportes.length;

            return {
                ...usuarioData,
                metricas: {
                    totalProducido,
                    totalDefectuoso,
                    totalNeto,
                    totalReportes,
                    promedioDiario: totalReportes > 0 ? Math.round(totalNeto / totalReportes) : 0
                }
            };
        });

        res.json({
            reportes: Object.values(reportesPorUsuario),
            usuariosConMetricas,
            totalReportes: reportes.length
        });
    } catch (error) {
        console.error('❌ Error al obtener todos los reportes:', error);
        res.status(500).json({ message: 'Error al obtener reportes' });
    }
};

// Obtener pedidos recibidos por usuario (para usuarios de producción - solo lectura)
export const getPedidosRecibidosPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const userIdFromToken = req.user?.id;

        // Verificar que el usuario solo pueda ver sus propios pedidos
        if (usuario_id !== userIdFromToken) {
            return res.status(403).json({ 
                success: false,
                message: 'No tienes permiso para ver estos pedidos' 
            });
        }

        const [pedidos] = await pool.query(
            `SELECT 
                pr.*, 
                u.nombre_completo as usuario_nombre,
                ue.nombre_completo as enviado_por_nombre,
                lp.nombre as linea_nombre
             FROM pedidos_recibidos pr
             LEFT JOIN usuarios u ON pr.usuario_id = u.id
             LEFT JOIN usuarios ue ON pr.enviado_por = ue.id
             LEFT JOIN lineas_produccion lp ON pr.linea_produccion = lp.id
             WHERE pr.usuario_id = ?
             ORDER BY pr.fecha_envio DESC, pr.fecha_recepcion DESC, pr.fecha_creacion DESC`,
            [usuario_id]
        );

        res.json({ 
            success: true,
            pedidos 
        });
    } catch (error) {
        console.error('❌ Error al obtener pedidos recibidos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener pedidos recibidos' 
        });
    }
};

// Obtener todos los usuarios de producción (para Ingeniería - para seleccionar destinatarios)
export const getUsuariosProduccion = async (req, res) => {
    try {
        console.log('🔍 [getUsuariosProduccion] Solicitando usuarios de producción...');
        
        // Primero verificar que existe el rol 'usuarios'
        const [roles] = await pool.query(`SELECT id, nombre FROM roles WHERE nombre = 'usuarios'`);
        console.log('📋 [getUsuariosProduccion] Rol "usuarios" encontrado:', roles.length > 0 ? roles[0] : 'NO ENCONTRADO');
        
        if (roles.length === 0) {
            console.error('❌ [getUsuariosProduccion] El rol "usuarios" no existe en la base de datos');
            return res.status(500).json({ 
                success: false,
                message: 'El rol "usuarios" no existe en la base de datos' 
            });
        }

        // Obtener usuarios con rol 'usuarios'
        const [usuarios] = await pool.query(
            `SELECT 
                u.id,
                u.email,
                u.nombre_completo,
                u.avatar,
                u.is_active,
                r.nombre as rol_nombre,
                GROUP_CONCAT(DISTINCT lp.nombre ORDER BY lp.nombre SEPARATOR ', ') as lineas_asignadas,
                GROUP_CONCAT(DISTINCT lp.id ORDER BY lp.nombre SEPARATOR ',') as lineas_ids
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             LEFT JOIN linea_usuario lu ON u.id = lu.usuario_id AND lu.is_activo = TRUE
             LEFT JOIN lineas_produccion lp ON lu.linea_id = lp.id
             WHERE r.nombre = 'usuarios' AND u.is_active = TRUE
             GROUP BY u.id, u.email, u.nombre_completo, u.avatar, u.is_active, r.nombre
             ORDER BY u.nombre_completo`
        );

        console.log(`✅ [getUsuariosProduccion] Total de usuarios encontrados: ${usuarios.length}`);
        
        if (usuarios.length > 0) {
            console.log('📧 [getUsuariosProduccion] Correos de usuarios encontrados:', usuarios.map(u => u.email));
        } else {
            console.warn('⚠️ [getUsuariosProduccion] No se encontraron usuarios de producción activos');
            
            // Verificar si hay usuarios inactivos
            const [usuariosInactivos] = await pool.query(
                `SELECT u.email, u.nombre_completo, u.is_active, r.nombre as rol 
                 FROM usuarios u 
                 INNER JOIN roles r ON u.rol_id = r.id 
                 WHERE r.nombre = 'usuarios'`
            );
            console.log(`📊 [getUsuariosProduccion] Total usuarios con rol "usuarios" (incluyendo inactivos): ${usuariosInactivos.length}`);
            if (usuariosInactivos.length > 0) {
                console.log('👥 Usuarios encontrados:', usuariosInactivos.map(u => `${u.email} - Activo: ${u.is_active}`));
            }
        }

        // Transformar los resultados para incluir la primera línea asignada (si existe)
        const usuariosTransformados = usuarios.map(usuario => ({
            id: usuario.id,
            email: usuario.email,
            nombre_completo: usuario.nombre_completo,
            avatar: usuario.avatar,
            linea_id: usuario.lineas_ids ? usuario.lineas_ids.split(',')[0] : null,
            linea_nombre: usuario.lineas_asignadas ? usuario.lineas_asignadas.split(',')[0].trim() : null,
            lineas_asignadas: usuario.lineas_asignadas || null
        }));

        // Verificar que estén los 13 usuarios esperados
        const correosEsperados = [
            'AyC@textil.com', 'AyC2@textil.com', 'AyC3@textil.com', 'AyC4@textil.com',
            'DyM@textil.com', 'Elenatex@textil.com', 'Emanuel@textil.com', 'Emanuel2@textil.com',
            'JflStyle@textil.com', 'Juanazea@textil.com', 'Myl@textil.com', 'Myl2@textil.com',
            'Velasquez@textil.com'
        ];
        const correosEncontrados = usuariosTransformados.map(u => u.email);
        const faltantes = correosEsperados.filter(c => !correosEncontrados.includes(c));
        
        if (faltantes.length > 0) {
            console.warn(`⚠️ [getUsuariosProduccion] Faltan ${faltantes.length} usuarios:`, faltantes);
        } else {
            console.log('✅ [getUsuariosProduccion] Todos los 13 usuarios están presentes');
        }

        res.json({ 
            success: true,
            usuarios: usuariosTransformados,
            total: usuariosTransformados.length,
            faltantes: faltantes.length > 0 ? faltantes : null
        });
    } catch (error) {
        console.error('❌ [getUsuariosProduccion] Error al obtener usuarios de producción:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener usuarios de producción',
            error: error.message
        });
    }
};

// Obtener historial de documentos para Ingeniería/Gerencia
export const getHistorialIngenieria = async (req, res) => {
    try {
        const extraerValor = (texto, etiqueta) => {
            if (!texto) return null;
            const regex = new RegExp(`${etiqueta}:\\s*(.+)`, 'i');
            const match = texto.match(regex);
            return match ? match[1].split('\n')[0].trim() : null;
        };

        const [pedidos] = await pool.query(
            `SELECT 
                pr.id,
                pr.numero_ficha,
                pr.numero_pedido,
                pr.cliente,
                pr.cantidad,
                pr.fecha_envio,
                pr.estado,
                lp.nombre as linea_nombre
             FROM pedidos_recibidos pr
             LEFT JOIN lineas_produccion lp ON pr.linea_produccion = lp.id
             ORDER BY pr.fecha_envio DESC`
        );

        const [reportes] = await pool.query(
            `SELECT 
                rd.id,
                rd.fecha,
                rd.cantidad_producida,
                rd.cantidad_defectuosa,
                rd.observaciones,
                rd.incidencias,
                lp.nombre as linea_nombre
             FROM reportes_diarios rd
             LEFT JOIN lineas_produccion lp ON rd.linea_id = lp.id
             ORDER BY rd.fecha DESC`
        );

        const documentos = [
            ...pedidos.map(pedido => ({
                id: pedido.id,
                tipo: 'produccion',
                fecha: pedido.fecha_envio,
                cliente: pedido.cliente,
                ficha: pedido.numero_ficha,
                descripcion: `Pedido ${pedido.numero_pedido} - ${pedido.cliente}`,
                datos: pedido
            })),
            ...reportes.map(reporte => {
                const ficha = extraerValor(reporte.observaciones, 'Ficha');
                const cliente = extraerValor(reporte.observaciones, 'Cliente');
                return {
                    id: reporte.id,
                    tipo: 'reporte',
                    fecha: reporte.fecha,
                    cliente: cliente || 'N/A',
                    ficha: ficha || 'N/A',
                    descripcion: `Reporte diario - ${reporte.linea_nombre || 'Sin línea'}`,
                    datos: reporte
                };
            })
        ].filter(doc => doc.fecha);

        documentos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        res.json({ documentos });
    } catch (error) {
        console.error('❌ Error al obtener historial de ingeniería:', error);
        res.status(500).json({ message: 'Error al obtener historial', error: error.message });
    }
};

// Obtener estadísticas detalladas del usuario (diarias, semanales, mensuales)
export const getEstadisticasUsuario = async (req, res) => {
    try {
        // Obtener el usuario_id del token autenticado o del parámetro
        const usuario_id = req.user?.id || req.params.usuario_id;
        
        if (!usuario_id) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        // Obtener información del usuario y su línea asignada
        const [usuarios] = await pool.query(
            `SELECT u.id, u.nombre_completo, u.email, lp.id as linea_id, lp.nombre as linea_nombre
             FROM usuarios u
             LEFT JOIN linea_usuario lu ON u.id = lu.usuario_id AND lu.is_activo = TRUE
             LEFT JOIN lineas_produccion lp ON lu.linea_id = lp.id
             WHERE u.id = ?`,
            [usuario_id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        // Obtener todos los reportes del usuario
        const [reportes] = await pool.query(
            `SELECT 
                fecha,
                cantidad_producida,
                cantidad_defectuosa,
                (cantidad_producida - cantidad_defectuosa) as cantidad_neta
             FROM reportes_diarios
             WHERE usuario_id = ?
             ORDER BY fecha DESC`,
            [usuario_id]
        );

        // Calcular estadísticas diarias (últimos 7 días)
        const hoy = new Date();
        const ultimos7Dias = [];
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            const reporteDelDia = reportes.find(r => r.fecha === fechaStr);
            ultimos7Dias.push({
                fecha: fechaStr,
                producido: reporteDelDia?.cantidad_producida || 0,
                defectuoso: reporteDelDia?.cantidad_defectuosa || 0,
                neto: reporteDelDia?.cantidad_neta || 0
            });
        }

        // Calcular estadísticas semanales (últimas 4 semanas)
        const semanas = [];
        for (let i = 0; i < 4; i++) {
            const fechaInicio = new Date(hoy);
            fechaInicio.setDate(fechaInicio.getDate() - (i * 7) - 6); // Lunes de la semana
            const fechaFin = new Date(hoy);
            fechaFin.setDate(fechaFin.getDate() - (i * 7)); // Domingo de la semana
            
            const reportesSemana = reportes.filter(r => {
                const fechaReporte = new Date(r.fecha);
                return fechaReporte >= fechaInicio && fechaReporte <= fechaFin;
            });

            const producido = reportesSemana.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const defectuoso = reportesSemana.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const neto = producido - defectuoso;

            semanas.push({
                semana: i + 1,
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0],
                producido,
                defectuoso,
                neto,
                reportes: reportesSemana.length
            });
        }

        // Calcular estadísticas mensuales (últimos 6 meses)
        const meses = [];
        for (let i = 0; i < 6; i++) {
            const fecha = new Date(hoy);
            fecha.setMonth(fecha.getMonth() - i);
            const año = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;

            const reportesMes = reportes.filter(r => {
                const fechaReporte = new Date(r.fecha);
                return fechaReporte.getFullYear() === año && fechaReporte.getMonth() + 1 === mes;
            });

            const producido = reportesMes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
            const defectuoso = reportesMes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
            const neto = producido - defectuoso;

            const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            meses.push({
                año,
                mes,
                nombreMes: nombresMeses[mes - 1],
                producido,
                defectuoso,
                neto,
                reportes: reportesMes.length
            });
        }

        // Calcular totales y métricas de calidad
        const totalProducido = reportes.reduce((sum, r) => sum + (r.cantidad_producida || 0), 0);
        const totalDefectuoso = reportes.reduce((sum, r) => sum + (r.cantidad_defectuosa || 0), 0);
        const totalNeto = totalProducido - totalDefectuoso;
        const porcentajeCalidad = totalProducido > 0 ? ((totalNeto / totalProducido) * 100).toFixed(2) : 0;

        // Estadísticas del día actual
        const hoyStr = hoy.toISOString().split('T')[0];
        const reporteHoy = reportes.find(r => r.fecha === hoyStr);
        const estadisticasHoy = {
            fecha: hoyStr,
            producido: reporteHoy?.cantidad_producida || 0,
            defectuoso: reporteHoy?.cantidad_defectuosa || 0,
            neto: reporteHoy?.cantidad_neta || 0
        };

        res.json({
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                linea_id: usuario.linea_id,
                linea_nombre: usuario.linea_nombre
            },
            estadisticas: {
                hoy: estadisticasHoy,
                diarias: ultimos7Dias.reverse(),
                semanales: semanas.reverse(),
                mensuales: meses.reverse()
            },
            totales: {
                producido: totalProducido,
                defectuoso: totalDefectuoso,
                neto: totalNeto,
                porcentajeCalidad: parseFloat(porcentajeCalidad),
                totalReportes: reportes.length
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas del usuario:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};


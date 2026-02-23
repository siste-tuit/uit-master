import { pool } from "../config/db.js";

// Obtener métricas generales de producción para el Dashboard Administrativo
export const getMetricasProduccion = async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        
        // Producción Diaria Total (suma de todas las líneas activas hoy)
        const [produccionDiaria] = await pool.query(
            `SELECT COALESCE(SUM(cantidad_producida), 0) as total_produccion
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [hoy]
        );

        // Eficiencia General Promedio (promedio de eficiencia de líneas activas hoy)
        const [eficiencia] = await pool.query(
            `SELECT COALESCE(AVG(rp.eficiencia), 0) as eficiencia_promedio
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [hoy]
        );

        // Calidad General Promedio (promedio de calidad de líneas activas hoy)
        const [calidad] = await pool.query(
            `SELECT COALESCE(AVG(rp.calidad), 0) as calidad_promedio
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [hoy]
        );

        // Calcular porcentaje de cambio vs ayer
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split('T')[0];

        const [produccionAyer] = await pool.query(
            `SELECT COALESCE(SUM(cantidad_producida), 0) as total_produccion
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [ayerStr]
        );

        const [eficienciaAyer] = await pool.query(
            `SELECT COALESCE(AVG(rp.eficiencia), 0) as eficiencia_promedio
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [ayerStr]
        );

        const [calidadAyer] = await pool.query(
            `SELECT COALESCE(AVG(rp.calidad), 0) as calidad_promedio
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.fecha = ? AND lp.status = 'activa'`,
            [ayerStr]
        );

        // Calcular porcentajes de cambio
        const prodDiaria = produccionDiaria[0]?.total_produccion || 0;
        const prodAyer = produccionAyer[0]?.total_produccion || 1;
        const cambioProduccion = prodAyer > 0 ? ((prodDiaria - prodAyer) / prodAyer) * 100 : 0;

        const eficHoy = parseFloat(eficiencia[0]?.eficiencia_promedio || 0);
        const eficAyer = parseFloat(eficienciaAyer[0]?.eficiencia_promedio || 0);
        const cambioEficiencia = eficAyer > 0 ? ((eficHoy - eficAyer) / eficAyer) * 100 : 0;

        const calHoy = parseFloat(calidad[0]?.calidad_promedio || 0);
        const calAyer = parseFloat(calidadAyer[0]?.calidad_promedio || 0);
        const cambioCalidad = calAyer > 0 ? ((calHoy - calAyer) / calAyer) * 100 : 0;

        res.json({
            produccionDiaria: Math.round(prodDiaria),
            eficienciaGeneral: parseFloat(eficHoy.toFixed(1)),
            calidad: parseFloat(calHoy.toFixed(1)),
            cambioProduccion: parseFloat(cambioProduccion.toFixed(1)),
            cambioEficiencia: parseFloat(cambioEficiencia.toFixed(1)),
            cambioCalidad: parseFloat(cambioCalidad.toFixed(1))
        });
    } catch (error) {
        console.error("❌ Error al obtener métricas de producción:", error);
        res.status(500).json({ message: "Error al obtener métricas de producción" });
    }
};

// Obtener datos de producción por período (diaria, semanal, mensual)
export const getProduccionPorPeriodo = async (req, res) => {
    try {
        const { periodo = 'mensual' } = req.query; // diaria, semanal, mensual

        let query = '';
        let intervalValue = '';

        switch (periodo) {
            case 'diaria':
                // Últimos 30 días
                query = `SELECT 
                    rp.fecha as fecha,
                    DATE_FORMAT(rp.fecha, '%Y-%m-%d') as fecha_formato,
                    SUM(rp.cantidad_producida) as produccion_total,
                    AVG(rp.eficiencia) as eficiencia_promedio,
                    AVG(rp.calidad) as calidad_promedio
                 FROM registros_produccion rp
                 INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
                 WHERE lp.status = 'activa'
                 AND rp.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                 GROUP BY rp.fecha
                 ORDER BY rp.fecha ASC`;
                intervalValue = '30 DAY';
                break;

            case 'semanal':
                // Últimas 12 semanas
                query = `SELECT 
                    DATE_FORMAT(rp.fecha, '%Y-%u') as semana,
                    DATE_FORMAT(DATE_SUB(rp.fecha, INTERVAL WEEKDAY(rp.fecha) DAY), '%Y-%m-%d') as fecha_semana,
                    SUM(rp.cantidad_producida) as produccion_total,
                    AVG(rp.eficiencia) as eficiencia_promedio,
                    AVG(rp.calidad) as calidad_promedio
                 FROM registros_produccion rp
                 INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
                 WHERE lp.status = 'activa'
                 AND rp.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
                 GROUP BY DATE_FORMAT(rp.fecha, '%Y-%u'), DATE_FORMAT(DATE_SUB(rp.fecha, INTERVAL WEEKDAY(rp.fecha) DAY), '%Y-%m-%d')
                 ORDER BY fecha_semana ASC`;
                intervalValue = '12 WEEK';
                break;

            case 'mensual':
            default:
                // Últimos 6 meses
                query = `SELECT 
                    DATE_FORMAT(rp.fecha, '%Y-%m') as mes,
                    DATE_FORMAT(rp.fecha, '%Y-%m-01') as fecha_mes,
                    SUM(rp.cantidad_producida) as produccion_total,
                    AVG(rp.eficiencia) as eficiencia_promedio,
                    AVG(rp.calidad) as calidad_promedio
                 FROM registros_produccion rp
                 INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
                 WHERE lp.status = 'activa'
                 AND rp.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                 GROUP BY DATE_FORMAT(rp.fecha, '%Y-%m'), DATE_FORMAT(rp.fecha, '%Y-%m-01')
                 ORDER BY fecha_mes ASC`;
                intervalValue = '6 MONTH';
                break;
        }

        const [datos] = await pool.query(query);

        // Formatear datos para el frontend
        const datosFormateados = datos.map(item => {
            const fecha = item.fecha || item.fecha_semana || item.fecha_mes;
            return {
                date: fecha,
                production: Math.round(parseFloat(item.produccion_total) || 0),
                efficiency: parseFloat((item.eficiencia_promedio || 0).toFixed(1)),
                quality: parseFloat((item.calidad_promedio || 0).toFixed(1))
            };
        });

        res.json({ datos: datosFormateados, periodo });
    } catch (error) {
        console.error(`❌ Error al obtener producción ${periodo}:`, error);
        res.status(500).json({ message: `Error al obtener producción ${periodo}` });
    }
};

// Obtener todas las líneas de producción con sus usuarios asignados
export const getLineasConUsuarios = async (req, res) => {
    try {
        // Obtener todas las líneas con sus usuarios asignados
        const [lineas] = await pool.query(
            `SELECT 
                lp.id,
                lp.nombre,
                lp.status,
                GROUP_CONCAT(DISTINCT u.nombre_completo ORDER BY u.nombre_completo SEPARATOR ', ') as usuarios
             FROM lineas_produccion lp
             LEFT JOIN linea_usuario lu ON lp.id = lu.linea_id AND lu.is_activo = TRUE
             LEFT JOIN usuarios u ON lu.usuario_id = u.id
             GROUP BY lp.id, lp.nombre, lp.status
             ORDER BY lp.nombre`
        );

        console.log(`📊 [getLineasConUsuarios] Total de líneas encontradas: ${lineas.length}`);

        const resultado = {
            lineas: lineas.map(l => ({
                id: l.id,
                nombre: l.nombre,
                status: l.status,
                usuarios: l.usuarios ? l.usuarios.split(', ') : []
            }))
        };

        console.log(`✅ [getLineasConUsuarios] Enviando ${resultado.lineas.length} líneas al frontend`);

        res.json(resultado);
    } catch (error) {
        console.error("❌ Error al obtener líneas con usuarios:", error);
        res.status(500).json({ message: "Error al obtener líneas de producción" });
    }
};

// Emails de los 9 usuarios de producción (una tarjeta por usuario en el dashboard)
const EMAILS_9_PRODUCCION = [
    'hover.rojas@textil.com', 'maycol@textil.com', 'alicia@textil.com',
    'elena@textil.com', 'rosa@textil.com', 'alfredo@textil.com',
    'eduardo@textil.com', 'juana@textil.com', 'alisson@textil.com'
];

// Obtener datos para el Dashboard de Ingeniería: 9 tarjetas "Linea [Nombre]" (una por usuario)
export const getProduccionIngenieria = async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const ph = EMAILS_9_PRODUCCION.map(() => '?').join(', ');

        // Obtener siempre IDs válidos de lineas_produccion (evitar enviar usuario_id como linea_id)
        const [lineasReales] = await pool.query(
            "SELECT id FROM lineas_produccion ORDER BY nombre"
        );
        const idsLineasValidos = lineasReales.map((r) => r.id);

        // Obtener los 9 usuarios y una linea_id asociada para cada uno (para el modal Registrar)
        const [usuarios] = await pool.query(
            `SELECT u.id, u.nombre_completo,
                    (SELECT lu.linea_id FROM linea_usuario lu WHERE lu.usuario_id = u.id AND lu.is_activo = TRUE LIMIT 1) as linea_id
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.is_active = TRUE AND r.nombre = 'usuarios' AND u.email IN (${ph})
             ORDER BY u.nombre_completo`,
            EMAILS_9_PRODUCCION
        );

        const lineas = [];
        let totalProduccion = 0;

        for (let i = 0; i < usuarios.length; i++) {
            const u = usuarios[i];
            // Usar linea_id solo si existe en lineas_produccion; si no, asignar una línea real por índice
            const lineaId = (u.linea_id && idsLineasValidos.includes(u.linea_id))
                ? u.linea_id
                : idsLineasValidos[i % Math.max(1, idsLineasValidos.length)];
            if (!lineaId) continue; // Sin líneas en BD no se puede mostrar tarjeta válida
            const [reg] = await pool.query(
                `SELECT COALESCE(SUM(rp.cantidad_producida), 0) as produccion_actual,
                        COALESCE(AVG(rp.eficiencia), 0) as eficiencia
                 FROM registros_produccion rp
                 WHERE rp.usuario_id = ? AND rp.fecha = ?`,
                [u.id, hoy]
            );
            const produccionActual = parseInt(reg[0]?.produccion_actual || 0);
            const objetivo = 2000;
            const eficiencia = objetivo > 0 ? Math.round((produccionActual / objetivo) * 100) : 0;
            totalProduccion += produccionActual;
            lineas.push({
                id: lineaId,
                idUsuario: u.id,
                nombre: `Linea ${u.nombre_completo}`,
                usuarios: [u.nombre_completo],
                produccionActual,
                produccionObjetivo: objetivo,
                eficiencia,
                status: 'activa'
            });
        }

        const eficienciaPromedio = lineas.length > 0
            ? Math.round(lineas.reduce((s, l) => s + l.eficiencia, 0) / lineas.length)
            : 0;

        res.json({
            lineas,
            metricas: {
                totalProduccion,
                eficienciaPromedio,
                lineasActivas: lineas.length,
                totalLineas: lineas.length
            }
        });
    } catch (error) {
        console.error("❌ Error al obtener producción de ingeniería:", error);
        res.status(500).json({ message: "Error al obtener datos de producción" });
    }
};

// Actualizar estado de una línea de producción
export const actualizarEstadoLinea = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validar estado
        if (!['activa', 'mantenimiento', 'detenida'].includes(status)) {
            return res.status(400).json({ message: "Estado inválido. Debe ser: activa, mantenimiento o detenida" });
        }

        const [result] = await pool.query(
            "UPDATE lineas_produccion SET status = ?, updated_at = NOW() WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Línea de producción no encontrada" });
        }

        res.json({ message: "Estado actualizado exitosamente", status });
    } catch (error) {
        console.error("❌ Error al actualizar estado de línea:", error);
        res.status(500).json({ message: "Error al actualizar estado de línea" });
    }
};

// Obtener registros de producción de un usuario específico (para "Mi Producción")
export const getMiProduccion = async (req, res) => {
    try {
        const usuario_id = req.query.usuario_id || req.user?.id;

        if (!usuario_id) {
            return res.status(400).json({ message: "Se requiere usuario_id" });
        }

        // Obtener registros de producción del usuario con información de la línea
        const [registros] = await pool.query(
            `SELECT 
                rp.id,
                rp.fecha,
                rp.cantidad_producida,
                rp.cantidad_objetivo,
                rp.cantidad_defectuosa,
                rp.eficiencia,
                rp.calidad,
                rp.notas,
                rp.created_at,
                lp.id as linea_id,
                lp.nombre as linea_nombre
             FROM registros_produccion rp
             INNER JOIN lineas_produccion lp ON rp.linea_id = lp.id
             WHERE rp.usuario_id = ?
             ORDER BY rp.fecha DESC, rp.created_at DESC
             LIMIT 100`,
            [usuario_id]
        );

        // Calcular métricas
        const totalProducido = registros.reduce((sum, r) => sum + (parseInt(r.cantidad_producida) || 0), 0);
        const totalOrdenes = registros.length;

        // Obtener información del usuario
        const [usuarios] = await pool.query(
            "SELECT id, nombre_completo, email FROM usuarios WHERE id = ?",
            [usuario_id]
        );

        const usuario = usuarios[0] || null;

        // Formatear registros
        const registrosFormateados = registros.map(r => ({
            id: r.id,
            fecha: r.fecha,
            linea_id: r.linea_id,
            linea_nombre: r.linea_nombre,
            producto: r.linea_nombre || 'Sin producto', // Por ahora usamos el nombre de la línea como producto
            cantidad: parseInt(r.cantidad_producida) || 0,
            cantidad_objetivo: parseInt(r.cantidad_objetivo) || 0,
            cantidad_defectuosa: parseInt(r.cantidad_defectuosa) || 0,
            eficiencia: parseFloat(r.eficiencia) || 0,
            calidad: parseFloat(r.calidad) || 0,
            notas: r.notas,
            estado: r.cantidad_producida >= r.cantidad_objetivo ? 'completada' : 'en_proceso',
            timestamp: r.created_at
        }));

        res.json({
            usuario: usuario ? {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email
            } : null,
            metricas: {
                totalProducido,
                totalOrdenes
            },
            registros: registrosFormateados
        });
    } catch (error) {
        console.error("❌ Error al obtener producción del usuario:", error);
        res.status(500).json({ 
            message: "Error al obtener producción del usuario",
            error: error.message
        });
    }
};

// Registrar producción diaria
// Normalizar fecha a YYYY-MM-DD (MySQL)
function normalizarFecha(fecha) {
    if (!fecha) return null;
    const s = String(fecha).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (d) return `${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}`;
    return s;
}

export const registrarProduccion = async (req, res) => {
    try {
        console.log('📥 Recibida petición de registro de producción:', req.body);
        let { linea_id, fecha, cantidad_producida, cantidad_objetivo, cantidad_defectuosa, notas, estado } = req.body;
        const usuario_id = req.user?.id; // Obtener del token JWT si está autenticado

        fecha = normalizarFecha(fecha);
        if (estado && typeof estado === 'string') estado = estado.toLowerCase().trim();

        // Validaciones
        if (!linea_id || !fecha || cantidad_producida === undefined) {
            console.log('❌ Validación fallida:', { linea_id, fecha, cantidad_producida });
            return res.status(400).json({ 
                message: "Faltan campos obligatorios",
                recibido: { linea_id, fecha, cantidad_producida }
            });
        }

        // Si no hay usuario_id en el token, usar el usuario de ingeniería
        let userId = usuario_id;
        if (!userId) {
            const [usuarios] = await pool.query(
                "SELECT id FROM usuarios WHERE email = 'ingenieria@textil.com' LIMIT 1"
            );
            if (usuarios.length === 0) {
                return res.status(404).json({ message: "Usuario de ingeniería no encontrado" });
            }
            userId = usuarios[0].id;
        }

        // Actualizar estado de la línea si se proporciona
        if (estado && ['activa', 'mantenimiento', 'detenida'].includes(estado)) {
            await pool.query(
                "UPDATE lineas_produccion SET status = ?, updated_at = NOW() WHERE id = ?",
                [estado, linea_id]
            );
            console.log(`✅ Estado de línea actualizado a: ${estado}`);
        }

        // Usar el objetivo proporcionado o obtenerlo de la línea
        let objetivo = cantidad_objetivo;
        if (!objetivo || objetivo === 0) {
            const [linea] = await pool.query(
                "SELECT objetivo_diario FROM lineas_produccion WHERE id = ?",
                [linea_id]
            );
            if (linea.length === 0) {
                return res.status(404).json({ message: "Línea de producción no encontrada" });
            }
            objetivo = linea[0].objetivo_diario;
        }

        // Actualizar el objetivo_diario en la línea si se proporcionó uno nuevo
        if (cantidad_objetivo && cantidad_objetivo > 0) {
            await pool.query(
                "UPDATE lineas_produccion SET objetivo_diario = ?, updated_at = NOW() WHERE id = ?",
                [cantidad_objetivo, linea_id]
            );
            console.log(`✅ Objetivo de línea actualizado a: ${cantidad_objetivo} unidades`);
        }

        // Verificar si ya existe un registro para esta línea y fecha
        const [existentes] = await pool.query(
            "SELECT id FROM registros_produccion WHERE linea_id = ? AND fecha = ?",
            [linea_id, fecha]
        );

        const { randomUUID } = await import('crypto');
        const defectuosas = cantidad_defectuosa || 0;

        if (existentes.length > 0) {
            // Actualizar registro existente
            await pool.query(
                `UPDATE registros_produccion 
                 SET cantidad_producida = ?, cantidad_objetivo = ?, cantidad_defectuosa = ?, 
                     usuario_id = ?, notas = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [cantidad_producida, objetivo, defectuosas, userId, notas || null, existentes[0].id]
            );
            res.json({ message: "Registro de producción actualizado exitosamente", id: existentes[0].id });
        } else {
            // Crear nuevo registro (eficiencia y calidad se calculan automáticamente)
            const registroId = randomUUID();
            await pool.query(
                `INSERT INTO registros_produccion 
                 (id, linea_id, usuario_id, fecha, cantidad_producida, cantidad_objetivo, cantidad_defectuosa, notas) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [registroId, linea_id, userId, fecha, cantidad_producida, objetivo, defectuosas, notas || null]
            );
            res.status(201).json({ message: "Registro de producción creado exitosamente", id: registroId });
        }
    } catch (error) {
        console.error("❌ Error al registrar producción:", error);
        res.status(500).json({ 
            message: "Error al registrar producción",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

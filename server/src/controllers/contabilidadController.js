import { pool } from "../config/db.js";
import { randomUUID } from "crypto";

const buildInventarioResumen = (items) => {
    const resumen = {
        ingenieria: { totalItems: 0, stockTotal: 0, stockMaximoTotal: 0 },
        mantenimiento: { totalItems: 0, stockTotal: 0, stockMaximoTotal: 0 }
    };

    for (const item of items) {
        const dept = item.departamento;
        if (!resumen[dept]) continue;
        resumen[dept].totalItems += 1;
        resumen[dept].stockTotal += parseFloat(item.stock_actual || 0);
        resumen[dept].stockMaximoTotal += parseFloat(item.stock_maximo || 0);
    }

    Object.keys(resumen).forEach((dept) => {
        const stockMaximoTotal = resumen[dept].stockMaximoTotal;
        const porcentajeStock = stockMaximoTotal > 0
            ? Math.round((resumen[dept].stockTotal / stockMaximoTotal) * 100)
            : 0;
        resumen[dept].porcentajeStock = Math.min(100, Math.max(0, porcentajeStock));
    });

    return resumen;
};

export const getContabilidadDashboard = async (req, res) => {
    try {
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;

        const [ingresosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'ingreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        const [egresosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'egreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        const [gastosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'gasto' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
        const añoAnterior = mesActual === 1 ? añoActual - 1 : añoActual;
        const [ingresosMesAnterior] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'ingreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoAnterior, mesAnterior]
        );

        const ingresosActual = parseFloat(ingresosMes[0]?.total || 0);
        const ingresosPasado = parseFloat(ingresosMesAnterior[0]?.total || 0);
        const cambioIngresos = ingresosPasado > 0
            ? ((ingresosActual - ingresosPasado) / ingresosPasado) * 100
            : 0;

        const [inventarioItems] = await pool.query(
            `SELECT departamento, stock_actual, stock_maximo
             FROM items_inventario
             WHERE departamento IN ('ingenieria', 'mantenimiento')`
        );

        const [registros] = await pool.query(
            `SELECT id, tipo, categoria, monto, descripcion, fecha, status, referencia
             FROM registros_financieros
             ORDER BY fecha DESC, created_at DESC
             LIMIT 10`
        );

        res.json({
            metricas: {
                ingresos: ingresosActual,
                egresos: parseFloat(egresosMes[0]?.total || 0),
                gastos: parseFloat(gastosMes[0]?.total || 0),
                utilidad: ingresosActual - parseFloat(egresosMes[0]?.total || 0) - parseFloat(gastosMes[0]?.total || 0),
                cambioIngresos: parseFloat(cambioIngresos.toFixed(1))
            },
            ingresosMensuales: {
                ingresosMensuales: ingresosActual,
                cambioPorcentaje: parseFloat(cambioIngresos.toFixed(1)),
                mesActual,
                añoActual
            },
            inventarioResumen: buildInventarioResumen(inventarioItems),
            registrosRecientes: registros
        });
    } catch (error) {
        console.error("❌ Error en dashboard contabilidad:", error);
        res.status(500).json({ message: "Error al obtener dashboard de contabilidad" });
    }
};

export const getPlanilla = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                t.id,
                t.nombre_completo,
                t.dni,
                t.telefono,
                t.cargo,
                t.fecha_ingreso,
                t.is_activo,
                u.nombre_completo as usuario,
                u.departamento as departamento_usuario
             FROM trabajadores t
             LEFT JOIN usuarios u ON t.usuario_id = u.id
             ORDER BY t.nombre_completo`
        );

        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener planilla:", error);
        res.status(500).json({ message: "Error al obtener planilla" });
    }
};

export const getInventarioGeneral = async (req, res) => {
    try {
        const [items] = await pool.query(
            `SELECT 
                id,
                nombre,
                categoria,
                stock_actual,
                stock_minimo,
                stock_maximo,
                unidad,
                status,
                departamento
             FROM items_inventario
             ORDER BY departamento, nombre`
        );

        let totalItems = items.length;
        let itemsDisponibles = 0;
        let itemsBajoStock = 0;
        let itemsAgotados = 0;

        items.forEach(item => {
            if (item.status === 'disponible') itemsDisponibles++;
            else if (item.status === 'bajo_stock') itemsBajoStock++;
            else if (item.status === 'agotado') itemsAgotados++;
        });

        const resumenDepartamentos = buildInventarioResumen(items);

        res.json({
            totalItems,
            itemsDisponibles,
            itemsBajoStock,
            itemsAgotados,
            resumenDepartamentos,
            items: items.map(item => ({
                id: item.id,
                nombre: item.nombre,
                categoria: item.categoria,
                stockActual: parseFloat(item.stock_actual || 0),
                stockMinimo: parseFloat(item.stock_minimo || 0),
                stockMaximo: parseFloat(item.stock_maximo || 0),
                unidad: item.unidad,
                status: item.status,
                departamento: item.departamento
            }))
        });
    } catch (error) {
        console.error("❌ Error al obtener inventario:", error);
        res.status(500).json({ message: "Error al obtener inventario" });
    }
};

export const getFacturas = async (req, res) => {
    try {
        const { status } = req.query;
        const params = [];
        const where = [
            "tipo = 'ingreso'",
            "(referencia LIKE 'FACT-%' OR LOWER(categoria) LIKE 'factura%')"
        ];

        if (status) {
            where.push("status = ?");
            params.push(status);
        }

        const [rows] = await pool.query(
            `SELECT id, referencia, categoria, monto, descripcion, fecha, status
             FROM registros_financieros
             WHERE ${where.join(" AND ")}
             ORDER BY fecha DESC, created_at DESC
             LIMIT 200`,
            params
        );

        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener facturas:", error);
        res.status(500).json({ message: "Error al obtener facturas" });
    }
};

export const createFactura = async (req, res) => {
    try {
        const { referencia, categoria, monto, descripcion, fecha } = req.body;
        const montoNumber = parseFloat(monto);

        if (!Number.isFinite(montoNumber) || montoNumber <= 0) {
            return res.status(400).json({ message: "Monto inválido" });
        }

        const id = randomUUID();
        const referenciaFinal = referencia && referencia.trim().length > 0
            ? referencia.trim()
            : `FACT-${Date.now()}`;
        const categoriaFinal = categoria && categoria.trim().length > 0
            ? categoria.trim()
            : "Factura";
        const fechaFinal = fecha && fecha.trim().length > 0
            ? fecha
            : new Date().toISOString().slice(0, 10);

        await pool.query(
            `INSERT INTO registros_financieros
             (id, tipo, categoria, monto, descripcion, fecha, usuario_id, status, referencia)
             VALUES (?, 'ingreso', ?, ?, ?, ?, ?, 'pendiente', ?)`,
            [id, categoriaFinal, montoNumber, descripcion || null, fechaFinal, req.user.id, referenciaFinal]
        );

        res.status(201).json({ id, referencia: referenciaFinal });
    } catch (error) {
        console.error("❌ Error al crear factura:", error);
        res.status(500).json({ message: "Error al crear factura" });
    }
};

import { pool } from "../config/db.js";

// Obtener ingresos mensuales para el Dashboard Administrativo
export const getIngresosMensuales = async (req, res) => {
    try {
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1; // getMonth() devuelve 0-11

        // Obtener ingresos del mes actual
        const [ingresosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total_ingresos
             FROM registros_financieros
             WHERE tipo = 'ingreso' 
             AND status = 'aprobado'
             AND YEAR(fecha) = ?
             AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        // Obtener ingresos del mes anterior para comparar
        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
        const añoAnterior = mesActual === 1 ? añoActual - 1 : añoActual;

        const [ingresosMesAnterior] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total_ingresos
             FROM registros_financieros
             WHERE tipo = 'ingreso' 
             AND status = 'aprobado'
             AND YEAR(fecha) = ?
             AND MONTH(fecha) = ?`,
            [añoAnterior, mesAnterior]
        );

        const ingresosActual = parseFloat(ingresosMes[0]?.total_ingresos || 0);
        const ingresosPasado = parseFloat(ingresosMesAnterior[0]?.total_ingresos || 0);

        // Calcular porcentaje de cambio
        const cambioPorcentaje = ingresosPasado > 0 
            ? ((ingresosActual - ingresosPasado) / ingresosPasado) * 100 
            : 0;

        res.json({
            ingresosMensuales: ingresosActual,
            cambioPorcentaje: parseFloat(cambioPorcentaje.toFixed(1)),
            mesActual: mesActual,
            añoActual: añoActual
        });
    } catch (error) {
        console.error("❌ Error al obtener ingresos mensuales:", error);
        res.status(500).json({ message: "Error al obtener ingresos mensuales" });
    }
};

// Obtener todas las métricas financieras
export const getMetricasFinancieras = async (req, res) => {
    try {
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;

        // Ingresos del mes actual
        const [ingresosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'ingreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        // Egresos del mes actual
        const [egresosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'egreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        // Gastos del mes actual
        const [gastosMes] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'gasto' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoActual, mesActual]
        );

        // Mes anterior para comparación
        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
        const añoAnterior = mesActual === 1 ? añoActual - 1 : añoActual;

        const [ingresosAnterior] = await pool.query(
            `SELECT COALESCE(SUM(monto), 0) as total
             FROM registros_financieros
             WHERE tipo = 'ingreso' AND status = 'aprobado'
             AND YEAR(fecha) = ? AND MONTH(fecha) = ?`,
            [añoAnterior, mesAnterior]
        );

        const ingresosActual = parseFloat(ingresosMes[0]?.total || 0);
        const ingresosPasado = parseFloat(ingresosAnterior[0]?.total || 0);
        const cambioIngresos = ingresosPasado > 0 
            ? ((ingresosActual - ingresosPasado) / ingresosPasado) * 100 
            : 0;

        res.json({
            ingresos: ingresosActual,
            egresos: parseFloat(egresosMes[0]?.total || 0),
            gastos: parseFloat(gastosMes[0]?.total || 0),
            utilidad: ingresosActual - parseFloat(egresosMes[0]?.total || 0) - parseFloat(gastosMes[0]?.total || 0),
            cambioIngresos: parseFloat(cambioIngresos.toFixed(1))
        });
    } catch (error) {
        console.error("❌ Error al obtener métricas financieras:", error);
        res.status(500).json({ message: "Error al obtener métricas financieras" });
    }
};


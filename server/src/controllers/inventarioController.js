import { pool } from "../config/db.js";

// Obtener resumen de inventario por departamento
export const getInventarioPorDepartamento = async (req, res) => {
    try {
        const { departamento } = req.query;

        if (!departamento || !['ingenieria', 'mantenimiento'].includes(departamento)) {
            return res.status(400).json({ message: "Departamento inválido. Debe ser 'ingenieria' o 'mantenimiento'" });
        }

        // Obtener todos los items del departamento
        const [items] = await pool.query(
            `SELECT 
                id,
                nombre,
                categoria,
                stock_actual,
                stock_minimo,
                stock_maximo,
                unidad,
                status
             FROM items_inventario
             WHERE departamento = ?
             ORDER BY nombre`,
            [departamento]
        );

        // Calcular métricas
        let totalItems = items.length;
        let itemsDisponibles = 0;
        let itemsBajoStock = 0;
        let itemsAgotados = 0;
        let stockTotal = 0;
        let stockMinimoTotal = 0;
        let stockMaximoTotal = 0;

        items.forEach(item => {
            stockTotal += parseFloat(item.stock_actual || 0);
            stockMinimoTotal += parseFloat(item.stock_minimo || 0);
            stockMaximoTotal += parseFloat(item.stock_maximo || 0);

            if (item.status === 'disponible') itemsDisponibles++;
            else if (item.status === 'bajo_stock') itemsBajoStock++;
            else if (item.status === 'agotado') itemsAgotados++;
        });

        // Calcular porcentaje de stock (basado en el promedio del stock actual vs stock máximo)
        let porcentajeStock = 0;
        if (items.length > 0 && stockMaximoTotal > 0) {
            porcentajeStock = Math.round((stockTotal / stockMaximoTotal) * 100);
        }

        res.json({
            departamento,
            totalItems,
            itemsDisponibles,
            itemsBajoStock,
            itemsAgotados,
            stockTotal: parseFloat(stockTotal.toFixed(2)),
            stockMinimoTotal: parseFloat(stockMinimoTotal.toFixed(2)),
            stockMaximoTotal: parseFloat(stockMaximoTotal.toFixed(2)),
            porcentajeStock: Math.min(100, Math.max(0, porcentajeStock)),
            items: items.map(item => ({
                id: item.id,
                nombre: item.nombre,
                categoria: item.categoria,
                stockActual: parseFloat(item.stock_actual || 0),
                stockMinimo: parseFloat(item.stock_minimo || 0),
                stockMaximo: parseFloat(item.stock_maximo || 0),
                unidad: item.unidad,
                status: item.status
            }))
        });
    } catch (error) {
        console.error("❌ Error al obtener inventario por departamento:", error);
        res.status(500).json({ message: "Error al obtener inventario por departamento" });
    }
};

// Obtener resumen de todos los departamentos
export const getResumenInventarioDepartamentos = async (req, res) => {
    try {
        const departamentos = ['ingenieria', 'mantenimiento'];
        const resumen = {};

        for (const dept of departamentos) {
            const [items] = await pool.query(
                `SELECT 
                    stock_actual,
                    stock_minimo,
                    stock_maximo,
                    status
                 FROM items_inventario
                 WHERE departamento = ?`,
                [dept]
            );

            let stockTotal = 0;
            let stockMaximoTotal = 0;

            items.forEach(item => {
                stockTotal += parseFloat(item.stock_actual || 0);
                stockMaximoTotal += parseFloat(item.stock_maximo || 0);
            });

            let porcentajeStock = 0;
            if (items.length > 0 && stockMaximoTotal > 0) {
                porcentajeStock = Math.round((stockTotal / stockMaximoTotal) * 100);
            }

            resumen[dept] = {
                totalItems: items.length,
                porcentajeStock: Math.min(100, Math.max(0, porcentajeStock)),
                stockTotal: parseFloat(stockTotal.toFixed(2)),
                stockMaximoTotal: parseFloat(stockMaximoTotal.toFixed(2))
            };
        }

        res.json(resumen);
    } catch (error) {
        console.error("❌ Error al obtener resumen de inventario:", error);
        res.status(500).json({ message: "Error al obtener resumen de inventario" });
    }
};

// Crear nuevo item de inventario
export const crearItemInventario = async (req, res) => {
    try {
        const { nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento } = req.body;

        if (!nombre || !categoria || !departamento || !['ingenieria', 'mantenimiento'].includes(departamento)) {
            return res.status(400).json({ message: "Faltan campos obligatorios o departamento inválido" });
        }

        const { randomUUID } = await import('crypto');
        const itemId = randomUUID();

        // Calcular status
        const stockActual = parseFloat(stock_actual || 0);
        const stockMinimo = parseFloat(stock_minimo || 0);
        let status = 'disponible';
        if (stockActual === 0) status = 'agotado';
        else if (stockActual < stockMinimo) status = 'bajo_stock';

        await pool.query(
            `INSERT INTO items_inventario 
             (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, nombre, categoria, stockActual, stockMinimo, parseFloat(stock_maximo || 0), unidad, parseFloat(costo || 0), proveedor || null, departamento, status]
        );

        res.status(201).json({ message: "Item de inventario creado exitosamente", id: itemId });
    } catch (error) {
        console.error("❌ Error al crear item de inventario:", error);
        res.status(500).json({ message: "Error al crear item de inventario" });
    }
};

// Actualizar item de inventario
export const actualizarItemInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor } = req.body;

        // Calcular status
        const stockActual = parseFloat(stock_actual || 0);
        const stockMinimo = parseFloat(stock_minimo || 0);
        let status = 'disponible';
        if (stockActual === 0) status = 'agotado';
        else if (stockActual < stockMinimo) status = 'bajo_stock';

        await pool.query(
            `UPDATE items_inventario 
             SET nombre = ?, categoria = ?, stock_actual = ?, stock_minimo = ?, stock_maximo = ?, 
                 unidad = ?, costo = ?, proveedor = ?, status = ?, updated_at = NOW()
             WHERE id = ?`,
            [nombre, categoria, stockActual, stockMinimo, parseFloat(stock_maximo || 0), unidad, parseFloat(costo || 0), proveedor || null, status, id]
        );

        res.json({ message: "Item de inventario actualizado exitosamente" });
    } catch (error) {
        console.error("❌ Error al actualizar item de inventario:", error);
        res.status(500).json({ message: "Error al actualizar item de inventario" });
    }
};

// Eliminar item de inventario
export const eliminarItemInventario = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM items_inventario WHERE id = ?", [id]);

        res.json({ message: "Item de inventario eliminado exitosamente" });
    } catch (error) {
        console.error("❌ Error al eliminar item de inventario:", error);
        res.status(500).json({ message: "Error al eliminar item de inventario" });
    }
};

// Obtener estadísticas de inventario para Gerencia (combinando Ingeniería y Mantenimiento)
export const getEstadisticasInventarioGerencia = async (req, res) => {
    try {
        console.log('📊 [getEstadisticasInventarioGerencia] Obteniendo estadísticas de inventario para Gerencia...');

        // Obtener todos los items de ambos departamentos
        const [items] = await pool.query(
            `SELECT 
                id,
                nombre,
                categoria,
                stock_actual,
                stock_minimo,
                stock_maximo,
                unidad,
                costo,
                proveedor,
                departamento,
                status,
                created_at,
                updated_at
             FROM items_inventario
             WHERE departamento IN ('ingenieria', 'mantenimiento')
             ORDER BY departamento, categoria, nombre`
        );

        console.log(`📦 [getEstadisticasInventarioGerencia] Total de items encontrados: ${items.length}`);

        // Calcular métricas generales
        let totalItems = items.length;
        let itemsDisponibles = 0;
        let itemsBajoStock = 0;
        let itemsAgotados = 0;
        let stockTotalGeneral = 0;
        let stockMinimoGeneral = 0;
        let stockMaximoGeneral = 0;
        let costoTotalGeneral = 0;

        // Métricas por departamento
        const metricasPorDepartamento = {
            ingenieria: {
                totalItems: 0,
                itemsDisponibles: 0,
                itemsBajoStock: 0,
                itemsAgotados: 0,
                stockTotal: 0,
                stockMinimo: 0,
                stockMaximo: 0,
                costoTotal: 0
            },
            mantenimiento: {
                totalItems: 0,
                itemsDisponibles: 0,
                itemsBajoStock: 0,
                itemsAgotados: 0,
                stockTotal: 0,
                stockMinimo: 0,
                stockMaximo: 0,
                costoTotal: 0
            }
        };

        // Distribución por categoría
        const categorias = {};

        // Top items con menor stock (riesgo de agotarse)
        const itemsRiesgo = [];

        items.forEach(item => {
            const stockActual = parseFloat(item.stock_actual || 0);
            const stockMinimo = parseFloat(item.stock_minimo || 0);
            const stockMaximo = parseFloat(item.stock_maximo || 0);
            const costo = parseFloat(item.costo || 0);

            // Métricas generales
            stockTotalGeneral += stockActual;
            stockMinimoGeneral += stockMinimo;
            stockMaximoGeneral += stockMaximo;
            costoTotalGeneral += costo * stockActual;

            if (item.status === 'disponible') itemsDisponibles++;
            else if (item.status === 'bajo_stock') itemsBajoStock++;
            else if (item.status === 'agotado') itemsAgotados++;

            // Métricas por departamento
            const dept = item.departamento;
            if (metricasPorDepartamento[dept]) {
                metricasPorDepartamento[dept].totalItems++;
                metricasPorDepartamento[dept].stockTotal += stockActual;
                metricasPorDepartamento[dept].stockMinimo += stockMinimo;
                metricasPorDepartamento[dept].stockMaximo += stockMaximo;
                metricasPorDepartamento[dept].costoTotal += costo * stockActual;

                if (item.status === 'disponible') metricasPorDepartamento[dept].itemsDisponibles++;
                else if (item.status === 'bajo_stock') metricasPorDepartamento[dept].itemsBajoStock++;
                else if (item.status === 'agotado') metricasPorDepartamento[dept].itemsAgotados++;
            }

            // Distribución por categoría
            const categoria = item.categoria || 'Sin categoría';
            if (!categorias[categoria]) {
                categorias[categoria] = {
                    nombre: categoria,
                    totalItems: 0,
                    stockTotal: 0,
                    itemsDisponibles: 0,
                    itemsBajoStock: 0,
                    itemsAgotados: 0
                };
            }
            categorias[categoria].totalItems++;
            categorias[categoria].stockTotal += stockActual;
            if (item.status === 'disponible') categorias[categoria].itemsDisponibles++;
            else if (item.status === 'bajo_stock') categorias[categoria].itemsBajoStock++;
            else if (item.status === 'agotado') categorias[categoria].itemsAgotados++;

            // Calcular porcentaje de stock para items en riesgo
            if (stockMaximo > 0) {
                const porcentajeStock = (stockActual / stockMaximo) * 100;
                itemsRiesgo.push({
                    id: item.id,
                    nombre: item.nombre,
                    departamento: item.departamento,
                    categoria: item.categoria,
                    stockActual: stockActual,
                    stockMinimo: stockMinimo,
                    stockMaximo: stockMaximo,
                    porcentajeStock: Math.round(porcentajeStock),
                    status: item.status,
                    unidad: item.unidad
                });
            }
        });

        // Ordenar items en riesgo por porcentaje de stock (menor primero)
        itemsRiesgo.sort((a, b) => a.porcentajeStock - b.porcentajeStock);

        // Calcular porcentaje de stock general
        let porcentajeStockGeneral = 0;
        if (stockMaximoGeneral > 0) {
            porcentajeStockGeneral = Math.round((stockTotalGeneral / stockMaximoGeneral) * 100);
        }

        // Calcular porcentaje de stock por departamento
        Object.keys(metricasPorDepartamento).forEach(dept => {
            const metrics = metricasPorDepartamento[dept];
            if (metrics.stockMaximo > 0) {
                metrics.porcentajeStock = Math.round((metrics.stockTotal / metrics.stockMaximo) * 100);
            } else {
                metrics.porcentajeStock = 0;
            }
        });

        // Convertir categorías a array
        const distribucionCategorias = Object.values(categorias).map(cat => ({
            nombre: cat.nombre,
            totalItems: cat.totalItems,
            stockTotal: parseFloat(cat.stockTotal.toFixed(2)),
            itemsDisponibles: cat.itemsDisponibles,
            itemsBajoStock: cat.itemsBajoStock,
            itemsAgotados: cat.itemsAgotados
        }));

        const resultado = {
            totales: {
                totalItems,
                itemsDisponibles,
                itemsBajoStock,
                itemsAgotados,
                stockTotal: parseFloat(stockTotalGeneral.toFixed(2)),
                stockMinimo: parseFloat(stockMinimoGeneral.toFixed(2)),
                stockMaximo: parseFloat(stockMaximoGeneral.toFixed(2)),
                porcentajeStock: Math.min(100, Math.max(0, porcentajeStockGeneral)),
                costoTotal: parseFloat(costoTotalGeneral.toFixed(2))
            },
            porDepartamento: {
                ingenieria: {
                    ...metricasPorDepartamento.ingenieria,
                    stockTotal: parseFloat(metricasPorDepartamento.ingenieria.stockTotal.toFixed(2)),
                    stockMinimo: parseFloat(metricasPorDepartamento.ingenieria.stockMinimo.toFixed(2)),
                    stockMaximo: parseFloat(metricasPorDepartamento.ingenieria.stockMaximo.toFixed(2)),
                    costoTotal: parseFloat(metricasPorDepartamento.ingenieria.costoTotal.toFixed(2))
                },
                mantenimiento: {
                    ...metricasPorDepartamento.mantenimiento,
                    stockTotal: parseFloat(metricasPorDepartamento.mantenimiento.stockTotal.toFixed(2)),
                    stockMinimo: parseFloat(metricasPorDepartamento.mantenimiento.stockMinimo.toFixed(2)),
                    stockMaximo: parseFloat(metricasPorDepartamento.mantenimiento.stockMaximo.toFixed(2)),
                    costoTotal: parseFloat(metricasPorDepartamento.mantenimiento.costoTotal.toFixed(2))
                }
            },
            distribucionCategorias,
            itemsRiesgo: itemsRiesgo.slice(0, 10), // Top 10 items con menor stock
            distribucionEstado: [
                { nombre: 'Disponible', cantidad: itemsDisponibles, porcentaje: totalItems > 0 ? Math.round((itemsDisponibles / totalItems) * 100) : 0 },
                { nombre: 'Bajo Stock', cantidad: itemsBajoStock, porcentaje: totalItems > 0 ? Math.round((itemsBajoStock / totalItems) * 100) : 0 },
                { nombre: 'Agotado', cantidad: itemsAgotados, porcentaje: totalItems > 0 ? Math.round((itemsAgotados / totalItems) * 100) : 0 }
            ]
        };

        console.log(`✅ [getEstadisticasInventarioGerencia] Estadísticas calculadas exitosamente`);
        console.log(`   - Total items: ${totalItems}`);
        console.log(`   - Ingeniería: ${metricasPorDepartamento.ingenieria.totalItems} items`);
        console.log(`   - Mantenimiento: ${metricasPorDepartamento.mantenimiento.totalItems} items`);

        res.json(resultado);
    } catch (error) {
        console.error("❌ Error al obtener estadísticas de inventario para Gerencia:", error);
        res.status(500).json({ message: "Error al obtener estadísticas de inventario" });
    }
};


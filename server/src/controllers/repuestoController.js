// controllers/repuestoController.js

import { pool } from '../config/db.js';

// Obtener todos los repuestos (y tal vez un flag de stock bajo)
export const getRepuestos = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT *, (stock <= stock_minimo) as stock_bajo FROM repuestos ORDER BY stock_bajo DESC, nombre ASC");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener repuestos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener un repuesto por ID
export const getRepuestoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM repuestos WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener repuesto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear un nuevo repuesto
export const createRepuesto = async (req, res) => {
    try {
        const { codigo, nombre, categoria, stock, stock_minimo, ubicacion, proveedor, costo, is_critico } = req.body;

        const { randomUUID } = await import('crypto');
        const repuestoId = randomUUID();

        // Insertar en tabla repuestos
        await pool.query(
            `INSERT INTO repuestos 
             (id, codigo, nombre, categoria, stock, stock_minimo, ubicacion, proveedor, costo, is_critico)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [repuestoId, codigo, nombre, categoria, stock, stock_minimo, ubicacion, proveedor, costo, is_critico || false]
        );

        // Sincronizar con items_inventario para el Dashboard Administrativo
        const stockActual = parseFloat(stock || 0);
        const stockMinimo = parseFloat(stock_minimo || 0);
        const stockMaximo = stockMinimo * 4; // Estimar máximo como 4x el mínimo si no se especifica
        let status = 'disponible';
        if (stockActual === 0) status = 'agotado';
        else if (stockActual < stockMinimo) status = 'bajo_stock';

        const inventarioId = randomUUID();
        await pool.query(
            `INSERT INTO items_inventario 
             (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'unidades', ?, ?, 'mantenimiento', ?)
             ON DUPLICATE KEY UPDATE
                stock_actual = VALUES(stock_actual),
                stock_minimo = VALUES(stock_minimo),
                stock_maximo = VALUES(stock_maximo),
                status = VALUES(status),
                updated_at = NOW()`,
            [inventarioId, nombre, categoria, stockActual, stockMinimo, stockMaximo, parseFloat(costo || 0), proveedor || null, status]
        );

        res.status(201).json({ 
            message: 'Repuesto creado exitosamente', 
            id: repuestoId 
        });
    } catch (error) {
        console.error('Error al crear repuesto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar un repuesto existente
export const updateRepuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, categoria, stock, stock_minimo, ubicacion, proveedor, costo, is_critico } = req.body;

        const [result] = await pool.query(
            `UPDATE repuestos SET 
             codigo = ?, nombre = ?, categoria = ?, stock = ?, stock_minimo = ?, 
             ubicacion = ?, proveedor = ?, costo = ?, is_critico = ?
             WHERE id = ?`,
            [codigo, nombre, categoria, stock, stock_minimo, ubicacion, proveedor, costo, is_critico, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado para actualizar.' });
        }

        // Sincronizar con items_inventario para el Dashboard Administrativo
        const stockActual = parseFloat(stock || 0);
        const stockMinimo = parseFloat(stock_minimo || 0);
        const stockMaximo = stockMinimo * 4; // Estimar máximo como 4x el mínimo
        let status = 'disponible';
        if (stockActual === 0) status = 'agotado';
        else if (stockActual < stockMinimo) status = 'bajo_stock';

        // Buscar si ya existe en items_inventario
        const [existentes] = await pool.query(
            "SELECT id FROM items_inventario WHERE nombre = ? AND departamento = 'mantenimiento'",
            [nombre]
        );

        if (existentes.length > 0) {
            // Actualizar existente
            await pool.query(
                `UPDATE items_inventario 
                 SET stock_actual = ?, stock_minimo = ?, stock_maximo = ?, categoria = ?, costo = ?, proveedor = ?, status = ?, updated_at = NOW()
                 WHERE id = ?`,
                [stockActual, stockMinimo, stockMaximo, categoria, parseFloat(costo || 0), proveedor || null, status, existentes[0].id]
            );
        } else {
            // Crear nuevo en items_inventario
            const { randomUUID } = await import('crypto');
            const inventarioId = randomUUID();
            await pool.query(
                `INSERT INTO items_inventario 
                 (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'unidades', ?, ?, 'mantenimiento', ?)`,
                [inventarioId, nombre, categoria, stockActual, stockMinimo, stockMaximo, parseFloat(costo || 0), proveedor || null, status]
            );
        }

        res.status(200).json({ message: 'Repuesto actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar un repuesto
export const deleteRepuesto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener el nombre del repuesto antes de eliminarlo para sincronizar
        const [repuesto] = await pool.query("SELECT nombre FROM repuestos WHERE id = ?", [id]);
        
        const [result] = await pool.query("DELETE FROM repuestos WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Repuesto no encontrado para eliminar.' });
        }

        // Eliminar también de items_inventario si existe
        if (repuesto.length > 0) {
            await pool.query(
                "DELETE FROM items_inventario WHERE nombre = ? AND departamento = 'mantenimiento'",
                [repuesto[0].nombre]
            );
        }

        res.status(200).json({ message: 'Repuesto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar repuesto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
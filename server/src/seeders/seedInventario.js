// Seeder para datos iniciales de inventario por departamento
import { pool } from "../config/db.js";
import { randomUUID } from 'crypto';

async function seedInventario() {
    try {
        console.log('🌱 Iniciando seed de inventario por departamento...');

        // Items de inventario para Ingeniería
        const itemsIngenieria = [
            { nombre: 'Hilo de Algodón 40/1', categoria: 'Materia Prima', stock_actual: 2500, stock_minimo: 500, stock_maximo: 5000, unidad: 'kg', costo: 15.50, proveedor: 'Proveedor Hilos S.A.S' },
            { nombre: 'Tela de Algodón 100%', categoria: 'Materia Prima', stock_actual: 1200, stock_minimo: 800, stock_maximo: 3000, unidad: 'metros', costo: 22.00, proveedor: 'Textiles del Norte' },
            { nombre: 'Tinte Azul Marino', categoria: 'Insumos', stock_actual: 50, stock_minimo: 100, stock_maximo: 500, unidad: 'litros', costo: 45.00, proveedor: 'Químicos Industriales' },
            { nombre: 'Botones de Plástico', categoria: 'Insumos', stock_actual: 0, stock_minimo: 1000, stock_maximo: 10000, unidad: 'unidades', costo: 0.05, proveedor: 'Accesorios Textiles S.A.' },
            { nombre: 'Camiseta Básica', categoria: 'Producto Terminado', stock_actual: 500, stock_minimo: 200, stock_maximo: 2000, unidad: 'unidades', costo: 35.00, proveedor: 'N/A' },
        ];

        // Items de inventario para Mantenimiento
        const itemsMantenimiento = [
            { nombre: 'Aceite Industrial', categoria: 'Insumos', stock_actual: 80, stock_minimo: 50, stock_maximo: 200, unidad: 'litros', costo: 25.00, proveedor: 'Lubricantes S.A.' },
            { nombre: 'Filtros de Aire', categoria: 'Repuestos', stock_actual: 45, stock_minimo: 30, stock_maximo: 100, unidad: 'unidades', costo: 45.00, proveedor: 'Repuestos Industriales' },
            { nombre: 'Correas de Transmisión', categoria: 'Repuestos', stock_actual: 25, stock_minimo: 20, stock_maximo: 50, unidad: 'unidades', costo: 85.00, proveedor: 'Repuestos Industriales' },
            { nombre: 'Herramientas de Corte', categoria: 'Herramientas', stock_actual: 150, stock_minimo: 100, stock_maximo: 300, unidad: 'unidades', costo: 15.00, proveedor: 'Herramientas Pro' },
            { nombre: 'Bujías', categoria: 'Repuestos', stock_actual: 0, stock_minimo: 50, stock_maximo: 200, unidad: 'unidades', costo: 12.00, proveedor: 'Repuestos Industriales' },
        ];

        // Función para determinar el status
        const getStatus = (actual, minimo, maximo) => {
            if (actual === 0) return 'agotado';
            if (actual <= minimo) return 'bajo_stock';
            return 'disponible';
        };

        // Insertar items de Ingeniería
        for (const item of itemsIngenieria) {
            const status = getStatus(item.stock_actual, item.stock_minimo, item.stock_maximo);
            const itemId = randomUUID();

            // Verificar si ya existe
            const [existentes] = await pool.query(
                "SELECT id FROM items_inventario WHERE nombre = ? AND departamento = ?",
                [item.nombre, 'ingenieria']
            );

            if (existentes.length > 0) {
                await pool.query(
                    `UPDATE items_inventario 
                     SET stock_actual = ?, stock_minimo = ?, stock_maximo = ?, unidad = ?, costo = ?, proveedor = ?, status = ?, updated_at = NOW()
                     WHERE id = ?`,
                    [item.stock_actual, item.stock_minimo, item.stock_maximo, item.unidad, item.costo, item.proveedor, status, existentes[0].id]
                );
            } else {
                await pool.query(
                    `INSERT INTO items_inventario 
                     (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ingenieria', ?)`,
                    [itemId, item.nombre, item.categoria, item.stock_actual, item.stock_minimo, item.stock_maximo, item.unidad, item.costo, item.proveedor, status]
                );
            }
        }

        // Insertar items de Mantenimiento
        for (const item of itemsMantenimiento) {
            const status = getStatus(item.stock_actual, item.stock_minimo, item.stock_maximo);
            const itemId = randomUUID();

            // Verificar si ya existe
            const [existentes] = await pool.query(
                "SELECT id FROM items_inventario WHERE nombre = ? AND departamento = ?",
                [item.nombre, 'mantenimiento']
            );

            if (existentes.length > 0) {
                await pool.query(
                    `UPDATE items_inventario 
                     SET stock_actual = ?, stock_minimo = ?, stock_maximo = ?, unidad = ?, costo = ?, proveedor = ?, status = ?, updated_at = NOW()
                     WHERE id = ?`,
                    [item.stock_actual, item.stock_minimo, item.stock_maximo, item.unidad, item.costo, item.proveedor, status, existentes[0].id]
                );
            } else {
                await pool.query(
                    `INSERT INTO items_inventario 
                     (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'mantenimiento', ?)`,
                    [itemId, item.nombre, item.categoria, item.stock_actual, item.stock_minimo, item.stock_maximo, item.unidad, item.costo, item.proveedor, status]
                );
            }
        }

        console.log('✅ Inventario sembrado exitosamente');
        console.log(`   - Ingeniería: ${itemsIngenieria.length} items`);
        console.log(`   - Mantenimiento: ${itemsMantenimiento.length} items`);
    } catch (error) {
        console.error('❌ Error al sembrar inventario:', error);
        throw error;
    }
}

seedInventario()
    .then(() => {
        console.log('✅ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });


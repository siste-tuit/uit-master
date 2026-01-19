// Script para sincronizar repuestos existentes con items_inventario
import { pool } from '../config/db.js';
import { randomUUID } from 'crypto';

async function sincronizarRepuestos() {
    try {
        console.log('🔄 Sincronizando repuestos con items_inventario...\n');

        // Obtener todos los repuestos
        const [repuestos] = await pool.query("SELECT * FROM repuestos");

        if (repuestos.length === 0) {
            console.log('⚠️ No hay repuestos para sincronizar');
            process.exit(0);
        }

        console.log(`📦 Encontrados ${repuestos.length} repuestos`);

        let sincronizados = 0;
        let actualizados = 0;

        for (const repuesto of repuestos) {
            const stockActual = parseFloat(repuesto.stock || 0);
            const stockMinimo = parseFloat(repuesto.stock_minimo || 0);
            const stockMaximo = stockMinimo * 4; // Estimar máximo
            let status = 'disponible';
            if (stockActual === 0) status = 'agotado';
            else if (stockActual < stockMinimo) status = 'bajo_stock';

            // Verificar si ya existe en items_inventario
            const [existentes] = await pool.query(
                "SELECT id FROM items_inventario WHERE nombre = ? AND departamento = 'mantenimiento'",
                [repuesto.nombre]
            );

            if (existentes.length > 0) {
                // Actualizar existente
                await pool.query(
                    `UPDATE items_inventario 
                     SET stock_actual = ?, stock_minimo = ?, stock_maximo = ?, categoria = ?, costo = ?, proveedor = ?, status = ?, updated_at = NOW()
                     WHERE id = ?`,
                    [stockActual, stockMinimo, stockMaximo, repuesto.categoria, parseFloat(repuesto.costo || 0), repuesto.proveedor || null, status, existentes[0].id]
                );
                actualizados++;
            } else {
                // Crear nuevo
                const inventarioId = randomUUID();
                await pool.query(
                    `INSERT INTO items_inventario 
                     (id, nombre, categoria, stock_actual, stock_minimo, stock_maximo, unidad, costo, proveedor, departamento, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'unidades', ?, ?, 'mantenimiento', ?)`,
                    [inventarioId, repuesto.nombre, repuesto.categoria, stockActual, stockMinimo, stockMaximo, parseFloat(repuesto.costo || 0), repuesto.proveedor || null, status]
                );
                sincronizados++;
            }
        }

        console.log(`✅ Sincronización completada:`);
        console.log(`   - Nuevos items agregados: ${sincronizados}`);
        console.log(`   - Items actualizados: ${actualizados}`);
    } catch (error) {
        console.error('❌ Error al sincronizar repuestos:', error);
        throw error;
    }
}

sincronizarRepuestos()
    .then(() => {
        console.log('\n✅ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });


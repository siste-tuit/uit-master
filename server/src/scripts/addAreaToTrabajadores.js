// Script para agregar campo area a la tabla trabajadores
import pool from "../config/db.js";

async function addAreaColumn() {
    try {
        console.log('🔄 Agregando campo area a la tabla trabajadores...\n');

        // Verificar si la columna ya existe
        const [columns] = await pool.query(
            `SHOW COLUMNS FROM trabajadores LIKE 'area'`
        );

        if (columns.length === 0) {
            await pool.query(
                `ALTER TABLE trabajadores 
                ADD COLUMN area VARCHAR(100) NULL 
                COMMENT 'Ej: Costura, Corte, Empaque, Control de Calidad' 
                AFTER cargo`
            );
            console.log('✅ Campo area agregado exitosamente');
        } else {
            console.log('✅ El campo area ya existe en la tabla');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al agregar campo area:', error);
        process.exit(1);
    }
}

addAreaColumn();


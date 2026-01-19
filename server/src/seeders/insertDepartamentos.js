// src/migraciones/insertDepartamentos.js

import { pool } from '../config/db.js';

// ⚙️ Lista de departamentos base
const DEPARTAMENTOS = [
    'administracion',
    'sistemas',
    'ingenieria',
    'gerencia',
    'contabilidad',
    'mantenimiento',
    'usuarios'
];

async function insertDepartamentos() {
    console.log('--- Iniciando inserción de departamentos ---');
    let inserted = 0;

    try {
        for (const nombre of DEPARTAMENTOS) {
            const query = `
        INSERT INTO departamentos (nombre, descripcion)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
      `;
            await pool.query(query, [nombre, `Departamento de ${nombre}`]);
            inserted++;
        }

        console.log(`✅ Se insertaron/actualizaron ${inserted} departamentos correctamente.`);
    } catch (error) {
        console.error('❌ Error al insertar departamentos:', error);
    } finally {
        process.exit(0);
    }
}

insertDepartamentos();

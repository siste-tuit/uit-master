// src/seeders/insertRoles.js

import { pool } from '../config/db.js';

// 📋 Lista de roles base del sistema
const ROLES = [
    {
        nombre: 'administrador',
        descripcion: 'Acceso completo a todos los módulos del sistema',
        dashboard_path: '/administracion/dashboard'
    },
    {
        nombre: 'contabilidad',
        descripcion: 'Gestión financiera y facturación',
        dashboard_path: '/contabilidad/dashboard'
    },
    {
        nombre: 'gerencia',
        descripcion: 'Dashboards y métricas estratégicas',
        dashboard_path: '/gerencia/production'
    },
    {
        nombre: 'usuarios',
        descripcion: 'Registro de producción y consulta de stock',
        dashboard_path: '/produccion/dashboard'
    },
    {
        nombre: 'sistemas',
        descripcion: 'Gestión de incidencias y configuración del sistema',
        dashboard_path: '/sistemas/dashboard'
    },
    {
        nombre: 'ingenieria',
        descripcion: 'Gestión de ingeniería y proyectos',
        dashboard_path: '/ingenieria/dashboard'
    },
    {
        nombre: 'mantenimiento',
        descripcion: 'Gestión de equipos y mantenimiento',
        dashboard_path: '/mantenimiento/dashboard'
    },
    {
        nombre: 'produccion',
        descripcion: 'Control de producción y órdenes',
        dashboard_path: '/produccion/dashboard'
    }
];

async function insertRoles() {
    console.log('--- Iniciando inserción de roles ---');
    let inserted = 0;

    try {
        for (const rol of ROLES) {
            const query = `
                INSERT INTO roles (nombre, descripcion, dashboard_path)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    descripcion = VALUES(descripcion), 
                    dashboard_path = VALUES(dashboard_path);
            `;
            await pool.query(query, [rol.nombre, rol.descripcion, rol.dashboard_path]);
            inserted++;
        }

        console.log(`✅ Se insertaron/actualizaron ${inserted} roles correctamente.`);
    } catch (error) {
        console.error('❌ Error al insertar roles:', error);
    } finally {
        process.exit(0);
    }
}

insertRoles();


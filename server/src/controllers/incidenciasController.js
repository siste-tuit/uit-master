import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// ✅ Obtener todas las incidencias
export const getIncidencias = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT i.*, 
             u.nombre_completo AS reportado_por_nombre,
             a.nombre_completo AS asignado_a_nombre,
             d.nombre AS departamento_nombre
      FROM incidencias i
      LEFT JOIN usuarios u ON i.reportado_por = u.id
      LEFT JOIN usuarios a ON i.asignado_a = a.id
      LEFT JOIN departamentos d ON i.departamento_id = d.id
      ORDER BY i.fecha_reporte DESC
    `);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener incidencias:", error);
        res.status(500).json({ message: "Error al obtener incidencias" });
    }
};

// ✅ Obtener una incidencia por ID
export const getIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `
      SELECT i.*, 
             u.nombre_completo AS reportado_por_nombre,
             a.nombre_completo AS asignado_a_nombre,
             d.nombre AS departamento_nombre
      FROM incidencias i
      LEFT JOIN usuarios u ON i.reportado_por = u.id
      LEFT JOIN usuarios a ON i.asignado_a = a.id
      LEFT JOIN departamentos d ON i.departamento_id = d.id
      WHERE i.id = ?
      `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Incidencia no encontrada" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error al obtener incidencia:", error);
        res.status(500).json({ message: "Error al obtener incidencia" });
    }
};

// ✅ Crear una nueva incidencia
export const createIncidencia = async (req, res) => {
    try {
        const id = uuidv4();
        const {
            titulo,
            descripcion,
            prioridad,
            estado = "pendiente",
            reportado_por,
            asignado_a = null,
            departamento_id = null,
        } = req.body;

        const [result] = await pool.query(
            `
      INSERT INTO incidencias (
        id, titulo, descripcion, prioridad, estado,
        reportado_por, asignado_a, departamento_id, fecha_reporte
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
            [
                id,
                titulo,
                descripcion,
                prioridad,
                estado,
                reportado_por,
                asignado_a,
                departamento_id,
            ]
        );

        res.status(201).json({
            message: "✅ Incidencia creada correctamente",
            id,
        });
    } catch (error) {
        console.error("❌ Error al crear incidencia:", error);
        res.status(500).json({ message: "Error al crear incidencia" });
    }
};

// ✅ Actualizar una incidencia
export const updateIncidencia = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            titulo,
            descripcion,
            prioridad,
            estado,
            asignado_a,
            departamento_id,
            fecha_resolucion = null,
        } = req.body;

        const [result] = await pool.query(
            `
      UPDATE incidencias
      SET 
        titulo = ?, 
        descripcion = ?, 
        prioridad = ?, 
        estado = ?, 
        asignado_a = ?, 
        departamento_id = ?, 
        fecha_resolucion = ?
      WHERE id = ?
      `,
            [
                titulo,
                descripcion,
                prioridad,
                estado,
                asignado_a,
                departamento_id,
                fecha_resolucion,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Incidencia no encontrada" });
        }

        res.json({ message: "✅ Incidencia actualizada correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar incidencia:", error);
        res.status(500).json({ message: "Error al actualizar incidencia" });
    }
};

// ✅ Eliminar una incidencia
export const deleteIncidencia = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM incidencias WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Incidencia no encontrada" });
        }

        res.json({ message: "🗑️ Incidencia eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar incidencia:", error);
        res.status(500).json({ message: "Error al eliminar incidencia" });
    }
};

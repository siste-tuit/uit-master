// src/controllers/departamentController.js
import { pool } from "../config/db.js";

// ✅ Obtener todos los departamentos
export const getDepartamentos = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM departamentos ORDER BY nombre ASC");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener departamentos:", error);
        res.status(500).json({ message: "Error al obtener departamentos" });
    }
};

// ✅ Crear un nuevo departamento
export const createDepartamento = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "El nombre es obligatorio" });
        }

        const query = `INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)`;
        await pool.query(query, [nombre, descripcion || null]);

        res.status(201).json({ message: "Departamento creado correctamente" });
    } catch (error) {
        console.error("❌ Error al crear departamento:", error);
        res.status(500).json({ message: "Error al crear departamento" });
    }
};

// ✅ Actualizar un departamento
export const updateDepartamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const query = `
      UPDATE departamentos
      SET nombre = ?, descripcion = ?, updated_at = NOW()
      WHERE id = ?
    `;

        const [result] = await pool.query(query, [nombre, descripcion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }

        res.json({ message: "Departamento actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar departamento:", error);
        res.status(500).json({ message: "Error al actualizar departamento" });
    }
};

// ✅ Eliminar un departamento
export const deleteDepartamento = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM departamentos WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }

        res.json({ message: "Departamento eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar departamento:", error);
        res.status(500).json({ message: "Error al eliminar departamento" });
    }
};

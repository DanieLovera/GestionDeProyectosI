import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const listCommissions = async (req, res) => {
  try {
    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    // Buscar common_expenses cuyo description empiece por "Comisión administración"
    const rows = await db.all(
      "SELECT id, description, amount AS amount, date FROM common_expenses WHERE description LIKE 'Comisión administración%' ORDER BY date DESC"
    );
    res.json(rows || []);
  } catch (err) {
    console.error("Error al listar comisiones:", err);
    res.status(500).json({ message: "Error al listar comisiones", error: err.message });
  }
};

export const markCommissionPaid = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "id es requerido" });

    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    const existing = await db.get("SELECT * FROM common_expenses WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ message: "Comisión no encontrada" });

    // Eliminar la fila (marcar como pagada)
    await db.run("DELETE FROM common_expenses WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error al marcar comisión como pagada:", err);
    res.status(500).json({ message: "Error al marcar comisión como pagada", error: err.message });
  }
};

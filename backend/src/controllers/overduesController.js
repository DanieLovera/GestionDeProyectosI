import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getOverdueConfig = async (req, res) => {
  try {
    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    const config = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (!config) {
      // Default coherente con frontend (0.5% diario)
      return res.json({ rate: 0.005, startDay: 0, mode: "simple" });
    }

    res.json(config);
  } catch (err) {
    console.error("Error al obtener configuración de moras:", err);
    res.status(500).json({ message: "Error al obtener configuración", error: err.message });
  }
};

export const updateOverdueConfig = async (req, res) => {
  const { rate, startDay, mode = "simple" } = req.body;

  if (rate == null || startDay == null) {
    return res.status(400).json({ message: "rate y startDay son requeridos" });
  }

  try {
    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    const existing = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (existing) {
      await db.run("UPDATE overdues_config SET rate = ?, startDay = ?, mode = ? WHERE id = ?",
        [rate, startDay, mode, existing.id]);
    } else {
      await db.run("INSERT INTO overdues_config (rate, startDay, mode) VALUES (?, ?, ?)",
        [rate, startDay, mode]);
    }

    res.json({ rate, startDay, mode });
  } catch (err) {
    console.error("Error al actualizar configuración de moras:", err);
    res.status(500).json({ message: "Error al actualizar configuración", error: err.message });
  }
};

// nuevo: listar moras
export const getOverdues = async (req, res) => {
  try {
    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    const rows = await db.all(`
      SELECT o.id, o.unit_id as unitId, COALESCE(u.name, o.unit_name) as unit, o.dueDate, o.originalAmount
      FROM overdues o
      LEFT JOIN units u ON u.id = o.unit_id
      ORDER BY o.dueDate DESC
    `);
    res.json(rows || []);
  } catch (err) {
    console.error("Error al obtener moras:", err);
    res.status(500).json({ message: "Error al obtener moras", error: err.message });
  }
};

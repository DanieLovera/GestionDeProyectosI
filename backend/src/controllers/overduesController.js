import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getOverdueConfig = async (req, res) => {
  try {
    const db = await open({ filename: "./data/database.db", driver: sqlite3.Database });
    const config = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (!config) {
      return res.json({ rate: 0.05, startDay: 10, mode: "simple" }); // defaults
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

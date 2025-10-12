import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getOverdueConfig = async (req, res) => {
  try {
    const db = await open({
      filename: "./data/database.db",
      driver: sqlite3.Database,
    });

    const config = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (!config) {
      return res.json({ rate: 0.05, startDay: 10, mode: "simple" }); //tiene un valor por defecto
    }

    res.json(config);
  } catch (err) {
    console.error("Error fetching overdue config:", err);
    res.status(500).json({ message: "Error fetching overdue config", error: err.message });
  }
};

export const updateOverdueConfig = async (req, res) => {
  const { rate, startDay, mode = "simple" } = req.body;

  if (rate == null || startDay == null) {
    return res.status(400).json({ message: "rate y startDay son requeridos" });
  }

  try {
    const db = await open({
      filename: "./data/database.db",
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS overdues_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rate REAL,
        startDay INTEGER,
        mode TEXT
      )
    `);

    const existing = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (existing) {
      await db.run(
        "UPDATE overdues_config SET rate = ?, startDay = ?, mode = ? WHERE id = ?",
        [rate, startDay, mode, existing.id]
      );
    } else {
      await db.run(
        "INSERT INTO overdues_config (rate, startDay, mode) VALUES (?, ?, ?)",
        [rate, startDay, mode]
      );
    }

    res.json({ rate, startDay, mode });
  } catch (err) {
    console.error("Error updating overdue config:", err);
    res.status(500).json({ message: "Error updating overdue config", error: err.message });
  }
};

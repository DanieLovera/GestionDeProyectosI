import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getCommissionConfig = async (req, res) => {
  try {
    const db = await open({
      filename: "./data/database.db",
      driver: sqlite3.Database,
    });

    const config = await db.get("SELECT * FROM commission_config LIMIT 1");

    if (!config) {
      return res.json({ rate: 0.1, base: 10000 }); // tiene el valor por default
    }

    res.json(config);
  } catch (err) {
    console.error("Error fetching commission config:", err);
    res.status(500).json({ message: "Error fetching commission config", error: err.message });
  }
};

export const updateCommissionConfig = async (req, res) => {
  const { rate, base } = req.body;

  if (rate == null || base == null) {
    return res.status(400).json({ message: "rate y base son requeridos" });
  }

  try {
    const db = await open({
      filename: "./data/database.db",
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS commission_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rate REAL,
        base REAL
      )
    `);

    const existing = await db.get("SELECT * FROM commission_config LIMIT 1");

    if (existing) {
      await db.run(
        "UPDATE commission_config SET rate = ?, base = ? WHERE id = ?",
        [rate, base, existing.id]
      );
    } else {
      await db.run(
        "INSERT INTO commission_config (rate, base) VALUES (?, ?)",
        [rate, base]
      );
    }

    res.json({ rate, base });
  } catch (err) {
    console.error("Error updating commission config:", err);
    res.status(500).json({ message: "Error updating commission config", error: err.message });
  }
};

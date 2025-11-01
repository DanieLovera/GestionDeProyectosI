import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getCommissionConfig = async (req, res) => {
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const config = await db.get("SELECT * FROM commission_config LIMIT 1");

    if (!config) {
      return res.json({ rate: 0.1, base: 10000 }); // default
    }

    res.json(config);
  } catch (err) {
    console.error("Error al obtener configuración de comisión:", err);
    res.status(500).json({ message: "Error al obtener configuración", error: err.message });
  }
};

export const updateCommissionConfig = async (req, res) => {
  const { rate, base } = req.body;

  if (rate == null || base == null) {
    return res.status(400).json({ message: "rate y base son requeridos" });
  }

  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });

    const existing = await db.get("SELECT * FROM commission_config LIMIT 1");

    if (existing) {
      await db.run("UPDATE commission_config SET rate = ?, base = ? WHERE id = ?",
        [rate, base, existing.id]);
    } else {
      await db.run("INSERT INTO commission_config (rate, base) VALUES (?, ?)", [rate, base]);
    }

    res.json({ rate, base });
  } catch (err) {
    console.error("Error al actualizar configuración de comisión:", err);
    res.status(500).json({ message: "Error al actualizar configuración", error: err.message });
  }
};

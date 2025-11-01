import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getPaymentMethods = async (req, res) => {
  const methods = ["Efectivo", "Transferencia", "Tarjeta", "MercadoPago"];
  res.json(methods);
};

export const getConsortiumSettings = async (req, res) => {
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS consortium_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        currency TEXT,
        timezone TEXT
      )
    `);

    let settings = await db.get("SELECT * FROM consortium_settings LIMIT 1");
    if (!settings) {
      settings = {
        name: "Consorcio Central",
        address: "Av. Siempre Viva 742",
        currency: "ARS",
        timezone: "America/Argentina/Buenos_Aires",
      };
    }
    res.json(settings);
  } catch (err) {
    console.error("Error al obtener configuración del consorcio:", err);
    res.status(500).json({ message: "Error al obtener configuración", error: err.message });
  }
};

export const getHealthStatus = async (req, res) => {
  res.json({ status: "ok" });
};

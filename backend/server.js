import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { usersRouter } from "./src/routes/usersRoute.js";
import { unitsRouter } from "./src/routes/unitsRoute.js";
import { commonExpensesRouter } from "./src/routes/commonExpensesRoute.js";
import { paymentsRouter } from "./src/routes/paymentsRoute.js";
import { individualExpensesRouter } from "./src/routes/individualExpensesRoute.js";
import { overduesRouter } from "./src/routes/overduesRoute.js";
import { commissionRouter } from "./src/routes/commissionRoute.js";
import { settingsRouter } from "./src/routes/settingsRoute.js";
import { reportsRouter } from "./src/routes/reportsRoute.js";
import { commissionsRouter } from "./src/routes/commissionsRoute.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a SQLite (GLOBAL - solo usuarios)
const dbPromise = open({
  filename: "./data/database.db",
  driver: sqlite3.Database
});

// --- Multi-tenant helpers ---
const TENANTS_DIR = process.env.TENANTS_DIR || "./data/tenants";
if (!fs.existsSync(TENANTS_DIR)) {
  fs.mkdirSync(TENANTS_DIR, { recursive: true });
}

const tenantCache = new Map();

function slugifyConsortium(name = "") {
  return String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "default";
}

async function ensureTenantSchema(db) {
  // Tablas por consorcio (idénticas a las que tenías antes)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      surface INTEGER,
      owner TEXT
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS common_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      amount REAL,
      date DATE
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      amount REAL,
      date DATE,
      method TEXT,
      FOREIGN KEY (unit_id) REFERENCES units (id)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS individual_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      description TEXT,
      amount REAL,
      date DATE,
      FOREIGN KEY (unit_id) REFERENCES units (id)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS overdues_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rate REAL,
      startDay INTEGER,
      mode TEXT
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS commission_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rate REAL,
      base REAL
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS overdues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      unit_name TEXT,
      dueDate DATE,
      originalAmount REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units (id)
    )
  `);
}

async function getTenantDb(consortiumName) {
  const slug = slugifyConsortium(consortiumName);
  if (tenantCache.has(slug)) return tenantCache.get(slug);

  const dir = path.join(TENANTS_DIR, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = path.join(dir, "database.db");

  const db = await open({ filename, driver: sqlite3.Database });
  await ensureTenantSchema(db); // asegura estructura
  tenantCache.set(slug, db);
  return db;
}

// Middleware: decodifica JWT y resuelve tenant (JWT o X-Consortium o ?consortium)
app.use(async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    let decoded = null;
    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      } catch {
        // token inválido -> continuar sin usuario
      }
    }
    req.authUser = decoded || null;

    const consortium =
      (decoded && decoded.consortium) ||
      req.headers["x-consortium"] ||
      req.query.consortium ||
      null;

    if (consortium) {
      req.tenantDb = await getTenantDb(consortium);
      req.consortium = consortium;
    }
    next();
  } catch (e) {
    console.error("Tenant resolver error:", e);
    next();
  }
});

// NUEVO: Guard global — exige consorcio en todas las rutas salvo auth/health
app.use((req, res, next) => {
  const openPaths = ["/users/login", "/users/register", "/health"];
  if (openPaths.some((p) => req.path.startsWith(p))) return next();
  if (!req.tenantDb) {
    return res.status(400).json({
      message: "Consortium requerido. Envíe Authorization Bearer con claim 'consortium' o header 'X-Consortium'.",
    });
  }
  next();
});

// Guardar la promesa de inicialización (GLOBAL - usuarios)
const initPromise = dbPromise.then(async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT unique,
      password TEXT,
      role TEXT,
      consortium TEXT
    )
  `);

  // IMPORTANTE: crear también el esquema completo en la DB global para no romper routers existentes
  await ensureTenantSchema(db);

  // Seed global opcional: solo usuarios de demo
  const shouldSeed = String(process.env.SEED_DB || "false").toLowerCase() === "true";
  if (shouldSeed) {
    try {
      console.log("⏳ SEED_DB=true (global users)...");
      const usersCount = (await db.get("SELECT COUNT(*) as cnt FROM users")).cnt || 0;
      if (usersCount === 0) {
        const pw = await bcrypt.hash("password", 10);
        await db.run(
          "INSERT INTO users (name, email, password, role, consortium) VALUES (?, ?, ?, ?, ?)",
          ["Admin Demo", "admin@example.com", pw, "admin", "DemoConsortium"]
        );
        console.log("  - Users seeded (admin@example.com / password)");
      } else {
        console.log("  - Users existen, saltando seed de users");
      }
    } catch (err) {
      console.error("Error durante seed global de users:", err);
    }
  }
}).catch((err) => {
  console.error("Error inicializando la base de datos:", err);
});

// --- Endpoints TENANT-AWARE previos a routers ---

// Overdues config (tenant)
app.get("/overdues/config", async (req, res) => {
  try {
    const db = req.tenantDb;
    const row = await db.get("SELECT rate, startDay, mode FROM overdues_config LIMIT 1");
    if (!row) return res.json({ rate: 0.001, startDay: 0, mode: "simple" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener configuración", error: err.message });
  }
});
app.put("/overdues/config", async (req, res) => {
  try {
    const db = req.tenantDb;
    const { rate, startDay, mode } = req.body;
    const existing = await db.get("SELECT id FROM overdues_config LIMIT 1");
    if (existing) {
      await db.run("UPDATE overdues_config SET rate=?, startDay=?, mode=? WHERE id=?", [rate, startDay, mode ?? "simple", existing.id]);
    } else {
      await db.run("INSERT INTO overdues_config (rate, startDay, mode) VALUES (?, ?, ?)", [rate, startDay, mode ?? "simple"]);
    }
    res.json({ rate, startDay, mode: mode ?? "simple" });
  } catch (err) {
    res.status(500).json({ message: "Error al guardar configuración", error: err.message });
  }
});

// Common expenses (mínimo GET/POST tenant)
app.get("/common-expenses", async (req, res) => {
  try {
    const db = req.tenantDb;
    const rows = await db.all("SELECT * FROM common_expenses ORDER BY date DESC, id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al listar gastos", error: err.message });
  }
});
app.post("/common-expenses", async (req, res) => {
  try {
    const db = req.tenantDb;
    const { description, amount, date } = req.body;
    const r = await db.run("INSERT INTO common_expenses (description, amount, date) VALUES (?, ?, ?)", [description, amount, date]);
    const saved = await db.get("SELECT * FROM common_expenses WHERE id = ?", [r.lastID]);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "An unexpected error has occurred.", error: err.message });
  }
});

// Individual expenses (tenant)
app.get("/individual-expenses", async (req, res) => {
  try {
    const db = req.tenantDb;
    const { unitId, from, to } = req.query;
    const where = [];
    const params = [];
    if (unitId) { where.push("unit_id = ?"); params.push(unitId); }
    if (from) { where.push("date >= ?"); params.push(from); }
    if (to) { where.push("date <= ?"); params.push(to); }
    const sql = `SELECT * FROM individual_expenses ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY date DESC, id DESC`;
    const rows = await db.all(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al listar gastos individuales", error: err.message });
  }
});
app.post("/individual-expenses", async (req, res) => {
  try {
    const db = req.tenantDb;
    const { unitId, description, amount, date } = req.body;
    const r = await db.run(
      "INSERT INTO individual_expenses (unit_id, description, amount, date) VALUES (?, ?, ?, ?)",
      [unitId, description, amount, date]
    );
    const saved = await db.get("SELECT * FROM individual_expenses WHERE id = ?", [r.lastID]);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error al crear gasto individual", error: err.message });
  }
});

// Commissions (listar desde common_expenses por descripción)
app.get("/commissions", async (req, res) => {
  try {
    const db = req.tenantDb;
    const rows = await db.all(
      "SELECT id, description, amount, date FROM common_expenses WHERE description LIKE 'Comisión administración %' ORDER BY date DESC, id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al listar comisiones", error: err.message });
  }
});

// Reports (tenant)
app.get("/reports/dashboard", async (req, res) => {
  try {
    const db = req.tenantDb;
    const month = String(req.query.month || new Date().getMonth() + 1).padStart(2, "0");
    const year = String(req.query.year || new Date().getFullYear());
    const ce = await db.get(
      "SELECT COALESCE(SUM(amount),0) total FROM common_expenses WHERE strftime('%m', date)=? AND strftime('%Y', date)=?",
      [month, year]
    );
    const collected = await db.get(
      "SELECT COALESCE(SUM(amount),0) total FROM payments WHERE strftime('%m', date)=? AND strftime('%Y', date)=?",
      [month, year]
    );
    const overdue = await db.get(
      "SELECT COALESCE(SUM(originalAmount),0) total FROM overdues WHERE strftime('%m', dueDate)=? AND strftime('%Y', dueDate)=?",
      [month, year]
    );
    res.json({
      period: { month, year },
      totals: {
        commonExpenses: Number(ce.total || 0),
        collected: Number(collected.total || 0),
        overdue: Number(overdue.total || 0),
        lateFees: 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error en dashboard", error: err.message });
  }
});
app.get("/reports/by-unit", async (req, res) => {
  try {
    const db = req.tenantDb;
    const month = String(req.query.month || new Date().getMonth() + 1).padStart(2, "0");
    const year = String(req.query.year || new Date().getFullYear());
    const units = await db.all("SELECT id, name, surface FROM units");
    const totalSurface = units.reduce((s,u)=>s+(Number(u.surface)||0),0);
    const ce = await db.get(
      "SELECT COALESCE(SUM(amount),0) total FROM common_expenses WHERE strftime('%m', date)=? AND strftime('%Y', date)=?",
      [month, year]
    );
    const pays = await db.all(
      "SELECT unit_id, COALESCE(SUM(amount),0) paid FROM payments WHERE strftime('%m', date)=? AND strftime('%Y', date)=? GROUP BY unit_id",
      [month, year]
    );
    const payMap = Object.fromEntries(pays.map(p=>[String(p.unit_id||""), Number(p.paid||0)]));
    const items = units.map(u=>{
      const pct = totalSurface>0 ? (Number(u.surface)||0)/totalSurface : 0;
      const amount = Math.round(Number(ce.total||0)*pct);
      const paid = payMap[String(u.id)]||0;
      const pending = Math.max(0, amount - paid);
      return { id: u.id, name: u.name, surface: u.surface, participationPct: pct, amount, paid, pending, lateFee: 0 };
    });
    res.json({ period: { month, year }, units: items });
  } catch (err) {
    res.status(500).json({ message: "Error en reporte por unidad", error: err.message });
  }
});
app.get("/reports/by-category", async (req, res) => {
  try {
    const db = req.tenantDb;
    const month = String(req.query.month || new Date().getMonth() + 1).padStart(2, "0");
    const year = String(req.query.year || new Date().getFullYear());
    const rows = await db.all(
      "SELECT description as name, COALESCE(SUM(amount),0) amount FROM common_expenses WHERE strftime('%m', date)=? AND strftime('%Y', date)=? GROUP BY description",
      [month, year]
    );
    res.json({ period: { month, year }, categories: rows });
  } catch (err) {
    res.status(500).json({ message: "Error en reporte por categoría", error: err.message });
  }
});

// --- Endpoints que deben usar la DB del tenant ---

// crear pago (tenant) y borrar overdue asociado
app.post("/payments", async (req, res) => {
  try {
    if (!req.tenantDb) {
      return res.status(400).json({ message: "Consortium requerido (token o header X-Consortium)" });
    }
    const { unitId, unit_id, amount, date, method, overdueId } = req.body;
    const uidRaw = unitId ?? unit_id ?? null;
    if (!uidRaw || amount == null) {
      return res.status(400).json({ message: "unitId and amount are required" });
    }

    const db = req.tenantDb;
    const unitIdNormalized = Number(uidRaw) || null;

    const r = await db.run(
      "INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)",
      [unitIdNormalized, amount, date || new Date().toISOString().slice(0, 10), method || "manual"]
    );

    if (overdueId) {
      try {
        await db.run("DELETE FROM overdues WHERE id = ?", [overdueId]);
      } catch (e) {
        console.warn("No se pudo eliminar overdue:", e?.message || e);
      }
    }

    const saved = await db.get("SELECT * FROM payments WHERE id = ?", [r.lastID]);
    return res.json(saved);
  } catch (err) {
    console.error("Error en POST /payments:", err);
    return res.status(500).json({ message: "Error creando pago", error: err?.message || String(err) });
  }
});

async function generateOverduesFor(db, month, year) {
  // month: "01".."12", year: "2025"
  const totalRow = await db.get(
    `SELECT COALESCE(SUM(amount),0) as total
     FROM common_expenses
     WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?`,
    [month, year]
  );
  const totalCommon = Number(totalRow?.total || 0);

  const units = await db.all(`SELECT id, name, surface FROM units`);
  const totalSurface = units.reduce((s, u) => s + (Number(u.surface) || 0), 0);

  const paymentsRows = await db.all(
    `SELECT COALESCE(unit_id, 0) as unit_id, COALESCE(SUM(amount),0) as paid
     FROM payments
     WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
     GROUP BY unit_id`,
    [month, year]
  );
  const paidMap = {};
  paymentsRows.forEach((p) => {
    paidMap[String(p.unit_id)] = Number(p.paid || 0);
  });

  const dueDate = `${year}-${month}-01`;
  const created = [];

  for (const u of units) {
    // sólo unidades con id numérico (tabla units)
    const pct = totalSurface > 0 ? (Number(u.surface) || 0) / totalSurface : 0;
    const amountToPay = Math.round(totalCommon * pct);
    const paid = paidMap[String(u.id)] || 0;
    const pending = Math.max(0, amountToPay - paid);

    if (pending > 0) {
      // evitar duplicados para la misma unidad y mes
      const exists = await db.get(
        "SELECT 1 FROM overdues WHERE unit_id = ? AND dueDate = ? LIMIT 1",
        [u.id, dueDate]
      );
      if (!exists) {
        const r = await db.run(
          "INSERT INTO overdues (unit_id, unit_name, dueDate, originalAmount) VALUES (?, ?, ?, ?)",
          [u.id, u.name, dueDate, pending]
        );
        const inserted = await db.get("SELECT * FROM overdues WHERE id = ?", [r.lastID]);
        created.push(inserted);
      }
    }
  }

  return created;
}

app.post("/overdues/generate", async (req, res) => {
  try {
    if (!req.tenantDb) {
      return res.status(400).json({ message: "Consortium requerido (token o header X-Consortium)" });
    }
    const month = req.query.month ? String(req.query.month).padStart(2, "0") : null;
    const year = req.query.year ? String(req.query.year) : null;
    if (!month || !year) {
      return res.status(400).json({ message: "month y year son requeridos como query params" });
    }

    const created = await generateOverduesFor(req.tenantDb, month, year);
    return res.json({ generated: created.length, items: created });
  } catch (err) {
    console.error("Error generando moras:", err);
    return res.status(500).json({ message: "Error generando moras", error: err?.message || String(err) });
  }
});

// Registrar rutas
app.use("/units", unitsRouter);
app.use("/users", usersRouter);
app.use("/common-expenses", commonExpensesRouter);
app.use("/payments", paymentsRouter);
app.use("/individual-expenses", individualExpensesRouter);
app.use("/overdues", overduesRouter);
app.use("/config/commission", commissionRouter);
app.use("/commissions", commissionsRouter);
app.use("/", settingsRouter);
app.use("/reports", reportsRouter);

// Iniciar servidor
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

// Auto-generate moras en el tenant actual no aplica aquí (depende del consorcio).
// Puedes dejar tareas programadas por tenant si lo necesitas en otra capa.

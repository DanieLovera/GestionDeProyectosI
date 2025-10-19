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
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a SQLite
const dbPromise = open({
  filename: "./data/database.db",
  driver: sqlite3.Database
});

// Inicialización única y seed opcional
dbPromise.then(async (db) => {
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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT unique,
      password TEXT,
      role TEXT,
      consortium TEXT
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

  // Seed opcional: solo si SEED_DB === "true"
  const shouldSeed = String(process.env.SEED_DB || "false").toLowerCase() === "true";
  if (shouldSeed) {
    try {
      console.log("⏳ SEED_DB=true -> verificando datos iniciales...");
      // comprobar y seed solo si tablas vacías
      let uCount = (await db.get("SELECT COUNT(*) as cnt FROM units")).cnt || 0;
      if (uCount === 0) {
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 1", 50, "Propietario 1"]);
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 2", 40, "Propietario 2"]);
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 3", 30, "Propietario 3"]);
        console.log("  - Units seeded");
        // recomputar cantidad de unidades después del seed
        uCount = (await db.get("SELECT COUNT(*) as cnt FROM units")).cnt || 0;
      } else {
        console.log("  - Units existen, saltando seed de units");
      }

      const ceCount = (await db.get("SELECT COUNT(*) as cnt FROM common_expenses")).cnt || 0;
      if (ceCount === 0) {
        await db.run("INSERT INTO common_expenses (description, amount, date) VALUES (?, ?, ?)", ["Limpieza mensual", 12000, "2025-10-01"]);
        await db.run("INSERT INTO common_expenses (description, amount, date) VALUES (?, ?, ?)", ["Seguro edificio", 8000, "2025-10-05"]);
        console.log("  - Common expenses seeded");
      } else {
        console.log("  - Common expenses existen, saltando seed de common_expenses");
      }

      const pCount = (await db.get("SELECT COUNT(*) as cnt FROM payments")).cnt || 0;
      if (pCount === 0) {
        // obtener primer unit id (consultar de nuevo para estar seguro)
        const firstUnit = await db.get("SELECT id FROM units LIMIT 1");
        if (firstUnit) {
          await db.run("INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)", [firstUnit.id, 8000, "2025-10-05", "transferencia"]);
          console.log("  - Payments seeded");
        } else {
          console.log("  - No hay units disponibles para seed de payments");
        }
      } else {
        console.log("  - Payments existen, saltando seed de payments");
      }

      const usersCount = (await db.get("SELECT COUNT(*) as cnt FROM users")).cnt || 0;
      if (usersCount === 0) {
        const pw = await bcrypt.hash("password", 10);
        await db.run("INSERT INTO users (name, email, password, role, consortium) VALUES (?, ?, ?, ?, ?)", [
          "Admin Demo",
          "admin@example.com",
          pw,
          "admin",
          "DemoConsortium"
        ]);
        console.log("  - Users seeded (admin@example.com / password)");
      } else {
        console.log("  - Users existen, saltando seed de users");
      }

      const overduesCount = (await db.get("SELECT COUNT(*) as cnt FROM overdues")).cnt || 0;
      if (overduesCount === 0) {
        // intentar asignar unit_id a los primeros units existentes
        const rows = await db.all("SELECT id, name FROM units LIMIT 5");
        if (rows && rows.length > 0) {
          const sample = [
            { unit: rows[0], due: "2025-09-01", amount: 20000 },
            { unit: rows[1] || rows[0], due: "2025-08-15", amount: 15000 },
            { unit: rows[2] || rows[0], due: "2025-07-20", amount: 10000 },
          ];
          for (const s of sample) {
            if (s.unit) {
              await db.run(
                "INSERT INTO overdues (unit_id, unit_name, dueDate, originalAmount) VALUES (?, ?, ?, ?)",
                [s.unit.id, s.unit.name, s.due, s.amount]
              );
            }
          }
          console.log("  - Overdues seeded");
        } else {
          console.log("  - No hay units para seed de overdues");
        }
      } else {
        console.log("  - Overdues existen, saltando seed de overdues");
      }

      console.log("✅ Seed finalizado (si se insertó algo).");
    } catch (err) {
      console.error("Error durante el seed de la base:", err);
    }
  } else {
    console.log("SEED_DB !== true -> seed deshabilitado");
  }
}).catch((err) => {
  console.error("Error inicializando la base de datos:", err);
});

// nuevo endpoint ligero para asegurar que marcar pago elimina la mora asociada
app.post("/payments", async (req, res) => {
  try {
    const { unitId, unit_id, amount, date, method, overdueId } = req.body;
    const uidRaw = unitId ?? unit_id ?? null;
    if (!uidRaw || amount == null) {
      return res.status(400).json({ message: "unitId and amount are required" });
    }

    const db = await dbPromise;
    const unitIdNormalized = Number(uidRaw) || null;

    // insertar pago
    const r = await db.run(
      "INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)",
      [unitIdNormalized, amount, date || new Date().toISOString().slice(0,10), method || "manual"]
    );

    const insertedId = r.lastID;
    // si se pasó overdueId, eliminar esa fila de overdues para que no reaparezca
    if (overdueId) {
      try {
        await db.run("DELETE FROM overdues WHERE id = ?", [overdueId]);
      } catch (e) {
        console.warn("No se pudo eliminar overdue:", e?.message || e);
      }
    }

    const saved = await db.get("SELECT * FROM payments WHERE id = ?", [insertedId]);
    return res.json(saved);
  } catch (err) {
    console.error("Error en POST /payments:", err);
    return res.status(500).json({ message: "Error creando pago", error: err?.message || String(err) });
  }
});

// nuevo helper: genera moras para un mes/año en la BD pasada
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

// endpoint para generar moras manualmente por mes/año
app.post("/overdues/generate", async (req, res) => {
  try {
    const month = req.query.month ? String(req.query.month).padStart(2, "0") : null;
    const year = req.query.year ? String(req.query.year) : null;
    if (!month || !year) {
      return res.status(400).json({ message: "month y year son requeridos como query params" });
    }

    const db = await dbPromise;
    const created = await generateOverduesFor(db, month, year);
    return res.json({ generated: created.length, items: created });
  } catch (err) {
    console.error("Error generando moras:", err);
    return res.status(500).json({ message: "Error generando moras", error: err?.message || String(err) });
  }
});

// Registrar rutas (asegurar que esto ocurra independientemente del seed)
app.use("/units", unitsRouter);
app.use("/users", usersRouter);
app.use("/common-expenses", commonExpensesRouter);
app.use("/payments", paymentsRouter);
app.use("/individual-expenses", individualExpensesRouter);
app.use("/overdues", overduesRouter);
app.use("/config/commission", commissionRouter);
app.use("/", settingsRouter);
app.use("/reports", reportsRouter);

// Iniciar servidor
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

// ejecutar generación automática al arrancar y programar ejecución diaria
(async () => {
  try {
    const db = await dbPromise;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());

    const created = await generateOverduesFor(db, month, year);
    if (created.length) {
      console.log(`Auto-generated ${created.length} overdues for ${month}/${year}`);
    } else {
      console.log(`Auto-generate: no new overdues for ${month}/${year}`);
    }
  } catch (e) {
    console.error("Auto-generate failed at startup:", e);
  }

  // programar ejecución cada 24h (puedes cambiar a cron si prefieres otro intervalo)
  const DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const db = await dbPromise;
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear());
      const created = await generateOverduesFor(db, month, year);
      if (created.length) {
        console.log(`Scheduled auto-generated ${created.length} overdues for ${month}/${year}`);
      }
    } catch (err) {
      console.error("Scheduled auto-generate failed:", err);
    }
  }, DAY_MS);
})();

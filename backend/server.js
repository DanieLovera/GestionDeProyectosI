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

// Reemplaza los múltiples dbPromise.then(...) por una inicialización única y el seed opcional
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

  // Seed opcional: solo si SEED_DB === "true"
  const shouldSeed = String(process.env.SEED_DB || "false").toLowerCase() === "true";
  if (shouldSeed) {
    try {
      console.log("⏳ SEED_DB=true -> verificando datos iniciales...");
      // comprobar y seed solo si tablas vacías
      const uCount = (await db.get("SELECT COUNT(*) as cnt FROM units")).cnt || 0;
      if (uCount === 0) {
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 1", 50, "Propietario 1"]);
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 2", 40, "Propietario 2"]);
        await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", ["Depto 3", 30, "Propietario 3"]);
        console.log("  - Units seeded");
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
      if (pCount === 0 && uCount > 0) {
        // obtener primer unit id
        const firstUnit = await db.get("SELECT id FROM units LIMIT 1");
        if (firstUnit) {
          await db.run("INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)", [firstUnit.id, 8000, "2025-10-05", "transferencia"]);
          console.log("  - Payments seeded");
        }
      } else {
        console.log("  - Payments existen o no hay units, saltando seed de payments");
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

      console.log("✅ Seed finalizado (si se insertó algo).");
    } catch (err) {
      console.error("Error durante el seed de la base:", err);
    }
  } else {
    console.log("SEED_DB !== true -> seed deshabilitado");
  }
});

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
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

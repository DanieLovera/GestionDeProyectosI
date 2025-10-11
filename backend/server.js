import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { usersRouter } from "./src/routes/usersRoute.js";
import { unitsRouter } from "./src/routes/unitsRoute.js";
import { commonExpensesRouter } from "./src/routes/commonExpensesRoute.js";
import { paymentsRouter } from "./src/routes/paymentsRoute.js";
import { individualExpensesRouter } from "./src/routes/individualExpensesRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a SQLite
const dbPromise = open({
  filename: "./data/database.db",
  driver: sqlite3.Database
});

dbPromise.then(async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      surface INTEGER,
      owner TEXT
    )
  `);
});

dbPromise.then(async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS common_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      amount REAL,
      date DATE
    )
  `);
});

dbPromise.then(async (db) => {
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
});

dbPromise.then(async (db) => {
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
});

dbPromise.then(async (db) => {
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
});

app.use("/units", unitsRouter);
app.use("/users", usersRouter);
app.use("/common-expenses", commonExpensesRouter);
app.use("/payments", paymentsRouter);
app.use("/individual-expenses", individualExpensesRouter);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

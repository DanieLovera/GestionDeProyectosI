import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { usersRouter } from "./src/routes/usersRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a SQLite
const dbPromise = open({
  filename: "./data/database.db",
  driver: sqlite3.Database
});

// Crear tabla si no existe
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

app.use("/users", usersRouter);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

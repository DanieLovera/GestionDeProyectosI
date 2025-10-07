import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

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
      email TEXT,
      password TEXT
    )
  `);
});

// Rutas básicas
app.get("/users", async (req, res) => {
  const db = await dbPromise;
  const users = await db.all("SELECT * FROM users");
  res.json(users);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const db = await dbPromise;
  const result = await db.run(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );
  res.json({ id: result.lastID, name, email });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));

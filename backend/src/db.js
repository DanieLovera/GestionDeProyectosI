import sqlite3 from "sqlite3";
import { open } from "sqlite";

let dbPromise = open({
  filename: "./data/database.db",
  driver: sqlite3.Database
});

export const getDb = async () => {
  const db = await dbPromise;
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
};
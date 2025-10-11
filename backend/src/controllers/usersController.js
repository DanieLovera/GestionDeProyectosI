import bcrypt from "bcrypt";
import { open } from "sqlite";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";

export const loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const dbPromise = open({
      filename: "./data/database.db",
      driver: sqlite3.Database
    });
    const db = await dbPromise;
    
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      accessToken: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, consortium: user.consortium }
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .json({ message: "Error during login", error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const dbPromise = open({
      filename: "./data/database.db",
      driver: sqlite3.Database
    });
    const db = await dbPromise;
    const users = await db.all("SELECT * FROM users");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, consortium } = req.body;

  if (!name || !email || !password || !role || !consortium) {
    return res.status(400).json({ message: "Complete todos los campos" });
  }
  try {
    const dbPromise = open({
      filename: "./data/database.db",
      driver: sqlite3.Database
    });
    const db = await dbPromise;

    const existingUser = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      "INSERT INTO users (name, email, password, role, consortium) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, consortium]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      email,
      role,
      consortium
    });
  
  } catch (err) {
    console.error("Error inserting user:", err);
    return res
      .status(500)
      .json({ message: "Error inserting user", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const dbPromise = open({
      filename: "./data/database.db",
      driver: sqlite3.Database
    });
    const db = await dbPromise;

    user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.run("DELETE FROM users WHERE id = ?", [userId]);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};
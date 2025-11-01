import e from "express";

export const getUnits = async (req, res) => {
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const units = await db.all("SELECT * FROM units");
    res.status(200).json(units);
  } catch (err) {
    console.error("Error fetching units:", err);
    return res
      .status(500)
      .json({ message: "Error fetching units", error: err.message });
  }
};

export const createUnit = async (req, res) => {
  const { name, surface, owner } = req.body;
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const result = await db.run("INSERT INTO units (name, surface, owner) VALUES (?, ?, ?)", [name, surface, owner]);
    return res.status(200).json({ message: "unidad creada con id " + result.lastID });
  } catch (err) {
    res.status(500).json({ message: "An unexpected error has occurred.", error: err.message });
  }
};

export const updateUnit = async (req, res) => {
  const unitId = req.params.id;
  const { name, surface, owner } = req.body;
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const unit = await db.get("SELECT * FROM units WHERE id = ?", [unitId]);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    await db.run("UPDATE units SET name = ?, surface = ?, owner = ? WHERE id = ?", [name, surface, owner, unitId]);
    return res.status(200).json({ message: "unidad actualizada con id " + unitId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const deleteUnit = async (req, res) => {
  const unitId = req.params.id;
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const unit = await db.get("SELECT * FROM units WHERE id = ?", [unitId]);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    await db.run("DELETE FROM units WHERE id = ?", [unitId]);
    return res.status(200).json({ message: "unidad eliminada con id " + unitId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const getUnit = async (req, res) => {
  const unitId = req.params.id;
  try {
    const db = req.tenantDb;
    if (!db) return res.status(400).json({ message: "Consortium requerido" });
    const unit = await db.get("SELECT * FROM units WHERE id = ?", [unitId]);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    return res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};
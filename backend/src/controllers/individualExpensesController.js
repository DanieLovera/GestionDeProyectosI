import { getDb } from "../db.js";

export const getIndividualExpenses = async (req, res) => {
  const { unitId, from, to } = req.query;
  try {
    const db = await getDb();

    let query = `
      SELECT ie.*, u.name AS unit
      FROM individual_expenses ie
      JOIN units u ON ie.unit_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (unitId) {
      query += " AND ie.unit_id = ?";
      params.push(unitId);
    }
    if (from) {
      query += " AND ie.date >= ?";
      params.push(from);
    }
    if (to) {
      query += " AND ie.date <= ?";
      params.push(to);
    }

    const individualExpenses = await db.all(query, params);

    res.status(200).json(individualExpenses);
  } catch (err) {
    console.error("Error fetching individual expenses:", err);
    return res
      .status(500)
      .json({ message: "Error fetching individual expenses", error: err.message });
  }
};


export const createIndividualExpense = async (req, res) => {
  const { unitId, description, amount, date } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      "INSERT INTO individual_expenses (unit_id, description, amount, date) VALUES (?, ?, ?, ?)",
      [unitId, description, amount, date]
    );

    return res.status(200).json({ message: "Gasto individual creado con id " + result.lastID });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const getIndividualExpense = async (req, res) => {
  const expenseId = req.params.id;
  try {
    const db = await getDb();

    const expense = await db.get("SELECT * FROM individual_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Individual expense not found" });
    }

    res.status(200).json(expense);
  } catch (err) {
    console.error("Error fetching individual expense:", err);
    return res
      .status(500)
      .json({ message: "Error fetching individual expense", error: err.message });
  }
};

export const updateIndividualExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { description, amount, date } = req.body;
  try {
    const db = await getDb();

    const expense = await db.get("SELECT * FROM individual_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Individual expense not found" });
    }
    
    const result = await db.run(
      "UPDATE individual_expenses SET description = ?, amount = ?, date = ? WHERE id = ?",
      [description, amount, date, expenseId]
    );

    return res.status(200).json({ message: "Gasto individual actualizado con id " + expenseId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const deleteIndividualExpense = async (req, res) => {
  const expenseId = req.params.id;
  try {
    const db = await getDb();

    const expense = await db.get("SELECT * FROM individual_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Individual expense not found" });
    }

    await db.run("DELETE FROM individual_expenses WHERE id = ?", [expenseId]);

    return res.status(200).json({ message: "Gasto individual eliminado con id " + expenseId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

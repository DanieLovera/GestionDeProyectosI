import { getDb } from "../db.js";

export const getCommonExpenses = async (req, res) => {
  try {
    const db = req.tenantDb;
    const commonExpenses = await db.all("SELECT * FROM common_expenses");

    res.status(200).json(commonExpenses);
  } catch (err) {
    console.error("Error fetching common expenses:", err);
    return res
      .status(500)
      .json({ message: "Error fetching common expenses", error: err.message });
  }
};

export const createCommonExpense = async (req, res) => {
  const { description, amount, date } = req.body;
  try {
    const db = req.tenantDb;
    const result = await db.run(
      "INSERT INTO common_expenses (description, amount, date) VALUES (?, ?, ?)",
      [description, amount, date]
    );

    return res.status(200).json({ message: "Gasto común creado con id " + result.lastID });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const getCommonExpense = async (req, res) => {
  const expenseId = req.params.id;
  try {
    const db = req.tenantDb;

    const expense = await db.get("SELECT * FROM common_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Common expense not found" });
    }

    res.status(200).json(expense);
  } catch (err) {
    console.error("Error fetching common expense:", err);
    return res
      .status(500)
      .json({ message: "Error fetching common expense", error: err.message });
  }
};

export const updateCommonExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { description, amount, date } = req.body;
  try {
    const db = req.tenantDb;

    const expense = await db.get("SELECT * FROM common_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Common expense not found" });
    }
    
    const result = await db.run(
      "UPDATE common_expenses SET description = ?, amount = ?, date = ? WHERE id = ?",
      [description, amount, date, expenseId]
    );

    return res.status(200).json({ message: "Gasto común actualizado con id " + expenseId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const deleteCommonExpense = async (req, res) => {
  const expenseId = req.params.id;
  try {
    const db = req.tenantDb;

    const expense = await db.get("SELECT * FROM common_expenses WHERE id = ?", [expenseId]);

    if (!expense) {
      return res.status(404).json({ message: "Common expense not found" });
    }

    await db.run("DELETE FROM common_expenses WHERE id = ?", [expenseId]);

    return res.status(200).json({ message: "Gasto común eliminado con id " + expenseId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

import { getDb } from "../db.js";

export const getPayments = async (req, res) => {
  const { unitId, from, to, method } = req.query;
  try {
    const db = await getDb();

    let query = "SELECT * FROM payments WHERE 1=1";
    const params = [];

    if (unitId) {
      query += " AND unit_id = ?";
      params.push(unitId);
    }
    if (from) {
      query += " AND date >= ?";
      params.push(from);
    }
    if (to) {
      query += " AND date <= ?";
      params.push(to);
    }
    if (method) {
      query += " AND method = ?";
      params.push(method);
    }

    const payments = await db.all(query, params);

    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    return res
      .status(500)
      .json({ message: "Error fetching payments", error: err.message });
  }
};

export const createPayment = async (req, res) => {
  const { unitId, amount, date, method } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      "INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)",
      [unitId, amount, date, method]
    );

    return res.status(200).json({ message: "Pago creado con id " + result.lastID });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const getPayment = async (req, res) => {
  const paymentId = req.params.id;
  try {
    const db = await getDb();

    const payment = await db.get("SELECT * FROM payments WHERE id = ?", [paymentId]);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    return res
      .status(500)
      .json({ message: "Error fetching payment", error: err.message });
  }
};

export const updatePayment = async (req, res) => {
  const paymentId = req.params.id;
  const { amount, date, method } = req.body;
  try {
    const db = await getDb();

    const payment = await db.get("SELECT * FROM payments WHERE id = ?", [paymentId]);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    const result = await db.run(
      "UPDATE payments SET amount = ?, date = ?, method = ? WHERE id = ?",
      [amount, date, method, paymentId]
    );

    return res.status(200).json({ message: "Pago actualizado con id " + paymentId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};

export const deletePayment = async (req, res) => {
  const paymentId = req.params.id;
  try {
    const db = await getDb();

    const payment = await db.get("SELECT * FROM payments WHERE id = ?", [paymentId]);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await db.run("DELETE FROM payments WHERE id = ?", [paymentId]);

    return res.status(200).json({ message: "Pago eliminado con id " + paymentId });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error has occurred.",
      error: err.message,
    });
  }
};
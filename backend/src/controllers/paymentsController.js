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
  const { unitId, unit_id, amount, date, method, overdueId } = req.body;
  try {
    const db = await getDb();

    // Normalizar unitId (si viene como 'U1' queda null; asumimos ids numéricos en la BDD)
    const uidRaw = unitId ?? unit_id ?? null;
    const unitIdNormalized = Number(uidRaw) || null;

    if (amount == null) {
      return res.status(400).json({ message: "amount is required" });
    }

    const result = await db.run(
      "INSERT INTO payments (unit_id, amount, date, method) VALUES (?, ?, ?, ?)",
      [unitIdNormalized, amount, date || new Date().toISOString().slice(0, 10), method || "manual"]
    );

    // Devolver el registro creado en lugar de un mensaje
    const saved = await db.get("SELECT * FROM payments WHERE id = ?", [result.lastID]);

    // Si se envió overdueId, eliminar la morosidad asociada para que no vuelva a listarse
    if (overdueId) {
      try {
        await db.run("DELETE FROM overdues WHERE id = ?", [overdueId]);
      } catch (e) {
        console.warn("No se pudo eliminar overdue:", e?.message || e);
      }
    }

    return res.status(200).json(saved);
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
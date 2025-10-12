import { getDb } from "../db.js";
import { Parser } from "@json2csv/plainjs"; 

export const getDashboardReport = async (req, res) => {
  const { month, year } = req.query;
  try {
    const db = await getDb();

    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;

    const [{ totalCommon = 0 }] = await db.all(
      "SELECT SUM(amount) AS totalCommon FROM common_expenses WHERE date BETWEEN ? AND ?",
      [start, end]
    );

    const [{ totalCollected = 0 }] = await db.all(
      "SELECT SUM(amount) AS totalCollected FROM payments WHERE date BETWEEN ? AND ?",
      [start, end]
    );

    const [{ totalIndividual = 0 }] = await db.all(
      "SELECT SUM(amount) AS totalIndividual FROM individual_expenses WHERE date BETWEEN ? AND ?",
      [start, end]
    );

    const totalDue = totalCommon + totalIndividual;
    const overdue = Math.max(totalDue - totalCollected, 0);

    const response = {
      period: { month, year },
      totals: {
        commonExpenses: totalCommon,
        collected: totalCollected,
        overdue,
        lateFees: 0 
      }
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error generating dashboard report:", err);
    res.status(500).json({ message: "Error generating dashboard report", error: err.message });
  }
};

export const getByUnitReport = async (req, res) => {
  const { month, year } = req.query;
  try {
    const db = await getDb();
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;

    const units = await db.all("SELECT * FROM units");

    const commonTotal = await db.get(
      "SELECT SUM(amount) as total FROM common_expenses WHERE date BETWEEN ? AND ?",
      [start, end]
    );

    const totalSurface = units.reduce((acc, u) => acc + u.surface, 0);

    const unitsReport = [];

    for (const u of units) {
      const participationPct = totalSurface ? (u.surface / totalSurface) * 100 : 0;

      const commonShare = ((commonTotal.total || 0) * u.surface) / totalSurface;

      const [{ paid = 0 }] = await db.all(
        "SELECT SUM(amount) as paid FROM payments WHERE unit_id = ? AND date BETWEEN ? AND ?",
        [u.id, start, end]
      );

      const [{ indAmount = 0 }] = await db.all(
        "SELECT SUM(amount) as indAmount FROM individual_expenses WHERE unit_id = ? AND date BETWEEN ? AND ?",
        [u.id, start, end]
      );

      const amount = commonShare + indAmount;
      const pending = Math.max(amount - paid, 0);
      const lateFee = pending > 0 ? pending * 0.05 : 0; // 5% recargo

      unitsReport.push({
        id: u.id,
        name: u.name,
        surface: u.surface,
        participationPct: participationPct ? participationPct.toFixed(2) : "0.00",
        amount: amount ? amount.toFixed(2) : "0.00",
        paid: paid ? paid.toFixed(2) : "0.00",
        pending: pending ? pending.toFixed(2) : "0.00",
        lateFee: lateFee ? lateFee.toFixed(2) : "0.00"
      });
    }

    res.status(200).json({
      period: { month, year },
      units: unitsReport
    });
  } catch (err) {
    console.error("Error generating by-unit report:", err);
    res.status(500).json({ message: "Error generating by-unit report", error: err.message });
  }
};

export const getByCategoryReport = async (req, res) => {
  const { month, year } = req.query;
  try {
    const db = await getDb();
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;

    const categories = await db.all(
      `SELECT description AS name, SUM(amount) as amount 
       FROM common_expenses 
       WHERE date BETWEEN ? AND ?
       GROUP BY description`,
      [start, end]
    );

    res.status(200).json({ period: { month, year }, categories });
  } catch (err) {
    console.error("Error generating by-category report:", err);
    res.status(500).json({ message: "Error generating by-category report", error: err.message });
  }
};

export const getUnitMovementsReport = async (req, res) => {
  const { unitId, month, year } = req.query;
  try {
    const db = await getDb();
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;

    const unit = await db.get("SELECT id, name FROM units WHERE id = ?", [unitId]);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const payments = await db.all(
      "SELECT date, 'payment' as type, method as description, amount FROM payments WHERE unit_id = ? AND date BETWEEN ? AND ?",
      [unitId, start, end]
    );

    const expenses = await db.all(
      "SELECT date, 'expense' as type, description, amount FROM individual_expenses WHERE unit_id = ? AND date BETWEEN ? AND ?",
      [unitId, start, end]
    );

    const movements = [...payments, ...expenses].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const balance = payments.reduce((s, p) => s + p.amount, 0) - expenses.reduce((s, e) => s + e.amount, 0);

    res.status(200).json({
      unit,
      period: { month, year },
      movements,
      balance
    });
  } catch (err) {
    console.error("Error generating unit movements report:", err);
    res.status(500).json({ message: "Error generating unit movements report", error: err.message });
  }
};

export const exportReport = async (req, res) => {
  const { type, month, year } = req.query;

  try {
    let data;
    if (type === "by-unit") {
      const fakeReq = { query: { month, year } };
      const fakeRes = { status: () => ({ json: (d) => (data = d.units) }) };
      await getByUnitReport(fakeReq, fakeRes);
    } else if (type === "by-category") {
      const fakeReq = { query: { month, year } };
      const fakeRes = { status: () => ({ json: (d) => (data = d.categories) }) };
      await getByCategoryReport(fakeReq, fakeRes);
    } else {
      const fakeReq = { query: { month, year } };
      const fakeRes = { status: () => ({ json: (d) => (data = d.totals) }) };
      await getDashboardReport(fakeReq, fakeRes);
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report-${month}-${year}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Error exporting report:", err);
    res.status(500).json({ message: "Error exporting report", error: err.message });
  }
};

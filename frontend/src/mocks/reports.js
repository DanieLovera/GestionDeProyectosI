import units from "./units";
import commonExpenses from "./commonExpenses";
import { getCommissionForMonth } from "../services/commission";
import payments from "./payments";

// util simple para agrupar por categoría: asumimos que algunos gastos comunes tendrán 'category' pronto.
// Mientras, distribuimos de forma heurística por texto.
const guessCategory = (desc) => {
  const t = desc.toLowerCase();
  if (t.includes("limpieza") || t.includes("aseo")) return "Limpieza";
  if (t.includes("seguridad") || t.includes("cámara")) return "Seguridad";
  if (t.includes("pintura") || t.includes("repar")) return "Mantenimiento";
  return "Otros";
};

export const buildDashboardMock = (month) => {
  const mm = month.toString().padStart(2, "0");
  let exp = commonExpenses.filter((e) => e.date.slice(5, 7) === mm);
  const commission = getCommissionForMonth(month);
  if (commission) exp = [...exp, { ...commission }];
  const totalCommon = exp.reduce((s, e) => s + (e.amount || 0), 0);
  const collected = payments.filter((p) => p.date.slice(5, 7) === mm).reduce((s, p) => s + (p.amount || 0), 0);
  const period = { month: parseInt(mm, 10), year: 2025 };
  return {
    period,
    totals: {
      commonExpenses: totalCommon,
      collected,
      overdue: Math.max(0, totalCommon - collected),
      lateFees: 0,
    },
  };
};

export const buildByUnitMock = (month) => {
  const mm = month.toString().padStart(2, "0");
  let exp = commonExpenses.filter((e) => e.date.slice(5, 7) === mm);
  const commission = getCommissionForMonth(month);
  if (commission) exp = [...exp, { ...commission }];
  const totalCommon = exp.reduce((s, e) => s + (e.amount || 0), 0);
  const totalSurface = units.reduce((s, u) => s + (u.surface || 0), 0);
  const pays = payments.filter((p) => p.date.slice(5, 7) === mm);

  const unitsData = units.map((u) => {
    const pct = totalSurface > 0 ? u.surface / totalSurface : 0;
    const amount = Math.round(totalCommon * pct);
    const paid = pays.filter((p) => p.unitId === u.id).reduce((s, p) => s + (p.amount || 0), 0);
    const pending = Math.max(0, amount - paid);
    return {
      id: u.id,
      name: u.name,
      surface: u.surface,
      participationPct: pct,
      amount,
      paid,
      pending,
      lateFee: 0,
    };
  });

  return { period: { month: parseInt(mm, 10), year: 2025 }, units: unitsData };
};

export const buildByCategoryMock = (month) => {
  const mm = month.toString().padStart(2, "0");
  let exp = commonExpenses.filter((e) => e.date.slice(5, 7) === mm);
  const commission = getCommissionForMonth(month);
  if (commission) exp = [...exp, { ...commission, description: "Comisión" }];
  const buckets = {};
  exp.forEach((e) => {
    const cat = e.__isCommission ? "Comisión" : guessCategory(e.description);
    buckets[cat] = (buckets[cat] || 0) + (e.amount || 0);
  });
  const categories = Object.entries(buckets).map(([name, amount]) => ({ name, amount }));
  return { period: { month: parseInt(mm, 10), year: 2025 }, categories };
};

export const buildUnitMovementsMock = (unitId, month) => {
  const mm = month.toString().padStart(2, "0");
  const exp = buildByUnitMock(month);
  const unit = units.find((u) => u.id === unitId) || { id: unitId, name: unitId };
  const data = exp.units.find((u) => u.id === unitId);
  const pays = payments.filter((p) => p.date.slice(5, 7) === mm && p.unitId === unitId);

  const movements = [];
  if (data) {
    movements.push({ date: `2025-${mm}-01`, type: "expense", description: `Expensa ${mm}/2025`, amount: data.amount });
  }
  pays.forEach((p) => movements.push({ date: p.date, type: "payment", description: `Pago ${p.method}`, amount: -p.amount }));

  const balance = movements.reduce((s, m) => s + m.amount, 0);
  return { unit: { id: unit.id, name: unit.name }, period: { month: parseInt(mm, 10), year: 2025 }, movements, balance };
};

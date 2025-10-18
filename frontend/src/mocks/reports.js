import units from "./units";
import commonExpenses from "./commonExpenses";
import { getCommissionForMonth } from "../services/commission";
import payments from "./payments";
import { apiGet } from "../apis/client.js";

// util simple para agrupar por categoría: asumimos que algunos gastos comunes tendrán 'category' pronto.
// Mientras, distribuimos de forma heurística por texto.
const guessCategory = (desc) => {
  const t = desc.toLowerCase();
  if (t.includes("limpieza") || t.includes("aseo")) return "Limpieza";
  if (t.includes("seguridad") || t.includes("cámara")) return "Seguridad";
  if (t.includes("pintura") || t.includes("repar")) return "Mantenimiento";
  return "Otros";
};

// Los builders ahora llaman a los endpoints de reports del backend.
// Se mantienen nombres para compatibilidad con imports existentes.

export const buildDashboardMock = async (month, year = new Date().getFullYear()) => {
  const mm = String(month).padStart(2, "0");
  return await apiGet(`/reports/dashboard?month=${mm}&year=${year}`);
};

export const buildByUnitMock = async (month, year = new Date().getFullYear()) => {
  const mm = String(month).padStart(2, "0");
  return await apiGet(`/reports/by-unit?month=${mm}&year=${year}`);
};

export const buildByCategoryMock = async (month, year = new Date().getFullYear()) => {
  const mm = String(month).padStart(2, "0");
  return await apiGet(`/reports/by-category?month=${mm}&year=${year}`);
};

export const buildUnitMovementsMock = async (unitId, month, year = new Date().getFullYear()) => {
  const mm = String(month).padStart(2, "0");
  return await apiGet(`/reports/unit-movements?unitId=${encodeURIComponent(unitId)}&month=${mm}&year=${year}`);
};

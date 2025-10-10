// Simple commission config service using localStorage

const STORAGE_KEY = "gdpi_commission";

export function getCommissionConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rate: 0, base: 0 };
    const parsed = JSON.parse(raw);
    return {
      rate: Number(parsed.rate) || 0,
      base: Number(parsed.base) || 0,
    };
  } catch (_) {
    return { rate: 0, base: 0 };
  }
}

export function setCommissionConfig({ rate, base }) {
  const payload = {
    rate: Number(rate) || 0,
    base: Number(base) || 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function getCommissionForMonth(month) {
  const { rate, base } = getCommissionConfig();
  if (!rate || !base) return null;
  const mm = month.toString().padStart(2, "0");
  const amount = Math.round(base * rate);
  // We only need month filtering elsewhere; year is not strictly used in filters
  const date = `2025-${mm}-28`;
  return {
    id: `commission-${mm}`,
    description: `Comisión administración ${mm}/2025`,
    amount,
    date,
    __isCommission: true,
  };
}

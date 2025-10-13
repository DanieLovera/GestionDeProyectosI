import * as api from "../apis/commission";

export async function getCommissionConfig() {
  return api.getCommissionConfig();
}

export async function setCommissionConfig(config) {
  return api.updateCommissionConfig(config);
}

export function getCommissionForMonth(month, config) {
  if (!config?.rate || !config?.base) return null;
  const mm = month.toString().padStart(2, "0");
  const amount = Math.round(config.base * config.rate);
  const date = `2025-${mm}-28`;
  return {
    id: `commission-${mm}`,
    description: `Comisión administración ${mm}/2025`,
    amount,
    date,
    __isCommission: true,
  };
}


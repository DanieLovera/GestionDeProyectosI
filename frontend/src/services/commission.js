import * as api from "../apis/commission";

export async function getCommissionConfig() {
  return api.getCommissionConfig();
}

export async function setCommissionConfig(config) {
  return api.updateCommissionConfig(config);
}

export function getCommissionForMonth(month, config) {
  if (!config?.rate || !config?.base) return null;
  
  // Manejar tanto el formato antiguo (número o "MM") como el nuevo ("yyyy-MM")
  let yearMonth;
  if (typeof month === 'string' && month.includes('-')) {
    // Formato "yyyy-MM"
    yearMonth = month;
  } else {
    // Formato antiguo: número o "MM"
    const mm = month.toString().padStart(2, "0");
    const year = new Date().getFullYear();
    yearMonth = `${year}-${mm}`;
  }
  
  const amount = Math.round(config.base * config.rate);
  const date = `${yearMonth}-28`;
  
  return {
    id: `commission-${yearMonth}`,
    description: `Comisión administración ${yearMonth}`,
    amount,
    date,
    __isCommission: true,
  };
}

export async function getCommissions() {
  return api.getCommissions();
}

export async function markCommissionPaid(id) {
  return api.deleteCommission(id);
}


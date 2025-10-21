import { apiGet, apiPut, apiDelete } from "./client";

export const getCommissionConfig = async () => {
  return apiGet("/config/commission");
};

export const updateCommissionConfig = async (config) => {
  return apiPut("/config/commission", config);
};

// new: obtener comisiones (lista desde common_expenses)
export const getCommissions = async () => {
  return apiGet("/commissions");
};

// new: marcar comisión como pagada (elimina el common_expense)
export const deleteCommission = async (id) => {
  return apiDelete(`/commissions/${encodeURIComponent(id)}`);
};


import { apiGet, apiPost } from "./client.js";

export const getPayments = async (query = "") => {
  const q = query ? `?${query}` : "";
  return apiGet(`/payments${q}`);
};

export const addPayment = async (payment) => {
  return apiPost("/payments", payment);
};

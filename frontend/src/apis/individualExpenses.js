import { apiGet, apiPost, apiDelete } from "./client.js";

export const getIndividualExpenses = async (params = "") => {
  const q = params ? `?${params}` : "";
  return await apiGet(`/individual-expenses${q}`);
};

export const addIndividualExpense = async (expense) => {
  return await apiPost("/individual-expenses", expense);
};

export const deleteIndividualExpense = async (id) => {
  return await apiDelete(`/individual-expenses/${id}`);
};

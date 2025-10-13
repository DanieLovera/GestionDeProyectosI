import { apiGet, apiPost } from "./client.js";

export const getIndividualExpenses = async () => {
  return await apiGet("/individual-expenses");
};

export const addIndividualExpense = async (expense) => {
  return await apiPost("/individual-expenses", expense);
};

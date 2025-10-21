import { apiGet, apiPost } from "./client.js";

export const getCommonExpenses = async () => {
  return await apiGet("/common-expenses");
};

export const addCommonExpense = async (expense) => {
  return await apiPost("/common-expenses", expense);
};

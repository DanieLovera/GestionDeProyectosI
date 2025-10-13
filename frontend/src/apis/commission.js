import { apiGet, apiPut } from "./client";

export const getCommissionConfig = async () => {
  return apiGet("/config/commission");
};

export const updateCommissionConfig = async (config) => {
  return apiPut("/config/commission", config);
};


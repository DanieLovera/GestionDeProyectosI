import { apiGet, apiPost, apiPut, apiDelete } from "./client";

export const getUnits = async () => {
  return apiGet("/units");
};

export const addUnit = async (unit) => {
  return apiPost("/units", unit);
};

export const updateUnit = async (id, unit) => {
  return apiPut(`/units/${id}`, unit);
};

export const deleteUnit = async (id) => {
  return apiDelete(`/units/${id}`);
};

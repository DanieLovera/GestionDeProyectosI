import http from "./http";

export const getUnits = async () => {
  const { data } = await http.get("/units");
  return data;
};

export const addUnit = async ({ name, surface, owner }) => {
  const payload = { name, surface: Number(surface) || 0, owner: owner || "" };
  const { data } = await http.post("/units", payload);
  return data;
};

export const updateUnit = async (id, { name, surface, owner }) => {
  const payload = { name, surface: Number(surface) || 0, owner: owner || "" };
  const { data } = await http.put(`/units/${id}`, payload);
  return data;
};

export const deleteUnit = async (id) => {
  const { data } = await http.delete(`/units/${id}`);
  return data;
};

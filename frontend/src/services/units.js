import * as api from "../apis/units";

export const getUnits = async () => {
  return api.getUnits();
};

export const addUnit = async (unit) => {
  return api.addUnit(unit);
};

export const updateUnit = async (id, unit) => {
  return api.updateUnit(id, unit);
};

export const deleteUnit = async (id) => {
  return api.deleteUnit(id);
};

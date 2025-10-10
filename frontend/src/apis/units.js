import units from "../mocks/units";

const mockDataFetch = (data, delay = 500) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

export const getUnits = async () => {
  return mockDataFetch([...units], 400);
};

export const addUnit = async ({ name, surface, owner }) => {
  const id = `U${Date.now()}`;
  const unit = { id, name, surface: Number(surface) || 0, owner: owner || "" };
  units.push(unit);
  return mockDataFetch(unit, 400);
};

export const updateUnit = async (id, { name, surface, owner }) => {
  const idx = units.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("Unidad no encontrada");
  units[idx] = { ...units[idx], name, surface: Number(surface) || 0, owner: owner || "" };
  return mockDataFetch(units[idx], 300);
};

export const deleteUnit = async (id) => {
  const idx = units.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("Unidad no encontrada");
  const [removed] = units.splice(idx, 1);
  return mockDataFetch(removed, 300);
};

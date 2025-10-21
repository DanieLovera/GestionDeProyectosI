import { buildDashboardMock, buildByUnitMock, buildByCategoryMock, buildUnitMovementsMock } from "../mocks/reports";

// Servicios de reportes (mock). Cuando el backend esté listo, estos métodos podrán
// llamar a axios/fetch y devolver shapes equivalentes.

export const getDashboard = async (month) => {
  return buildDashboardMock(month);
};

export const getByUnit = async (month) => {
  return buildByUnitMock(month);
};

export const getByCategory = async (month) => {
  return buildByCategoryMock(month);
};

export const getUnitMovements = async (unitId, month) => {
  return buildUnitMovementsMock(unitId, month);
};

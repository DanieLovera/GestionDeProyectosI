import express from "express";
import {
  getDashboardReport,
  getByUnitReport,
  getByCategoryReport,
  getUnitMovementsReport,
  exportReport
} from "../controllers/reportsController.js";

export const reportsRouter = express.Router();

reportsRouter.get("/dashboard", getDashboardReport);
reportsRouter.get("/by-unit", getByUnitReport);
reportsRouter.get("/by-category", getByCategoryReport);
reportsRouter.get("/unit-movements", getUnitMovementsReport);
reportsRouter.get("/export", exportReport);

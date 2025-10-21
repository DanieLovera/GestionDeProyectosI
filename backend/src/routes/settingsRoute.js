import Router from "express";
import {
  getPaymentMethods,
  getConsortiumSettings,
  getHealthStatus,
} from "../controllers/settingsController.js";
import { verifyToken } from "../middlewares/auth.js";

export const settingsRouter = Router();

settingsRouter.get("/payment-methods", verifyToken, getPaymentMethods);

settingsRouter.get("/settings/consortium", verifyToken, getConsortiumSettings);

settingsRouter.get("/health", getHealthStatus);

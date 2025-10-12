import Router from "express";
import { getCommissionConfig, updateCommissionConfig } from "../controllers/commissionController.js";
import { verifyToken } from "../middlewares/auth.js";

export const commissionRouter = Router();

commissionRouter.get("/config/commission", verifyToken, getCommissionConfig);
commissionRouter.put("/config/commission", verifyToken, updateCommissionConfig);

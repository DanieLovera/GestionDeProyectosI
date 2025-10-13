import Router from "express";
import { getOverdueConfig, updateOverdueConfig } from "../controllers/overduesController.js";
import { verifyToken } from "../middlewares/auth.js";

export const overduesRouter = Router();

overduesRouter.get("/config", verifyToken, getOverdueConfig);
overduesRouter.put("/config", verifyToken, updateOverdueConfig);

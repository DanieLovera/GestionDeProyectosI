import Router from "express";
import { getOverdueConfig, updateOverdueConfig, getOverdues } from "../controllers/overduesController.js";
import { verifyToken } from "../middlewares/auth.js";

export const overduesRouter = Router();

// listar moras (público)
overduesRouter.get("/", getOverdues);

// config: lectura pública (facilita pruebas) y escritura protegida
overduesRouter.get("/config", getOverdueConfig);
overduesRouter.put("/config", verifyToken, updateOverdueConfig);

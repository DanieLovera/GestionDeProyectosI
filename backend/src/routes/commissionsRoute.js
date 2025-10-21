import Router from "express";
import { listCommissions, markCommissionPaid } from "../controllers/commissionsController.js";
import { verifyToken } from "../middlewares/auth.js";

export const commissionsRouter = Router();

// GET /commissions
commissionsRouter.get("/", verifyToken, listCommissions);

// DELETE /commissions/:id  -> marcar como pagada (elimina el registro de common_expenses)
commissionsRouter.delete("/:id", verifyToken, markCommissionPaid);

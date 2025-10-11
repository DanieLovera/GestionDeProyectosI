import Router from "express";
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} from "../controllers/paymentsController.js";
import { verifyToken } from "../middlewares/auth.js";

export const paymentsRouter = Router();

paymentsRouter.get("/", verifyToken, getPayments);
paymentsRouter.get("/:id", verifyToken, getPayment);
paymentsRouter.post("/", verifyToken, createPayment);
paymentsRouter.put("/:id", verifyToken, updatePayment);
paymentsRouter.delete("/:id", verifyToken, deletePayment);
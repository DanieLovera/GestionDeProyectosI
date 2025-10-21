import Router from "express";
import {
  getCommonExpenses,
  createCommonExpense,
	getCommonExpense,
	updateCommonExpense,
	deleteCommonExpense
} from "../controllers/commonExpensesController.js";
import { verifyToken } from "../middlewares/auth.js";

export const commonExpensesRouter = Router();

commonExpensesRouter.get("/", verifyToken, getCommonExpenses);
commonExpensesRouter.get("/:id", verifyToken, getCommonExpense);
commonExpensesRouter.post("/", verifyToken, createCommonExpense);
commonExpensesRouter.put("/:id", verifyToken, updateCommonExpense);
commonExpensesRouter.delete("/:id", verifyToken, deleteCommonExpense);
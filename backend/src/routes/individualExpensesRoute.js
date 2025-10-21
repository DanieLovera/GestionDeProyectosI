import Router from "express";
import {
  getIndividualExpenses,
  createIndividualExpense,
  getIndividualExpense,
  updateIndividualExpense,
  deleteIndividualExpense
} from "../controllers/individualExpensesController.js";
import { verifyToken } from "../middlewares/auth.js";

export const individualExpensesRouter = Router();

individualExpensesRouter.get("/", verifyToken, getIndividualExpenses);
individualExpensesRouter.get("/:id", verifyToken, getIndividualExpense);
individualExpensesRouter.post("/", verifyToken, createIndividualExpense);
individualExpensesRouter.put("/:id", verifyToken, updateIndividualExpense);
individualExpensesRouter.delete("/:id", verifyToken, deleteIndividualExpense);
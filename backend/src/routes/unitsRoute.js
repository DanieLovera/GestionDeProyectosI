import Router from "express";
import {
  deleteUnit,
  getUnits,
  createUnit,
  updateUnit,
	getUnit
} from "../controllers/unitsController.js";
import { verifyToken } from "../middlewares/auth.js";

export const unitsRouter = Router();

unitsRouter.get("/", verifyToken, getUnits);
unitsRouter.get("/:id", verifyToken, getUnit);
unitsRouter.post("/", verifyToken, createUnit);
unitsRouter.put("/:id", verifyToken, updateUnit);
unitsRouter.delete("/:id", verifyToken, deleteUnit);
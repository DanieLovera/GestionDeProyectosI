import Router from "express";
import {
  deleteUser,
  loginUser,
  registerUser,
  getUsers
} from "../controllers/usersController.js";
import { verifyToken } from "../middlewares/auth.js";

export const usersRouter = Router();

usersRouter.get("/", verifyToken, getUsers);
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.delete("/:id", verifyToken, deleteUser);
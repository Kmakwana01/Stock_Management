import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
import {
  addMachine,
  deleteMachine,
  getMachines,
  updateMachine,
} from "../controllers/machineController";

const router = express.Router();

router.post("/addMachine", isAuthenticated, addMachine);
router.get("/getMachines", isAuthenticated, getMachines);
router.patch("/updateMachine", isAuthenticated, updateMachine);
router.delete("/deleteMachine", isAuthenticated, deleteMachine);

export default router;

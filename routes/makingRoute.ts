import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
import {
  createMaking,
  getMaking,
  updateMaking,
  deleteMaking,
  getJobListForMaking
} from "../controllers/makingController";
const router = express.Router();

router.post("/createMaking", isAuthenticated, createMaking);
router.get("/getMaking", isAuthenticated, getMaking);
router.patch("/updateMaking", isAuthenticated, updateMaking);
router.delete("/deleteMaking", isAuthenticated, deleteMaking);
router.get("/getJobListForMaking", isAuthenticated, getJobListForMaking);

export default router;

import { Router } from "express";
import {
  addDTR,
  deleteDTRLogs,
  getDTR,
  getEmployeeDTR,
} from "../controllers/dtr";

const router = Router();

router.get("/", getDTR);
router.get("/employee/:employeeId", getEmployeeDTR);
router.post("/", addDTR);
router.delete("/:dtr_id", deleteDTRLogs);

export default router;

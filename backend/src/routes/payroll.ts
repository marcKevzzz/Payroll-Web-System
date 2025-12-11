import { Router } from "express";
import {
  getDTR,
  saveAllPayroll,
  getPayrollFullByEmployee,
} from "../controllers/payroll";

const router = Router();

router.get("/:dtr_id", getDTR);
router.get("/employee/:employee_id", getPayrollFullByEmployee);
router.post("/bulk", saveAllPayroll);
// router.delete("/:dtr_id", deleteDTRLogs);

export default router;

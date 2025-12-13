import { Router } from "express";
import {
  saveAllPayroll,
  getPayrollFullByEmployee,
} from "../controllers/payroll";

const router = Router();
router.get("/employee/:employee_id", getPayrollFullByEmployee);

router.post("/bulk", saveAllPayroll);

export default router;

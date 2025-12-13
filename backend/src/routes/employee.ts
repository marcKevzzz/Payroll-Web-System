import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  terminateEmployee,
} from "../controllers/employee.controller";

const router = Router();

router.get("/", getEmployees);
router.get("/employee/:employee_id", getEmployee);
router.post("/", createEmployee);
router.put("/terminate/:employee_id", terminateEmployee);
router.put("/:employee_id", updateEmployee);

export default router;

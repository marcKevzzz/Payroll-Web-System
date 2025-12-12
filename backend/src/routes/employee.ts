import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";

const router = Router();

router.get("/", getEmployees);
router.get("/employee/:employee_id", getEmployee);
router.post("/", createEmployee);
router.put("/:employee_id", updateEmployee);
router.delete("/:employee_id", deleteEmployee);

export default router;

import { Router } from "express";
import {
  addDTR,
  deleteDTRLogs,
  getDTR,
  getEmployeeDTR,
} from "../controllers/dtr";

const router = Router(); // Create a new Express router instance.

router.get("/", getDTR); // GET /api/dtr  => Get all DTRs (or paginated list)
router.get("/employee/:employee_id", getEmployeeDTR); // GET /api/dtr/employee/EMP001 => Get DTRs for a specific employee
router.post("/", addDTR); // POST /api/dtr => Add a new DTR entry (e.g., time-in)
router.delete("/:dtr_id", deleteDTRLogs); // DELETE /api/dtr/123 => Delete a specific DTR log

export default router;

import { Router } from "express";
import {
  getAllLeaveRequests,
  getLeaveRequestsByEmployee,
  createLeaveRequest,
  updateLeaveRequestStatus,
} from "../controllers/leaveRequests";

const router = Router(); // Create a new Express router instance.

router.get("/requests", getAllLeaveRequests);
router.get("/requests/:employee_id", getLeaveRequestsByEmployee);
router.post("/requests", createLeaveRequest);
router.patch("/requests/:request_id/status", updateLeaveRequestStatus);

export default router;

import { Request, Response } from "express";
import pool from "../config/db";
import { LeaveRequest } from "../utils/types";

const ALLOWED_LEAVE_TYPE_IDS = [1, 2, 3];

export const getAllLeaveTypes = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM LeaveType");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLeaveRequests = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT lr.*, lt.type_name 
       FROM LeaveRequest lr
       JOIN LeaveType lt ON lr.leave_type_id = lt.type_id`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getLeaveRequestsByEmployee = async (
  req: Request,
  res: Response
) => {
  const { employee_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT lr.*, lt.type_name
       FROM LeaveRequest lr
       JOIN LeaveType lt ON lr.leave_type_id = lt.type_id WHERE lr.employee_id = ?`,
      [employee_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  const {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
  } = req.body as LeaveRequest;

  // Validate required fields
  if (
    !employee_id ||
    !leave_type_id ||
    !start_date ||
    !end_date ||
    !total_days
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate leave type
  if (!ALLOWED_LEAVE_TYPE_IDS.includes(leave_type_id)) {
    return res.status(400).json({ error: "Invalid leave_type_id" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO LeaveRequest 
       (employee_id, leave_type_id, start_date, end_date, total_days, reason) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason || null,
      ]
    );
    res.status(201).json({ request_id: (result as any).insertId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLeaveRequestStatus = async (req: Request, res: Response) => {
  const { request_id } = req.params;
  const { status, approver_id, rejection_reason } =
    req.body as Partial<LeaveRequest>;

  if (!status) return res.status(400).json({ error: "status is required" });

  try {
    const [result] = await pool.query(
      `UPDATE LeaveRequest 
       SET status = ?, approver_id = ?, 
           approval_date = IF(? = 'Approved', CURRENT_TIMESTAMP, NULL),
           rejection_reason = ?
       WHERE request_id = ?`,
      [
        status,
        approver_id || null,
        status,
        rejection_reason || null,
        request_id,
      ]
    );

    if ((result as any).affectedRows === 0)
      return res.status(404).json({ message: "LeaveRequest not found" });

    res.json({ message: "LeaveRequest updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";

export const getDTR = async (_: Request, res: Response) => {
  const [rows]: any = await pool.query(
    "SELECT d.employee_id, d.dtr_id, d.work_date, d.time_in, d.time_out, d.status FROM dtr d"
  );
  res.json(rows);
};

export const getEmployeeDTR = async (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const [rows]: any = await pool.query(
    "SELECT d.employee_id, d.dtr_id, d.work_date, d.time_in, d.time_out, d.status FROM dtr d WHERE d.employee_id = ?",
    [employee_id]
  );
  res.json(rows);
};

export const addDTR = async (req: Request, res: Response) => {
  const dtr = req.body;

  // Insert into employees
  await pool.query(
    `INSERT INTO dtr 
      (employee_id, work_date, time_in, time_out, status)
     VALUES (?, ?, ?, ?, ?)`,
    [dtr.employee_id, dtr.work_date, dtr.time_in, dtr.time_out, dtr.status]
  );

  res.json({ message: "DTR added" });
};

export const deleteDTRLogs = async (req: Request, res: Response) => {
  const { dtr_id } = req.params;

  await pool.query("DELETE FROM dtr WHERE dtr_id = ?", [dtr_id]);

  res.json({ message: "DTR Logs deleted" });
};

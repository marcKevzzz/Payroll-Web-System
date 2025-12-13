import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

export const login = async (req: Request, res: Response) => {
  const { employee_id, password } = req.body; // matches frontend

  if (!employee_id || !password)
    return res
      .status(400)
      .json({ message: "Employee ID and password required" });

  try {
    const [rows]: any = await pool.query(
      "SELECT employee_id, password_hash, role, created_at, must_change_password, status FROM users WHERE employee_id = ?",
      [employee_id]
    );

    if (!rows.length)
      return res
        .status(400)
        .json({ message: "Invalid employee ID or password" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid)
      return res
        .status(400)
        .json({ message: "Invalid employee ID or password" });

    await pool.query(`UPDATE users SET last_login = ? WHERE employee_id = ?`, [
      new Date(),
      user.employee_id,
    ]);

    const token = jwt.sign(
      { employee_id: user.employee_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      employee_id: user.employee_id,
      role: user.role,
      mustChangePassword: user.must_change_password === 1,
      created_at: user.created_at,
      status: user.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const employee_id = req.user?.employee_id;

  if (!employee_id) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows]: any = await pool.query(
      `SELECT password_hash FROM users WHERE employee_id = ?`,
      [employee_id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Employee not found" });

    const user = rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!valid)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password_hash = ? WHERE employee_id = ?`,
      [hashed, employee_id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

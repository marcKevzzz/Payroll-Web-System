import express from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password)
    return res
      .status(400)
      .json({ message: "Employee ID and password required" });

  try {
    const [rows]: any = await pool.query(
      "SELECT employee_id, password FROM employees WHERE employee_id = ?",
      [String(employeeId)] // ← convert to INT
    );

    if (!rows.length)
      return res
        .status(400)
        .json({ message: "Invalid employee ID or password" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(400)
        .json({ message: "Invalid employee ID or password" });

    // employee_id stored as INT inside JWT
    const token = jwt.sign(
      { employee_id: user.employee_id },
      process.env.JWT_SECRET as string, // MUST be cast as string
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, employee_id: String(user.employee_id) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Change password endpoint
router.put("/change-password", verifyToken, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const employeeId = req.user?.employee_id; // now an INT

  if (!employeeId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows]: any = await pool.query(
      "SELECT password FROM employees WHERE employee_id = ?",
      [String(employeeId)]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Employee not found" });

    const user = rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE employees SET password = ? WHERE employee_id = ?",
      [hashed, String(employeeId)]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;

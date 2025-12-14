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
export const getAllUser = async (req: Request, res: Response) => {
    try {
        // NOTE: Ideally, you should only select necessary non-sensitive fields.
        const [rows]: any = await pool.query(
            `SELECT 
                employee_id, 
                role, 
                status, 
                last_login, 
                created_at, 
                must_change_password 
             FROM users`
        );
        
        // Convert the 'must_change_password' integer to a boolean for the API response
        const users = rows.map((user: any) => ({
            ...user,
            must_change_password: user.must_change_password === 1,
        }));

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error retrieving users" });
    }
};
export const forgotPassword = async (req: Request, res: Response) => {
  const { employee_id } = req.body;
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour


    try {
        // 1. Check if the user exists first (optional, but cleaner)
        const [userRows]: any = await pool.query(
            `SELECT employee_id, email FROM users WHERE employee_id = ?`,
            [employee_id]
        );

        if (userRows.length === 0) {
            // FIX: Always return a 200 success, even if the user is not found, to prevent ID enumeration.
            return res.json({ message: "Password reset link sent to registered email/device." });
        }

        const user = userRows[0];
        
        // 2. Update the token fields ONLY if the user exists
        await pool.query(
            `UPDATE users 
             SET password_reset_token = ?, password_reset_expires = ? 
             WHERE employee_id = ?`,
            [resetToken, expires, employee_id]
        );

        // 3. Send email here (conceptual)
        // await sendPasswordResetEmail(user.email, resetToken);
        
        console.log(`[PASSWORD RESET] Token for ${employee_id}: ${resetToken}`);
        
        // 4. Respond success
        res.json({ message: "Password reset link sent to registered email/device." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- New Controller: resetPassword (in authContoller.ts) ---

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        // 1. Find user by token and check expiration
        const [rows]: any = await pool.query(
            `SELECT employee_id FROM users 
             WHERE password_reset_token = ? AND password_reset_expires > NOW()`,
            [token]
        );

        if (!rows.length) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        const employee_id = rows[0].employee_id;
        const hashed = await bcrypt.hash(newPassword, 10);

        // 2. Update password, clear the token fields, and ensure must_change_password is 0
        await pool.query(
            `UPDATE users SET 
             password_hash = ?, 
             password_reset_token = NULL, 
             password_reset_expires = NULL,
             must_change_password = 0  
             WHERE employee_id = ?`,
            [hashed, employee_id]
        );

        res.json({ message: "Password reset successfully. You may now log in." });

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

    // CRITICAL FIX: Add must_change_password = 0 to the update query
    await pool.query(
      `UPDATE users SET password_hash = ?, must_change_password = 0 WHERE employee_id = ?`,
      [hashed, employee_id] // MUST SET must_change_password to 0 here!
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

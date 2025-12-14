// controllers/employee.controller.ts
import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
// Email import removed: import { sendAccountDetailsEmail } from "../utils/sendAccountDetailsEmail";

// --- CRUD CONTROLLERS (GET) ---

// GET ALL EMPLOYEES
export const getEmployees = async (_: Request, res: Response) => {
  const [rows]: any = await pool.query(
    "SELECT e.employee_id, e.first_name, e.middle_name, e.last_name, e.email, e.phone, e.department, e.position, e.status, e.created_at, r.hourly_rate, l.loan_amount FROM employees e JOIN employee_rates r ON e.employee_id = r.employee_id LEFT JOIN loans l ON e.employee_id = l.employee_id WHERE e.status = 'active'"
  );
  res.json(rows);
};

export const getEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const [rows]: any = await pool.query(
    "SELECT e.employee_id, e.first_name, e.middle_name, e.last_name, e.email, e.phone, e.department, e.position, e.created_at, r.hourly_rate, l.loan_amount FROM employees e JOIN employee_rates r ON e.employee_id = r.employee_id LEFT JOIN loans l ON e.employee_id = l.employee_id WHERE e.employee_id = ? AND e.status='active'",
    [employee_id]
  );
  res.json(rows);
};

// --- HELPER FUNCTIONS ---

// GENERATE NEXT EMPLOYEE ID (YY-XXXX)
export const generateNextEmployeeId = (latestId: string | null) => {
  const year = new Date().getFullYear().toString().slice(2); // "25"

  if (!latestId) return `${year}-0001`;

  const lastNumber = parseInt(latestId.split("-")[1], 10);
  const next = lastNumber + 1;

  return `${year}-${next.toString().padStart(4, "0")}`;
};

const determineRole = (position: string): string => {
  const adminPositions = ["CEO", "COO", "CTO", "Executive Assistant"];
  const hrPositions = ["HR Manager", "HR Officer"];
  const financePositions = ["Finance Manager", "Accountant", "Bookkeeper"];

  if (adminPositions.includes(position)) return "admin";
  if (hrPositions.includes(position)) return "hr";
  if (financePositions.includes(position)) return "finance";

  return "employee";
};

function generatePaddedFourDigitNumber() {
    // Generates a number between 0 and 9999.
    let randomNum = Math.floor(Math.random() * 10000);
    
    // Convert to string and pad the start with '0' if it's less than 4 digits.
    return randomNum.toString().padStart(4, '0');
}

const generateHashedPassword = async (
    employee_id: string,
    last_name: string
): Promise<{ plain: string; hash: string }> => {
    // 1. Generate the random 4-digit component
    const num = generatePaddedFourDigitNumber();
    
    // Example: 25-0001doe2749
    const basePassword = `${employee_id}${last_name.trim().toLowerCase().replace(/\s/g, "")}${num}`;
    
    const hashedPassword = await bcrypt.hash(basePassword, 10);

    return {
        plain: basePassword,
        hash: hashedPassword,
    };
};

// --- CREATE EMPLOYEE ---

export const createEmployee = async (req: Request, res: Response) => {
  const emp = req.body;
  const { first_name, middle_name, last_name, email, phone, department, position, hourly_rate, loan_amount } = emp;

  // REMOVED: if (!email) check, as email is no longer critical for notification but might be for database/contact.
  // Assuming email is still required for the employee record itself.

  try {
    // 1. Generate Next Employee ID
    const [latestIdRow]: any = await pool.query(
      `SELECT employee_id FROM employees 
       WHERE employee_id LIKE CONCAT(RIGHT(YEAR(CURDATE()), 2), '-%') 
       ORDER BY employee_id DESC LIMIT 1`
    );
    const latestId = latestIdRow.length ? latestIdRow[0].employee_id : null;
    const newId = generateNextEmployeeId(latestId);

    // 2. Insert into employees
    await pool.query(
      `INSERT INTO employees 
       (employee_id, first_name, middle_name, last_name, email, phone, department, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, first_name, middle_name, last_name, email, phone, department, position]
    );
    
    // 3. Create User Account and TEMPORARY Password
    const { plain, hash } = await generateHashedPassword(newId, last_name); // Still calculate 'plain' for logging/manual sharing
    const role = determineRole(position);
    
console.log(plain)

    await pool.query(
      `INSERT INTO users (employee_id, password_hash, role, must_change_password)
       VALUES (?, ?, ?, 1)`,
      [newId, hash, role]
    );
    
    // 4. Insert Hourly Rate
    await pool.query(
      `INSERT INTO employee_rates (employee_id, hourly_rate) VALUES (?, ?)`,
      [newId, hourly_rate]
    );

    // 5. Insert Loan (if applicable)
    if (loan_amount) {
      await pool.query(
        `INSERT INTO loans (employee_id, loan_amount, status) VALUES (?, ?, 'active')`,
        [newId, loan_amount]
      );
    }

    // REMOVED: Email sending block (Step 6)

    // IMPORTANT: Log the temporary password so HR/Admin can share it manually
    console.log(`[New Employee] ID: ${newId}, Temporary Password: ${plain}`);

    res.json({ 
      // UPDATED MESSAGE
      message: "Employee added successfully. Temporary password logged on server.", 
      employee_id: newId,
      temp_password: plain // Optionally return the password in the response if secure logging is not feasible
    });
    
  } catch (error) {
    console.error("Error creating employee:", error);
    // UPDATED ERROR MESSAGE
    res.status(500).json({ message: "Server error during employee creation.", error: error });
  }
};


// --- UPDATE/DELETE CONTROLLERS ---

// UPDATE EMPLOYEE
export const updateEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const emp = req.body;

  await pool.query(
    `UPDATE employees SET
      first_name=?, middle_name=?, last_name=?, email=?, phone=?,
      department=?, position=?
     WHERE employee_id=?`,
    [
      emp.first_name,
      emp.middle_name,
      emp.last_name,
      emp.email,
      emp.phone,
      emp.department,
      emp.position,
      employee_id,
    ]
  );
  await pool.query(
    `UPDATE employee_rates SET hourly_rate=?
     WHERE employee_id=?`,
    [emp.hourly_rate, employee_id]
  );

  emp.loan_amount !== null &&
    emp.loan_amount !== undefined &&
    (await pool.query(
      `REPLACE INTO loans (employee_id, loan_amount, status)
       VALUES (?, ?, 'active')`,
      [employee_id, emp.loan_amount]
    ));

  res.json({ message: "Employee updated" });
};

export const terminateEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const emp = req.body;

  await pool.query(
    `UPDATE employees SET
     status=?
     WHERE employee_id=?`,
    ["terminate", employee_id]
  );
  await pool.query(
    `UPDATE users SET
     status=?
     WHERE employee_id=?`,
    ["terminate", employee_id]
  );

  res.json({ message: "Employee updated" });
};

// DELETE EMPLOYEE
export const deleteEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;

  await pool.query("DELETE FROM employees WHERE employee_id = ?", [
    employee_id,
  ]);

  res.json({ message: "Employee deleted" });
};
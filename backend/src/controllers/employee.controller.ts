// controllers/employee.controller.ts
import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import { promises } from "dns";

// GET ALL EMPLOYEES
export const getEmployees = async (_: Request, res: Response) => {
  const [rows]: any = await pool.query(
    "SELECT e.employee_id, e.first_name, e.middle_name, e.last_name, e.email, e.phone, e.department, e.position, e.created_at, r.hourly_rate, l.loan_amount FROM employees e JOIN employee_rates r ON e.employee_id = r.employee_id LEFT JOIN loans l ON e.employee_id = l.employee_id"
  );
  res.json(rows);
};
export const getEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;
  const [rows]: any = await pool.query(
    "SELECT e.employee_id, e.first_name, e.middle_name, e.last_name, e.email, e.phone, e.department, e.position, e.created_at, r.hourly_rate, l.loan_amount FROM employees e JOIN employee_rates r ON e.employee_id = r.employee_id LEFT JOIN loans l ON e.employee_id = l.employee_id WHERE = e.employee_id = ?",
    [employee_id]
  );
  res.json(rows);
};

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

const generateHashedPassword = async (employee_id: string, last_name: string): Promise<string> => {
    return await bcrypt.hash(
    `${employee_id}.${last_name.trim().replace(" ", "")}
    }`,
    10
  );
}


// CREATE EMPLOYEE
export const createEmployee = async (req: Request, res: Response) => {
  const emp = req.body;

  const [rows]: any = await pool.query(
    `SELECT employee_id
     FROM employees
     WHERE employee_id LIKE CONCAT(RIGHT(YEAR(CURDATE()), 2), '-%')
     ORDER BY employee_id DESC
     LIMIT 1`
  );

  const latestId = rows.length ? rows[0].employee_id : null;
  const newId = generateNextEmployeeId(latestId);

  // Insert into employees
  await pool.query(
    `INSERT INTO employees 
      (employee_id, first_name, middle_name, last_name, email, phone, department, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newId,
      emp.first_name,
      emp.middle_name,
      emp.last_name,
      emp.email,
      emp.phone,
      emp.department,
      emp.position,
    ]
  );
    const hashedPassword = await generateHashedPassword(newId, emp.last_name)
    const role = determineRole(emp.position);

    await pool.query(
    `INSERT INTO users (employee_id, password_hash, role)
     VALUES (?, ?, ?)`,
    [newId, hashedPassword, role]
  );

  // Insert hourly rate
  await pool.query(
    `INSERT INTO employee_rates (employee_id, hourly_rate)
     VALUES (?, ?)`,
    [newId, emp.hourly_rate]
  );

  emp.loan_amount &&
    (await pool.query(
      `INSERT INTO loans (employee_id, loan_amount, status)
       VALUES (?, ?, 'active')`,
      [newId, emp.loan_amount]
    ));

  res.json({ message: "Employee added", employee_id: newId });
};

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

// DELETE EMPLOYEE
export const deleteEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;

  await pool.query("DELETE FROM employees WHERE employee_id = ?", [
    employee_id,
  ]);

  res.json({ message: "Employee deleted" });
};

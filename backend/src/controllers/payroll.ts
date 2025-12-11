import { Request, Response } from "express";
import pool from "../config/db";

// -------------------------
// Types
// -------------------------
interface PayrollDTO {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  net_pay: number;
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  birTax: number;
  loanDeduction: number;
  holidayBreakdowns?: HolidayBreakdownDTO[];
}

interface HolidayBreakdownDTO {
  date: string;
  name: string;
  type: string;
  hours: number;
  pay: number;
}

// -------------------------
// Utility functions
// -------------------------
async function insertPayroll(conn: any, payroll: PayrollDTO) {
  const [result] = await conn.query(
    `INSERT INTO payroll
      (employee_id, pay_period_start, pay_period_end, regular_hours, overtime_hours, gross_pay, net_pay)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      payroll.employee_id,
      payroll.pay_period_start,
      payroll.pay_period_end,
      payroll.regular_hours,
      payroll.overtime_hours,
      payroll.gross_pay,
      payroll.net_pay,
    ]
  );

  return (result as any).insertId;
}

async function insertDeductions(
  conn: any,
  payrollId: number,
  payroll: PayrollDTO
) {
  const deductions = [
    { type: "SSS", amount: payroll.sssDeduction },
    { type: "PhilHealth", amount: payroll.philHealthDeduction },
    { type: "PagIbig", amount: payroll.pagIbigDeduction },
    { type: "BIR", amount: payroll.birTax },
    { type: "Loan", amount: payroll.loanDeduction },
  ];

  for (const d of deductions) {
    await conn.query(
      `INSERT INTO payroll_deductions (payroll_id, deduction_type, deduction_amount)
       VALUES (?, ?, ?)`,
      [payrollId, d.type, d.amount]
    );
  }
}

async function insertHolidayBreakdowns(
  conn: any,
  payrollId: number,
  breakdowns?: HolidayBreakdownDTO[]
) {
  if (!breakdowns) return;

  for (const h of breakdowns) {
    // Step 1: Insert holiday into global table if it doesn't exist
    const [existing] = await conn.query(
      `SELECT holiday_id FROM holidays WHERE holiday_date = ?`,
      [h.date]
    );

    let holidayId: number;
    if (existing.length > 0) {
      // Holiday already exists
      holidayId = existing[0].holiday_id;
    } else {
      // Insert new holiday
      const [result] = await conn.query(
        `INSERT INTO holidays (holiday_date, holiday_name, holiday_type) VALUES (?, ?, ?)`,
        [h.date, h.name, h.type]
      );
      holidayId = result.insertId;
    }

    // Step 2: Insert into employee_holiday_pay table
    await conn.query(
      `INSERT INTO employee_holiday_pay
        (payroll_id, holiday_id, holiday_hours, holiday_pay)
       VALUES (?, ?, ?, ?)`,
      [payrollId, holidayId, h.hours, h.pay]
    );
  }
}

// -------------------------
// Controller: Fetch DTR
// -------------------------
export const getAllDTR = async (req: Request, res: Response) => {
  const [rows]: any = await pool.query(
    `SELECT employee_id, dtr_id, work_date, time_in, time_out, status FROM dtr`
  );
  res.json(rows);
};

export const getDTR = async (req: Request, res: Response) => {
  const { payroll_id } = req.params;

  // 1. Basic payroll + employee info
  const [payroll]: any = await pool.query(
    `SELECT 
        p.payroll_id,
        LPAD(p.payroll_id, 5, '0') AS formatted_id,
        p.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        p.pay_period_start,
        p.pay_period_end,
        p.regular_hours,
        p.overtime_hours,
        p.gross_pay,
        p.net_pay
     FROM payroll p
     JOIN employees e ON p.employee_id = e.employee_id
     WHERE p.payroll_id = ?`,
    [payroll_id]
  );

  if (payroll.length === 0) {
    return res.status(404).json({ message: "Payslip not found" });
  }

  // 2. Deductions
  const [deductions]: any = await pool.query(
    `SELECT deduction_type, deduction_amount 
     FROM payroll_deductions 
     WHERE payroll_id = ?`,
    [payroll_id]
  );

  // 3. Holiday breakdowns
  const [holidays]: any = await pool.query(
    `SELECT holiday_date, holiday_name, holiday_type, holiday_hours, holiday_pay
     FROM holidays
     WHERE payroll_id = ?`,
    [payroll_id]
  );

  res.json({
    ...payroll[0],
    deductions,
    holidays,
  });
};

export const getPayrollFullByEmployee = async (req: Request, res: Response) => {
  const { employee_id } = req.params;

  try {
    // 1️⃣ Fetch all payrolls for the employee
    const [payrolls]: any = await pool.query(
      `SELECT 
        p.payroll_id,
        LPAD(p.payroll_id, 5, '0') AS formatted_id,
        p.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        p.pay_period_start,
        p.pay_period_end,
        p.regular_hours,
        p.overtime_hours,
        p.gross_pay,
        p.net_pay
      FROM payroll p
      JOIN employees e ON p.employee_id = e.employee_id
      WHERE p.employee_id = ?`,
      [employee_id]
    );

    if (!payrolls.length) return res.json([]);

    const payrollIds = payrolls.map((p: any) => p.payroll_id);

    // 2️⃣ Fetch all deductions for these payrolls
    const [deductions]: any = await pool.query(
      `SELECT payroll_id, deduction_type, deduction_amount 
       FROM payroll_deductions 
       WHERE payroll_id IN (?)`,
      [payrollIds]
    );

    // 3️⃣ Fetch all holidays for these payrolls
    const [holidays]: any = await pool.query(
      `SELECT 
         eh.payroll_id, h.holiday_date, h.holiday_name, h.holiday_type, 
         eh.holiday_hours, eh.holiday_pay
       FROM employee_holiday_pay eh
       JOIN holidays h ON eh.holiday_id = h.holiday_id
       WHERE eh.payroll_id IN (?)`,
      [payrollIds]
    );

    // 4️⃣ Attach deductions and holidays to each payroll
    const payrollMap = payrolls.map((payroll: any) => {
      return {
        ...payroll,
        deductions: deductions.filter(
          (d: any) => d.payroll_id === payroll.payroll_id
        ),
        holidays: holidays.filter(
          (h: any) => h.payroll_id === payroll.payroll_id
        ),
      };
    });

    res.json(payrollMap);
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({ error: "Failed to fetch payrolls " + error });
  }
};

// -------------------------
// Controller: Save All Payroll
// -------------------------
export const saveAllPayroll = async (req: Request, res: Response) => {
  const payrolls: PayrollDTO[] = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    for (const payroll of payrolls) {
      const payrollId = await insertPayroll(conn, payroll);
      await insertDeductions(conn, payrollId, payroll);
      await insertHolidayBreakdowns(conn, payrollId, payroll.holidayBreakdowns);
    }

    await conn.commit();
    res.json({ message: "Payroll saved successfully" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to save payroll" + err });
  } finally {
    conn.release();
  }
};

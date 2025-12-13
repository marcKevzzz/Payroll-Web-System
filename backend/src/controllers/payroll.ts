import { Request, Response } from "express";

import pool from "../config/db";

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

async function upsertPayroll(conn: any, payroll: PayrollDTO): Promise<number> {
  // Step 1: Check for existing payroll
  const [existing]: any = await conn.query(
    `SELECT payroll_id FROM payroll WHERE employee_id = ? AND pay_period_start = ?`,
    [payroll.employee_id, payroll.pay_period_start]
  );

  let payrollId: number;

  if (existing.length > 0) {
    // --- UPDATE Existing Payroll ---
    payrollId = existing[0].payroll_id;

    await conn.query(
      `UPDATE payroll SET
                pay_period_end = ?, 
                regular_hours = ?, 
                overtime_hours = ?, 
                gross_pay = ?, 
                net_pay = ?
             WHERE payroll_id = ?`,
      [
        payroll.pay_period_end,
        payroll.regular_hours,
        payroll.overtime_hours,
        payroll.gross_pay,
        payroll.net_pay,
        payrollId,
      ]
    );
  } else {
    // --- INSERT New Payroll ---
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

    payrollId = (result as any).insertId;
  }

  return payrollId;
}

/**
 * Deletes all associated deductions and holiday pay entries for a given payroll_id.
 * This ensures old data is wiped before inserting new, recalculated data.
 */
async function deleteExistingChildRecords(conn: any, payrollId: number) {
  // 1. Delete all associated deductions
  await conn.query(`DELETE FROM payroll_deductions WHERE payroll_id = ?`, [
    payrollId,
  ]);

  // 2. Delete all associated holiday pay entries
  await conn.query(`DELETE FROM employee_holiday_pay WHERE payroll_id = ?`, [
    payrollId,
  ]);
}

// (The insertDeductions and insertHolidayBreakdowns functions remain the same
//  as they are only concerned with inserting NEW records.)

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
    // If holiday name is missing or hours/pay are zero, skip insertion for safety
    if (!h.name && h.hours === 0 && h.pay === 0) {
      continue;
    }

    // Use 'Unknown Holiday' if h.name is null, and convert date to YYYY-MM-DD string
    const holidayDate = h.date.split("T")[0];
    const holidayName = h.name || "Unidentified Holiday";
    // UPSERT into holidays table (as previously fixed)
    await conn.query(
      `
      INSERT INTO holidays (holiday_date, holiday_name, holiday_type) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        holiday_id = LAST_INSERT_ID(holiday_id),
        holiday_name = VALUES(holiday_name),
        holiday_type = VALUES(holiday_type);
      `,
      [holidayDate, holidayName, h.type]
    ); // Get the ID

    const [idResult]: any = await conn.query(`SELECT LAST_INSERT_ID() as id;`);
    const holidayId = idResult[0].id; // Insert into employee_holiday_pay table

    await conn.query(
      `INSERT INTO employee_holiday_pay
        (payroll_id, holiday_id, holiday_hours, holiday_pay)
        VALUES (?, ?, ?, ?)`,
      [payrollId, holidayId, h.hours, h.pay]
    );
  }
}
async function processLoanPayment(
  conn: any,
  payrollId: number,
  employeeId: string,
  deductionAmount: number,
  payPeriodEnd: string
) {
  // If no deduction was taken, exit immediately (already in the original code)
  if (deductionAmount <= 0) return;

  // Step 1: Find the employee's active loan
  const [activeLoans]: any = await conn.query(
    `SELECT loan_id, balance FROM loans WHERE employee_id = ? AND status = 'Active' LIMIT 1`,
    [employeeId]
  );

  // *** CRITICAL FIX: Check if a loan was actually found ***
  if (activeLoans.length === 0) {
    // If a loan deduction was calculated but no active loan exists, log a warning and SKIP the payment process.
    // This is safer than throwing an error that breaks the whole transaction.
    console.warn(
      `[Loan Warning] Employee ${employeeId} had a calculated deduction of ${deductionAmount}, but no active loan was found.`
    );
    return; // Safely exit this payment process
  }

  const { loan_id, balance } = activeLoans[0]; // Now safe to destructure
  const paymentAmount = deductionAmount;
  const newBalance = balance - paymentAmount;

  // Step 2: Record the payment in the loan_payments table
  await conn.query(
    `INSERT INTO loan_payments 
     (loan_id, amount, payment_date, payroll_id)
     VALUES (?, ?, ?, ?)`,
    [loan_id, paymentAmount, payPeriodEnd, payrollId]
  );

  // Step 3: Update the loan balance and status
  const newStatus = newBalance <= 0.01 ? "Paid" : "Active";
  const finalBalance = newBalance < 0 ? 0 : newBalance;

  await conn.query(
    `UPDATE loans SET balance = ?, status = ? WHERE loan_id = ?`,
    [finalBalance, newStatus, loan_id]
  );
}
// -------------------------
// Controller: Save All Payroll (Refactored)
// -------------------------
export const saveAllPayroll = async (req: Request, res: Response) => {
  const payrolls: PayrollDTO[] = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    for (const payroll of payrolls) {
      // 1. UPSERT the main payroll record and get the ID (new or existing)
      const payrollId = await upsertPayroll(conn, payroll); // 2. IMPORTANT: DELETE existing child records for the given payrollId

      await deleteExistingChildRecords(conn, payrollId); // 3. INSERT the NEW child records (Deductions and Holidays)

      await insertDeductions(conn, payrollId, payroll);
      await insertHolidayBreakdowns(conn, payrollId, payroll.holidayBreakdowns);

      // 4. NEW STEP: Process Loan Payment
      // This MUST happen AFTER the payrollId is established and the loan deduction amount is known.
      await processLoanPayment(
        conn,
        payrollId,
        payroll.employee_id,
        payroll.loanDeduction,
        payroll.pay_period_end // Use pay period end as the payment date
      );
    }

    await conn.commit();
    res.json({
      message: "Payroll saved successfully, including loan payments.",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to save payroll and process loans: " + err });
  } finally {
    conn.release();
  }
};

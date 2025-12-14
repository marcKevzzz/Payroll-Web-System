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
    `SELECT
         h.holiday_date, h.holiday_name, h.holiday_type,
         eh.holiday_hours, eh.holiday_pay
     FROM employee_holiday_pay eh
     JOIN holidays h ON eh.holiday_id = h.holiday_id
     WHERE eh.payroll_id = ?`, // <<< JOIN to get the correct holiday data
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
async function insertDeductions(conn: any, payrollId: number, payroll: PayrollDTO) {
    
    // We can filter out deductions that are zero or null to keep the table clean
    const deductionRecords = [
        { type: 'SSS', amount: payroll.sssDeduction },
        { type: 'PhilHealth', amount: payroll.philHealthDeduction },
        { type: 'PagIbig', amount: payroll.pagIbigDeduction },
        { type: 'BIR Tax', amount: payroll.birTax },
        { type: 'Loan', amount: payroll.loanDeduction },
        // ... any other deductions
    ].filter(d => d.amount && d.amount > 0);

    if (deductionRecords.length === 0) {
        return;
    }

    const valuePlaceholders = deductionRecords.map(() => '(?, ?, ?)').join(', ');
    
    // Flatten the array for the query parameters: [payrollId, 'SSS', 427.5, payrollId, 'PH', 250.0, ...]
    const values = deductionRecords.flatMap(d => [payrollId, d.type, d.amount]);

    // Construct the final, clean SQL query using a standard template literal
    const sql = `
        INSERT INTO payroll_deductions (payroll_id, deduction_type, deduction_amount)
        VALUES ${valuePlaceholders}
    `;
    
    // Execute the bulk insert
    await conn.query(sql, values);
}

async function getOrCreateHolidayId(
  conn: any,
  holidayDate: string,
  holidayName: string,
  holidayType: string
): Promise<number> {
  // 1. Check if the holiday already exists by date
  const [existingHoliday]: any = await conn.query(
    `SELECT holiday_id FROM holidays WHERE holiday_date = ?`,
    [holidayDate]
  );

  if (existingHoliday.length > 0) {
    // If found, return the existing ID
    return existingHoliday[0].holiday_id;
  }

  // 2. If not found, insert the new holiday record
  const [insertResult]: any = await conn.query(
    `INSERT INTO holidays (holiday_date, holiday_name, holiday_type) 
     VALUES (?, ?, ?)`,
    [holidayDate, holidayName, holidayType]
  );

  // 3. Return the new ID
  return insertResult.insertId;
}

// --- UPDATED MAIN FUNCTION ---
async function insertHolidayBreakdowns(
  conn: any,
  payrollId: number,
  breakdowns?: HolidayBreakdownDTO[]
) {
  if (!breakdowns) return;

  for (const h of breakdowns) {
    // Skip records that are not holidays AND have no hours/pay
    if (!h.name && h.hours === 0 && h.pay === 0) {
      continue;
    }

    const holidayDate = h.date.split("T")[0];
    const holidayName = h.name || "Unidentified Holiday";
    // NOTE: If h.type is undefined in the breakdown, it defaults to 'Regular' in the mock data,
    // but in a real system, it should use a consistent default.
    const holidayType = h.type || "Special Non-Working"; 

    // ** 1. Get the single, existing or newly created holiday_id **
    const holidayId = await getOrCreateHolidayId(
      conn,
      holidayDate,
      holidayName,
      holidayType
    );

    // ** 2. Insert into employee_holiday_pay using the verified ID **
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
    `SELECT loan_id, loan_amount FROM loans WHERE employee_id = ? AND status = 'active' LIMIT 1`,
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

  const { loan_id, loan_amount } = activeLoans[0]; // Now safe to destructure
  const paymentAmount = deductionAmount;
  const newBalance = loan_amount - paymentAmount;

  // Step 2: Record the payment in the loan_payments table
  await conn.query(
    `INSERT INTO loan_payments 
     (loan_id, amount, payment_date, payroll_id)
     VALUES (?, ?, ?, ?)`,
    [loan_id, paymentAmount, payPeriodEnd, payrollId]
  );

  // Step 3: Update the loan balance and status
  const newStatus = newBalance <= 0.01 ? "paid" : "active";
  const finalBalance = newBalance < 0 ? 0 : newBalance;

  await conn.query(
    `UPDATE loans SET loan_amount = ?, status = ? WHERE loan_id = ?`,
    [finalBalance, newStatus, loan_id]
  );
}
// -------------------------
// Controller: Save All Payroll (Refactored)
// -------------------------
export const saveAllPayroll = async (req: Request, res: Response) => {
  let payrolls: PayrollDTO[] = req.body;

  // 1. CRITICAL: Handle the case where the body is null/undefined
  if (!payrolls) {
    return res.status(400).json({ error: "Request body is empty." });
  }

  // 2. DEFENSIVE CHECK: Ensure the data is an array
  if (!Array.isArray(payrolls)) {
    // If it's not an array, but is an object (e.g., {data: [...]}), try to find the array within it.
    if (typeof payrolls === 'object' && payrolls !== null && 'data' in payrolls && Array.isArray((payrolls as any).data)) {
        payrolls = (payrolls as any).data;
    } else {
        // If it's still not an array, stop and throw an error.
        return res.status(400).json({ error: "Data is not in a bulk array format. Expected: [...]" });
    }
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    for (const payroll of payrolls) { // <--- Now safe to iterate
      // 1. UPSERT the main payroll record and get the ID (new or existing)
      const payrollId = await upsertPayroll(conn, payroll); 

      // 2. IMPORTANT: DELETE existing child records for the given payrollId
      await deleteExistingChildRecords(conn, payrollId); 

      // 3. INSERT the NEW child records (Deductions and Holidays)
      await insertDeductions(conn, payrollId, payroll);
      await insertHolidayBreakdowns(conn, payrollId, payroll.holidayBreakdowns);

      // 4. NEW STEP: Process Loan Payment
      await processLoanPayment(
        conn,
        payrollId,
        payroll.employee_id,
        payroll.loanDeduction,
        payroll.pay_period_end 
      );
    }

    await conn.commit();
    res.json({
      message: "Payroll saved successfully, including loan payments.",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    // Be careful not to include sensitive error details in the final message
    res.status(500).json({ error: "Failed to save payroll and process loans: " + (err as Error).message });
  } finally {
    conn.release();
  }
};
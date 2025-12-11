import { Employee, DTREntry } from "../types/types";

// --- Seed Employees ---
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    firstName: "Maria",
    lastName: "Santos",
    emailAddress: "09171234567",
    contactNumber: "maria.santos@gmail.com",
    department: "Human Resources",
    position: "HR Manager",
    hourlyRate: 350.0,
    totalLoan: 50000.0,
  },
  {
    id: "EMP002",
    firstName: "Pedro",
    lastName: "Penduko",
    emailAddress: "pedro.penduko@gmail.com",
    contactNumber: "09187654321",
    department: "Software Development",
    position: "Frontend Developer",
    hourlyRate: 54.38, // MWE
    totalLoan: 0,
  },
];
// --- Generate DTR Logs ---
export const generateSeedDTR = (): DTREntry[] => {
  const entries: DTREntry[] = [];
  const addMonthLogs = (
    empId: string,
    year: number,
    monthIndex: number,
    startHour: number
  ) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const dateStr = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const hasOT = Math.random() < 0.2;
      const otHours = hasOT ? Math.floor(Math.random() * 3) + 1 : 0;
      const minOffset = Math.floor(Math.random() * 15);
      const timeIn = `${String(startHour).padStart(2, "0")}:${String(
        minOffset
      ).padStart(2, "0")}`;
      let outHour = startHour + 8 + otHours;
      const timeOut = `${String(outHour).padStart(2, "0")}:${String(
        minOffset
      ).padStart(2, "0")}`;
      entries.push({
        id: `DTR-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        timeIn,
        timeOut,
      });
    }
  };
  for (let m = 0; m <= 5; m++) {
    addMonthLogs("EMP001", 2025, m, 8);
  }
  for (let m = 4; m <= 5; m++) {
    addMonthLogs("EMP002", 2025, m, 9);
  }
  return entries;
};

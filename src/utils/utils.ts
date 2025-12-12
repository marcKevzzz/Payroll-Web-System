// export const OT_MULTIPLIER = 1.25;

// // --- REGIONAL MINIMUM WAGE DATA (Daily Rates - approximated 2024/2025) ---
// // Source: RTWPB Wage Orders (Simplified for top regions)
// // We assume 8 working hours to derive hourly rate.
// export const REGIONS: Record<string, { name: string; dailyWage: number }> = {
//   NCR: { name: "National Capital Region", dailyWage: 645 },
//   CAR: { name: "Cordillera Admin Region", dailyWage: 430 },
//   I: { name: "Region I (Ilocos)", dailyWage: 435 },
//   II: { name: "Region II (Cagayan Valley)", dailyWage: 450 },
//   III: { name: "Region III (Central Luzon)", dailyWage: 500 },
//   "IV-A": { name: "Region IV-A (Calabarzon)", dailyWage: 560 }, // Using highest bracket for safety
//   "IV-B": { name: "Region IV-B (Mimaropa)", dailyWage: 395 },
//   V: { name: "Region V (Bicol)", dailyWage: 395 },
//   VI: { name: "Region VI (Western Visayas)", dailyWage: 480 },
//   VII: { name: "Region VII (Central Visayas)", dailyWage: 468 },
//   VIII: { name: "Region VIII (Eastern Visayas)", dailyWage: 405 },
//   IX: { name: "Region IX (Zamboanga)", dailyWage: 381 },
//   X: { name: "Region X (Northern Mindanao)", dailyWage: 438 },
//   XI: { name: "Region XI (Davao)", dailyWage: 462 },
//   XII: { name: "Region XII (Soccsksargen)", dailyWage: 403 },
//   XIII: { name: "Caraga", dailyWage: 385 },
//   BARMM: { name: "BARMM", dailyWage: 361 },
// };

// // SSS Table Logic (2025: 5% Employee Share, Min 5k, Max 35k MSC)
// export const calculateSSS = (grossPay: number): number => {
//   const minMSC = 5000;
//   const maxMSC = 35000;

//   // Determine MSC
//   let msc = grossPay;
//   if (grossPay < minMSC) msc = minMSC;
//   if (grossPay > maxMSC) msc = maxMSC;

//   // Employee Share is 5%
//   return msc * 0.05;
// };

// // SSS Employee Compensation (EC) Logic (Employer Share)
// export const calculateSSSEC = (grossPay: number): number => {
//   const minMSC = 5000;
//   const maxMSC = 35000;

//   // Determine MSC
//   let msc = grossPay;
//   if (grossPay < minMSC) msc = minMSC;
//   if (grossPay > maxMSC) msc = maxMSC;

//   // EC Rule: Below 15k = 10, 15k and above = 30
//   if (msc < 15000) {
//     return 10;
//   } else {
//     return 30;
//   }
// };

// // BIR Tax Table Logic (TRAIN Law)
// export const calculateBIR = (taxableIncome: number): number => {
//   // If calculation results in negative taxable income, return 0
//   if (taxableIncome <= 0) return 0;

//   if (taxableIncome <= 20833) {
//     return 0;
//   } else if (taxableIncome <= 33333) {
//     return (taxableIncome - 20833) * 0.2;
//   } else if (taxableIncome <= 66666) {
//     return 2500 + (taxableIncome - 33333) * 0.25;
//   } else if (taxableIncome <= 166666) {
//     return 10833 + (taxableIncome - 66666) * 0.3;
//   } else if (taxableIncome <= 666666) {
//     return 40833 + (taxableIncome - 166666) * 0.32;
//   } else {
//     return 200833 + (taxableIncome - 666666) * 0.35;
//   }
// };

// // Helper: Time Diff in Hours
// export const calculateHours = (inTime: string, outTime: string): number => {
//   if (!inTime || !outTime) return 0;
//   const start = new Date(`1970-01-01T${inTime}:00`);
//   const end = new Date(`1970-01-01T${outTime}:00`);
//   let diffMs = end.getTime() - start.getTime();
//   if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight
//   return diffMs / (1000 * 60 * 60);
// };

// export const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat("en-PH", {
//     style: "currency",
//     currency: "PHP",
//   }).format(amount);
// };

export const OT_MULTIPLIER = 1.25;

export const getMinHourlyWage = (): number => {
  return 33.2;
};

// --- ORGANIZATION DATA ---
export const DEPARTMENTS = [
  "Executive",
  "Human Resources",
  "Finance",
  "Software Development",
  "IT & Infrastructure",
  "Engineering",
  "Sales & Marketing",
  "Operations",
  "Customer Support",
  "Research & Innovation",
] as const;

export const POSITIONS: Record<string, string[]> = {
  Executive: ["CEO", "COO", "CTO", "Executive Assistant"],
  "Human Resources": ["HR Manager", "HR Officer"],
  Finance: ["Finance Manager", "Accountant", "Bookkeeper"],
  "Software Development": [
    "Software Dev Manager",
    "Full-Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "QA Tester",
    "UI/UX Designer",
  ],
  "IT & Infrastructure": [
    "IT Support",
    "Systems Administrator",
    "Cloud Engineer",
  ],
  Engineering: [
    "Engineer",
    "Mechanical Engineer",
    "Electrical Engineer",
    "QA Engineer",
  ],
  "Sales & Marketing": [
    "Sales Manager",
    "Account Executive",
    "Marketing Specialist",
  ],
  Operations: ["Operations Manager", "Project Manager", "Logistics Officer"],
  "Customer Support": ["Customer Support Agent", "Helpdesk Analyst"],
  "Research & Innovation": [
    "R&D Manager",
    "Data Scientist",
    "Research Engineer",
  ],
};

// Helper to format full name consistently
export const formatName = (emp: {
  first_name: string;
  middle_name?: string;
  last_name: string;
}) => {
  const mid = emp.middle_name ? `${emp.middle_name.charAt(0)}.` : "";
  return `${emp.last_name}, ${emp.first_name} ${mid}`.trim();
};

// --- PHILIPPINE HOLIDAYS API (Simulated for 2025) ---
// In a real app, this could fetch from an endpoint.
export const getPHHolidays2025 = () => {
  return [
    { date: "2025-01-01", name: "New Year's Day", type: "Regular" },
    { date: "2025-01-29", name: "Lunar New Year", type: "Special" },
    {
      date: "2025-02-25",
      name: "EDSA Revolution Anniversary",
      type: "Special",
    },
    { date: "2025-04-09", name: "Araw ng Kagitingan", type: "Regular" },
    { date: "2025-04-17", name: "Maundy Thursday", type: "Regular" },
    { date: "2025-04-18", name: "Good Friday", type: "Regular" },
    { date: "2025-04-19", name: "Black Saturday", type: "Special" },
    { date: "2025-05-01", name: "Labor Day", type: "Regular" },
    { date: "2025-06-12", name: "Independence Day", type: "Regular" },
    { date: "2025-08-21", name: "Ninoy Aquino Day", type: "Special" },
    { date: "2025-08-25", name: "National Heroes Day", type: "Regular" },
    { date: "2025-11-01", name: "All Saints' Day", type: "Special" },
    { date: "2025-11-02", name: "All Souls' Day", type: "Special" },
    { date: "2025-11-30", name: "Bonifacio Day", type: "Regular" },
    {
      date: "2025-12-08",
      name: "Feast of the Immaculate Conception",
      type: "Special",
    },
    { date: "2025-12-25", name: "Christmas Day", type: "Regular" },
    { date: "2025-12-30", name: "Rizal Day", type: "Regular" },
    { date: "2025-12-31", name: "Last Day of the Year", type: "Special" },
  ] as const;
};

export const getPHHolidays2026 = () => {
  return [
    { date: "2026-01-01", name: "New Year's Day", type: "Regular" },
    { date: "2026-02-17", name: "Chinese New Year", type: "Special" },
    { date: "2026-04-02", name: "Maundy Thursday", type: "Regular" },
    { date: "2026-04-03", name: "Good Friday", type: "Regular" },
    { date: "2026-04-04", name: "Black Saturday", type: "Special" },
    { date: "2026-04-09", name: "Araw ng Kagitingan", type: "Regular" },
    { date: "2026-05-01", name: "Labor Day", type: "Regular" },
    { date: "2026-06-12", name: "Independence Day", type: "Regular" },
    { date: "2026-08-21", name: "Ninoy Aquino Day", type: "Special" },
    { date: "2026-08-31", name: "National Heroes Day", type: "Regular" },
    { date: "2026-11-01", name: "All Saints' Day", type: "Special" },
    { date: "2026-11-02", name: "All Souls' Day", type: "Special" },
    { date: "2026-11-30", name: "Bonifacio Day", type: "Regular" },
    {
      date: "2026-12-08",
      name: "Feast of the Immaculate Conception",
      type: "Special",
    },
    { date: "2026-12-24", name: "Christmas Eve", type: "Special" },
    { date: "2026-12-25", name: "Christmas Day", type: "Regular" },
    { date: "2026-12-30", name: "Rizal Day", type: "Regular" },
    { date: "2026-12-31", name: "Last Day of the Year", type: "Special" },
  ] as const;
};

// Combined Holiday Reader (Auto-selects by year)
export const getHolidayData = (dateStr: string) => {
  const year = dateStr.slice(0, 4);

  const list =
    year === "2025"
      ? getPHHolidays2025()
      : year === "2026"
      ? getPHHolidays2026()
      : [];

  return list.find((h) => h.date === dateStr) || null;
};

// ===============================
//   HOLIDAY MULTIPLIER HELPERS
// ===============================
export const getHolidayMultiplier = (dateStr: string): number => {
  const holiday = getHolidayData(dateStr);

  if (!holiday) return 1.0; // Regular day

  return holiday.type === "Regular" ? 2.0 : 1.3;
};

export const getHolidayName = (dateStr: string): string | null => {
  const holiday = getHolidayData(dateStr);
  return holiday ? `${holiday.name} (${holiday.type})` : null;
};

// SSS Table Logic (2025: 5% Employee Share, Min 5k, Max 35k MSC)
export const calculateSSS = (grossPay: number): number => {
  const minMSC = 5000;
  const maxMSC = 35000;
  let msc = Math.max(minMSC, Math.min(grossPay, maxMSC));
  return msc * 0.05;
};

export const calculateSSSEC = (grossPay: number): number => {
  const minMSC = 5000;
  const maxMSC = 35000;
  let msc = Math.max(minMSC, Math.min(grossPay, maxMSC));
  return msc < 15000 ? 10 : 30;
};

// --- PAG-IBIG Fund Logic ---
// MFS Cap 10,000.
// Rate: 1% (Emp) / 2% (Er) if Salary <= 1500
// Rate: 2% (Emp) / 2% (Er) if Salary > 1500
export const calculatePagIBIG = (
  monthlyBasic: number
): { employee: number; employer: number } => {
  const mfs = Math.min(monthlyBasic, 10000); // Cap at 10k MFS

  let empRate = 0.02;
  if (monthlyBasic <= 1500) {
    empRate = 0.01;
  }

  const erRate = 0.02;

  return {
    employee: mfs * empRate,
    employer: mfs * erRate,
  };
};

// --- PhilHealth Logic ---
// 5% Rate, Shared 50-50.
// Floor 10k, Ceiling 100k.
export const calculatePhilHealth = (
  monthlyBasic: number
): { employee: number; employer: number } => {
  const floor = 10000;
  const ceiling = 100000;

  // Calculate Basis
  const basis = Math.max(floor, Math.min(monthlyBasic, ceiling));

  const totalPremium = basis * 0.05;

  // Shared equally
  const share = totalPremium / 2;

  return {
    employee: share,
    employer: share,
  };
};

// BIR Tax Table Logic (TRAIN Law)
export const calculateBIR = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;

  if (taxableIncome <= 20833) {
    return 0;
  } else if (taxableIncome <= 33333) {
    return (taxableIncome - 20833) * 0.2;
  } else if (taxableIncome <= 66666) {
    return 2500 + (taxableIncome - 33333) * 0.25;
  } else if (taxableIncome <= 166666) {
    return 10833 + (taxableIncome - 66666) * 0.3;
  } else if (taxableIncome <= 666666) {
    return 40833 + (taxableIncome - 166666) * 0.32;
  } else {
    return 200833 + (taxableIncome - 666666) * 0.35;
  }
};

// Helper: Time Diff in Hours
export const calculateHours = (inTime: string, outTime: string): number => {
  if (!inTime || !outTime) return 0;
  const start = new Date(`1970-01-01T${inTime}`);
  const end = new Date(`1970-01-01T${outTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

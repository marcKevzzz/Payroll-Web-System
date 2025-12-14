import { HolidayBreakdown } from "../types/types";
import { SSS_CONTRIBUTION_TABLE } from "./sss";

export const OT_MULTIPLIER = 1.25;
export const NIGHT_SHIFT_DIFFERENTIAL = 0.1; // 10%
export const NIGHT_SHIFT_START_HOUR = 22; // 10 PM
export const NIGHT_SHIFT_END_HOUR = 6; // 6 AM
export const PAID_LEAVE_TYPES = [1, 2]; // Assuming 1=Vacation, 2=Sick Leave are paid
export const STANDARD_REST_DAY_WEEK_DAYS = [0, 6];

// POSITION-BASED BENEFITS/ALLOWANCES
export const POSITION_BENEFITS: Record<string, number> = {
  "Software Dev Manager": 5000.0,
  "Finance Manager": 4000.0,
  "Full-Stack Developer": 2500.0,
  "IT Support": 1500.0,
  "Customer Support Agent": 1000.0,
};

export const getMinHourlyWage = (): number => {
  return 33.2;
};

// --- ORGANIZATION DATA ---
export const DEPARTMENTS = [
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
const REGULAR_HOLIDAYS = [
  // New Year
  { date: "2025-01-01", name: "New Year's Day", type: "Regular" },
  // Holy Week
  {
    date: "2025-04-09",
    name: "Araw ng Kagitingan (Bataan and Corregidor Day)",
    type: "Regular",
  },
  { date: "2025-04-17", name: "Maundy Thursday", type: "Regular" },
  { date: "2025-04-18", name: "Good Friday", type: "Regular" },
  // Other Regular
  { date: "2025-05-01", name: "Labor Day", type: "Regular" },
  { date: "2025-06-12", name: "Independence Day", type: "Regular" },
  { date: "2025-08-25", name: "National Heroes Day", type: "Regular" }, // Note: Adjusted to last Monday of Aug
  { date: "2025-11-30", name: "Bonifacio Day", type: "Regular" },
  { date: "2025-12-25", name: "Christmas Day", type: "Regular" },
  { date: "2025-12-30", name: "Rizal Day", type: "Regular" },
];

// 2. SPECIAL NON-WORKING DAYS (Fixed)
const SPECIAL_NON_WORKING_HOLIDAYS = [
  { date: "2025-01-29", name: "Lunar New Year", type: "Special Non-Working" },
  {
    date: "2025-02-25",
    name: "EDSA People Power Revolution Anniversary",
    type: "Special Non-Working",
  },
  { date: "2025-04-19", name: "Black Saturday", type: "Special Non-Working" },
  { date: "2025-08-21", name: "Ninoy Aquino Day", type: "Special Non-Working" },
  { date: "2025-11-01", name: "All Saints' Day", type: "Special Non-Working" },
  {
    date: "2025-12-08",
    name: "Feast of the Immaculate Conception of Mary",
    type: "Special Non-Working",
  },
  { date: "2025-12-24", name: "Christmas Eve", type: "Special Non-Working" }, // Common Proclamation
  {
    date: "2025-12-31",
    name: "Last Day of the Year",
    type: "Special Non-Working",
  },
];

// 3. MOVABLE REGULAR HOLIDAYS (Islam/Variable)
// These dates are estimates but are necessary for a complete system.
const MOVABLE_HOLIDAYS_2025 = [
  // Dates are estimates based on Proclamation schedule (usually declared closer to the date)
  { date: "2025-04-01", name: "Eid'l Fitr (End of Ramadhan)", type: "Regular" }, // Estimated
  {
    date: "2025-06-07",
    name: "Eid'l Adha (Feast of Sacrifice)",
    type: "Regular",
  }, // Estimated
];

// 4. Other Special Working Days (Commonly declared)
const OTHER_SPECIAL_DAYS = [
  { date: "2025-11-02", name: "All Souls' Day", type: "Special Non-Working" }, // Often SNWD
];

export const getPHHolidays2025 = () => {
  return [
    ...REGULAR_HOLIDAYS,
    ...SPECIAL_NON_WORKING_HOLIDAYS,
    ...MOVABLE_HOLIDAYS_2025,
    ...OTHER_SPECIAL_DAYS,
  ];
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
  // Ensure we are only using the YYYY-MM-DD part for lookup
  const cleanDateStr = dateStr.slice(0, 10);
  const year = cleanDateStr.slice(0, 4);

  const list =
    year === "2025"
      ? getPHHolidays2025()
      : year === "2026"
      ? getPHHolidays2026()
      : [];

  // Use Array.find for the lookup
  return list.find((h) => h.date === cleanDateStr) || null;
};



// ===============================
//   HOLIDAY MULTIPLIER HELPERS
export const getHolidayMultiplier = (
  dateStr: string,
  isRestDay: boolean
): number => {
  const holiday = getHolidayData(dateStr);
  let baseMultiplier = 1.0;

  if (!holiday) {
    // 1. NOT A HOLIDAY
    return isRestDay ? 1.3 : 1.0;
  }

  if (holiday.type === "Regular") {
    // 2. REGULAR HOLIDAY (200%)
    baseMultiplier = 2.0;
  } else if (
    holiday.type === "Special" ||
    holiday.type === "Special Non-Working"
  ) {
    // 3. SPECIAL HOLIDAY (130%)
    baseMultiplier = 1.3;
  }

  // Work on Holiday AND Rest Day: Add 30% of the base pay multiplier
  if (isRestDay) {
    return baseMultiplier + baseMultiplier * 0.3;
    // Example: Regular Holiday on Rest Day = 2.0 + (2.0 * 0.3) = 2.6
    // Example: Special Holiday on Rest Day = 1.3 + (1.3 * 0.3) = 1.69
  }

  return baseMultiplier;
};

export const getHolidayOTMultiplier = (baseMultiplier: number): number => {
  // The law dictates OT pay on a holiday is: (Rate * Multiplier) * 130%
  // Since baseMultiplier is (Rate * M), the total OT multiplier is M * 1.3
  return baseMultiplier * 1.3;
};

export const getHolidayName = (dateStr: string): string | null => {
  const holiday = getHolidayData(dateStr);
  return holiday ? `${holiday.name} (${holiday.type})` : null;
};
export const getAllHolidaysInMonth = (month: string) => {
  const year = month.slice(0, 4);

  const allHolidays =
    year === "2025"
      ? getPHHolidays2025()
      : year === "2026"
      ? getPHHolidays2026()
      : [];

  return allHolidays.filter((holiday) => holiday.date.startsWith(month));
};

/**
 * Retrieves only the dates of Regular Holidays within a given month (YYYY-MM).
 */
export const getAllRegularHolidayDatesInMonth = (month: string): string[] => {
  const holidays = getAllHolidaysInMonth(month);

  return holidays.filter((h) => h.type === "Regular").map((h) => h.date);
};

// Helper to estimate the daily regular rate based on the hourly rate (assuming 8 hours/day)
export const calculateDailyRate = (hourlyRate: number): number => {
  const requiredHours = 8; // Assuming standard 8-hour workday
  return hourlyRate * requiredHours;
};

export const isEmployeeRestDay = (
  dateStr: string,
  employeeId: string
): boolean => {
  // 1. Get the numeric part of the ID and its last digit
  const parts = employeeId.split("-"); // e.g., ['25', '0001']
  if (parts.length < 2) return false; // Safety check

  const numericPart = parts[1]; // '0001'
  const lastDigit = parseInt(numericPart.slice(-1), 10); // 1 (or 2, 3, 0, etc.)

  // 2. Determine the assigned rest day (0 for Sunday, 6 for Saturday)
  let assignedRestDay: number;

  // Use modulo operator (%) to check for odd/even
  if (lastDigit % 2 !== 0) {
    // ODD (1, 3, 5, 7, 9) -> Assign Sunday
    assignedRestDay = 0; // Sunday
  } else {
    // EVEN (0, 2, 4, 6, 8) -> Assign Saturday
    assignedRestDay = 6; // Saturday
  }

  // 3. Get the day of the week for the work date
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

  // 4. Compare
  return dayOfWeek === assignedRestDay;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function calculateSSSW(monthlySalary: number) {
  const row =
    SSS_CONTRIBUTION_TABLE.find(
      (r) => monthlySalary >= r.rangeMin && monthlySalary <= r.rangeMax
    ) ?? SSS_CONTRIBUTION_TABLE[0];

  const msc = row.msc;

  // Regular SSS (14%)
  const regularEE = msc * 0.045;
  const regularER = msc * 0.095;

  // MPF only applies above 20,000 MSC
  const mpfMSC = Math.max(0, Math.min(msc, 35000) - 20000);

  const mpfEE = mpfMSC * 0.01;
  const mpfER = mpfMSC * 0.01;

  return {
    msc,
    ee: round(regularEE),
    er: round(regularER),
    mpfEE: round(mpfEE),
    mpfER: round(mpfER),
    totalEE: round(regularEE + mpfEE),
    totalER: round(regularER + mpfER),
  };
}

export const calculateSSSEC = (grossPay: number): number => {
  // SSS EC is calculated based on the Monthly Salary Credit (MSC) bracket.
  // Since we don't have the MSC directly, we will find the entry again.
  const tableEntry = SSS_CONTRIBUTION_TABLE.find(
    (entry) => grossPay >= entry.rangeMin && grossPay <= entry.rangeMax
  );
  if (!tableEntry) return 0; // Should not happen

  const msc = tableEntry.msc;
  // EC Contribution: P10 if MSC < 15k, P30 if MSC >= 15k
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
export const calculateHours = (
  inTime: string,
  outTime: string
): { totalHours: number; nsdHours: number } => {
  if (!inTime || !outTime) return { totalHours: 0, nsdHours: 0 };

  const start = new Date(`1970-01-01T${inTime}`);
  let end = new Date(`1970-01-01T${outTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    return { totalHours: 0, nsdHours: 0 };

  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight

  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  let nsdHours = 0;

  // Calculate NSD Hours (10 PM to 6 AM)
  let currentTime = new Date(start.getTime());
  const endTime = new Date(start.getTime() + diffMs);

  // Loop through the shift hour by hour
  while (currentTime.getTime() < endTime.getTime()) {
    const hour = currentTime.getHours();
    const nextTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const effectiveEnd =
      nextTime.getTime() > endTime.getTime() ? endTime : nextTime;

    // Check for Night Shift period: 10 PM (22) to 5 AM (5) for the full hour, or up to 6 AM (6) boundary.
    // The law is 10 PM to 6 AM.
    if (hour >= NIGHT_SHIFT_START_HOUR || hour < NIGHT_SHIFT_END_HOUR) {
      const hourDuration =
        (effectiveEnd.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      nsdHours += hourDuration;
    }

    if (nextTime.getTime() > endTime.getTime()) break;
    currentTime = nextTime;
  }

  return { totalHours, nsdHours: Math.round(nsdHours * 100) / 100 };
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

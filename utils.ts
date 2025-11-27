export const OT_MULTIPLIER = 1.25;

// --- PHILIPPINE HOLIDAYS API (2025 + 2026) ---

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

// ===============================
//     SSS CONTRIBUTION LOGIC
// ===============================
export const calculateSSS = (grossPay: number): number => {
  const minMSC = 5000;
  const maxMSC = 35000;

  let msc = Math.min(Math.max(grossPay, minMSC), maxMSC);

  return msc * 0.05; // Employee share 5%
};

// EC employer share
export const calculateSSSEC = (grossPay: number): number => {
  const minMSC = 5000;
  const maxMSC = 35000;

  let msc = Math.min(Math.max(grossPay, minMSC), maxMSC);

  return msc < 15000 ? 10 : 30;
};

// ===============================
//       BIR / TRAIN LAW
// ===============================
export const calculateBIR = (taxableIncome: number): number => {
  if (taxableIncome <= 20833) return 0;
  if (taxableIncome <= 33333) return (taxableIncome - 20833) * 0.2;
  if (taxableIncome <= 66666) return 2500 + (taxableIncome - 33333) * 0.25;
  if (taxableIncome <= 166666) return 10833 + (taxableIncome - 66666) * 0.3;
  if (taxableIncome <= 666666) return 40833 + (taxableIncome - 166666) * 0.32;
  return 200833 + (taxableIncome - 666666) * 0.35;
};

// ===============================
//      TIME DIFF (HOURS)
// ===============================
export const calculateHours = (inTime: string, outTime: string): number => {
  if (!inTime || !outTime) return 0;

  const start = new Date(`1970-01-01T${inTime}:00`);
  const end = new Date(`1970-01-01T${outTime}:00`);

  // Handle overnight shifts (e.g., 22:00 → 06:00 next day)
  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

  return diffMs / (1000 * 60 * 60); // convert ms → hours
};

// ===============================
//       CURRENCY FORMATTER
// ===============================
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

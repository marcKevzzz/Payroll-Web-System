export const OT_MULTIPLIER = 1.25;

// SSS Table Logic (2025: 5% Employee Share, Min 5k, Max 35k MSC)
export const calculateSSS = (grossPay: number): number => {
  const minMSC = 5000;
  const maxMSC = 35000;
  
  // Determine MSC
  let msc = grossPay;
  if (grossPay < minMSC) msc = minMSC;
  if (grossPay > maxMSC) msc = maxMSC;

  // Employee Share is 5%
  return msc * 0.05;
};

// BIR Tax Table Logic (TRAIN Law)
export const calculateBIR = (taxableIncome: number): number => {
  if (taxableIncome <= 20833) {
    return 0;
  } else if (taxableIncome <= 33333) {
    return (taxableIncome - 20833) * 0.20;
  } else if (taxableIncome <= 66666) {
    return 2500 + (taxableIncome - 33333) * 0.25;
  } else if (taxableIncome <= 166666) {
    return 10833 + (taxableIncome - 66666) * 0.30;
  } else if (taxableIncome <= 666666) {
    return 40833 + (taxableIncome - 166666) * 0.32;
  } else {
    return 200833 + (taxableIncome - 666666) * 0.35;
  }
};

// Helper: Time Diff in Hours
export const calculateHours = (inTime: string, outTime: string): number => {
  if (!inTime || !outTime) return 0;
  const start = new Date(`1970-01-01T${inTime}:00`);
  const end = new Date(`1970-01-01T${outTime}:00`);
  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight
  return diffMs / (1000 * 60 * 60);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

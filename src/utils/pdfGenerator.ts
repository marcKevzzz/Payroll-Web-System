// src/utils/pdfGenerator.ts

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadAndOpenPdf = async (
  element: HTMLElement,
  filename: string
) => {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "l", // landscape
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ✅ PAGE PADDING (safe margin)
  const padding = 2; // mm
  const usableWidth = pageWidth - padding * 2;
  const usableHeight = pageHeight - padding * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // ✅ SCALE TO FIT INSIDE PADDING
  const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);

  const finalWidth = imgWidth * scale;
  const finalHeight = imgHeight * scale;

  const x = padding + (usableWidth - finalWidth) / 2;
  const y = padding + (usableHeight - finalHeight) / 2;

  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save(filename);
};

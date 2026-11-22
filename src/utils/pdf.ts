import { jsPDF } from 'jspdf';
import type { ImageExamination } from '../types/examination';
import { displayValue, formatBytes, formatDateTime } from './format';
import { metadataFieldGroups } from './exif';

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function ensureSpace(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 285) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function generateForensicReport(
  examination: ImageExamination,
  examinerName = '',
): void {
  if (!examination.metadata || !examination.hash || !examination.analyzedAt) {
    throw new Error('Complete an image analysis before generating a report.');
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 16;
  const width = 210 - margin * 2;
  let y = 20;

  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TraceLens', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Digital Image Forensic Examination System', margin, 18);
  doc.setFontSize(8);
  doc.text('Client-side Technical Examination Report', margin, 24);

  y = 38;
  doc.setTextColor(20, 30, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Forensic Examination Report', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y = wrapText(doc, `Examination ID: ${examination.id}`, margin, y, width);
  y = wrapText(doc, `Examination Date/Time: ${formatDateTime(examination.analyzedAt)}`, margin, y, width);
  y = wrapText(doc, `Report Generated: ${formatDateTime(new Date())}`, margin, y, width);
  y += 4;

  y = ensureSpace(doc, y, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. File Properties', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const props = [
    `Filename: ${examination.properties.name}`,
    `MIME Type: ${examination.properties.type || 'Not Available'}`,
    `File Size: ${formatBytes(examination.properties.size)} (${examination.properties.size} bytes)`,
    `Displayed Dimensions: ${
      examination.properties.width && examination.properties.height
        ? `${examination.properties.width} × ${examination.properties.height} px`
        : 'Not Available'
    }`,
  ];
  props.forEach((line) => {
    y = wrapText(doc, line, margin, y, width);
  });
  y += 4;

  y = ensureSpace(doc, y, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Extracted Metadata', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const groups = metadataFieldGroups(examination.metadata);
  const sections: Array<[string, typeof groups.general]> = [
    ['General Information', groups.general],
    ['Camera Information', groups.camera],
    ['Date and Time', groups.datetime],
    ['GPS Information', groups.gps],
    ['Software Information', groups.software],
  ];

  sections.forEach(([title, fields]) => {
    y = ensureSpace(doc, y, 16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    fields.forEach((field) => {
      y = wrapText(
        doc,
        `${field.label}: ${displayValue(field.value)}`,
        margin + 2,
        y,
        width - 2,
      );
    });
    y += 2;
  });
  y += 2;

  y = ensureSpace(doc, y, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. File Integrity (SHA-256)', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y = wrapText(doc, examination.hash, margin, y, width, 4.5);
  doc.setFontSize(9);
  y += 2;
  y = wrapText(
    doc,
    'The SHA-256 digest was calculated from the original uploaded file bytes using the browser Web Crypto API. A matching hash verifies that the examined byte stream is unchanged relative to a known reference. A hash alone does not prove photographic authenticity, provenance, or lack of prior content manipulation.',
    margin,
    y,
    width,
    4.5,
  );
  y += 4;

  y = ensureSpace(doc, y, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. Forensic Observations', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  examination.observations.forEach((obs, index) => {
    y = ensureSpace(doc, y, 28);
    doc.setFont('helvetica', 'bold');
    y = wrapText(doc, `${index + 1}. ${obs.observation}`, margin, y, width, 4.5);
    doc.setFont('helvetica', 'normal');
    y = wrapText(doc, `Reason: ${obs.reason}`, margin + 2, y, width - 2, 4.5);
    y = wrapText(doc, `Forensic relevance: ${obs.relevance}`, margin + 2, y, width - 2, 4.5);
    y += 3;
  });

  y = ensureSpace(doc, y, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. Examination Limitations and Disclaimer', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const disclaimer = [
    'TraceLens is an educational technical examination tool. Analysis is performed locally in the examiner browser and does not constitute a legal opinion, court-ready expert report, or conclusive determination of authenticity.',
    'Missing, incomplete, or inconsistent metadata may result from privacy stripping, platform re-encoding, camera settings, export workflows, or other benign causes. TraceLens never labels an image genuine, fake, manipulated, or tampered solely from missing metadata.',
    'Hash verification confirms byte identity relative to a reference; it does not independently prove capture authenticity. GPS, timestamps, and software tags can be absent, inaccurate, or altered.',
    'Any investigative conclusions require additional corroboration beyond this automated technical summary.',
  ];
  disclaimer.forEach((para) => {
    y = wrapText(doc, para, margin, y, width, 4.5);
    y += 3;
  });

  y = ensureSpace(doc, y, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('6. Examiner Attestation', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y = wrapText(
    doc,
    `Examiner Name: ${examinerName.trim() || '________________________________'}`,
    margin,
    y,
    width,
  );
  y += 10;
  doc.text('Signature: ________________________________', margin, y);
  y += 8;
  doc.text('Date: ____________________', margin, y);
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 125);
  wrapText(
    doc,
    'Generated by TraceLens – Digital Image Forensic Examination System. Process files only with appropriate authority and privacy safeguards.',
    margin,
    y,
    width,
    4,
  );

  const safeName = examination.properties.name.replace(/\.[^.]+$/, '');
  doc.save(`TraceLens_Report_${examination.id}_${safeName}.pdf`);
}

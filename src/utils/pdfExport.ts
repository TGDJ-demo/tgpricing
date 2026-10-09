import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteData, SalesOrderData } from '../types';
import { PRIVACY_CONFIDENTIALITY_NOTICE } from '../data/defaults';
import { calculateQuoteLineItems, formatCurrencyVal } from './exportUtils';

export type PdfDensity = 'compact' | 'balanced' | 'roomy';
export interface PdfExportResult {
  blob?: Blob;
  pageCount: number;
  pageWidthMm: number;
  pageHeightMm: number;
  fieldNames: string[];
  fitsOnePage: boolean;
  warnings: string[];
  density: PdfDensity;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const SIDE = 14;
const CONTENT_WIDTH = PAGE_WIDTH - SIDE * 2;
const FOOTER_TOP = 278;

export function buildPdfExport(quote: QuoteData, type: 'quote' | 'order', density: PdfDensity): PdfExportResult {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const order: SalesOrderData = quote.salesOrder;
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const customer = quote.customerInfo;
  const fields: string[] = [];
  const warnings: string[] = [];
  const scale = density === 'compact' ? 0.84 : density === 'roomy' ? 1.14 : 1;
  const bodyFont = 7.2 * scale;
  const lineHeight = bodyFont * 0.52;

  const addField = (name: string, value: string, x: number, y: number, width: number, height: number, multiline = false) => {
    if (x < SIDE || y < 0 || x + width > PAGE_WIDTH - SIDE || y + height > FOOTER_TOP) {
      warnings.push(`Editable field “${name}” falls outside the printable content area.`);
    }
    try {
      const formApi = doc as any;
      const field = new formApi.AcroForm.TextField();
      field.fieldName = name;
      field.value = value || '';
      field.x = x;
      field.y = y;
      field.width = width;
      field.height = height;
      field.fontSize = Math.max(5, bodyFont - 0.4);
      field.multiline = multiline;
      field.borderWidth = 0;
      field.backgroundColor = '#fafbfc';
      field.color = '#0f172a';
      doc.addField(field);
      fields.push(name);
    } catch (error) {
      warnings.push(`Could not create editable field “${name}”.`);
      console.warn(`Could not add PDF field ${name}`, error);
    }
  };

  const wrap = (value: string, width: number, size = bodyFont) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    return doc.splitTextToSize(value || '—', width) as string[];
  };

  const drawCard = (x: number, y: number, width: number, label: string, lines: string[], size = bodyFont) => {
    const innerWidth = width - 10;
    const wrapped = lines.flatMap((line) => wrap(line, innerWidth, size));
    const height = Math.max(18, 9 + wrapped.length * (size * 0.48) + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2 * scale);
    doc.setTextColor(148, 110, 45);
    doc.text(label.toUpperCase(), x + 5, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(51, 65, 85);
    doc.text(wrapped, x + 5, y + 10, { lineHeightFactor: 1.05 });
    return height;
  };

  // Light sapphire header with a fine sapphire / teal / pink / purple gradient accent.
  doc.setFillColor(248, 250, 255);
  doc.rect(0, 0, PAGE_WIDTH, 23, 'F');
  drawGradient(doc, 0, 22, PAGE_WIDTH, 1.2, [[83, 129, 224], [65, 190, 184], [232, 133, 184], [153, 113, 223]]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(34, 57, 105);
  doc.text('TestGrid', SIDE, 13);
  doc.setFontSize(6.5);
  doc.setTextColor(89, 111, 159);
  doc.text('ENTERPRISE TESTING SOLUTIONS', SIDE, 18);
  doc.setFontSize(9);
  doc.setTextColor(67, 83, 132);
  doc.text(type === 'order' ? 'SALES ORDER' : 'COMMERCIAL QUOTE', PAGE_WIDTH - SIDE, 14, { align: 'right' });

  let y = 29;
  const docDate = type === 'order' ? order.orderDate : customer.date;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12 * scale);
  doc.setTextColor(22, 32, 50);
  doc.text(type === 'order' ? 'Sales order' : 'Commercial quote', SIDE, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5 * scale);
  doc.setTextColor(71, 85, 105);
  doc.text(`${type === 'order' ? 'Order' : 'Issue'} date · ${docDate || ''}`, PAGE_WIDTH - SIDE, y + 4, { align: 'right' });
  y += 10;

  const clientHeight = drawCard(SIDE, y, 89, 'Customer', [customer.customerName, customer.companyName, customer.customerEmail]);
  addField('Customer Name', customer.customerName, SIDE + 5, y + 10, 79, 5);
  addField('Customer Email', customer.customerEmail, SIDE + 5, y + 17, 79, 5);
  const referenceLines = type === 'order'
    ? [`Invoice no.: ${order.invoiceNumber}`, `Source quote: ${customer.quoteNumber}`, `PO number: ${order.purchaseOrderNumber || 'Pending'}`, `Payment terms: ${order.paymentTerms || '—'}`, `Currency: ${currency}`]
    : [`Quote no.: ${customer.quoteNumber}`, `Validity: ${customer.validityDays || '—'}`, `Payment terms: ${customer.paymentTerms || '—'}`, `Contract term: ${calc.commitmentYears} year(s)`, `Currency: ${currency}`];
  const metaHeight = drawCard(PAGE_WIDTH - SIDE - 89, y, 89, type === 'order' ? 'Order details' : 'Quote details', referenceLines);
  const metaX = PAGE_WIDTH - SIDE - 89;
  addField(type === 'order' ? 'Invoice Number' : 'Quote Number', type === 'order' ? order.invoiceNumber : customer.quoteNumber, metaX + 5, y + 8, 79, 4.5);
  if (type === 'order') {
    addField('Purchase Order Number', order.purchaseOrderNumber, metaX + 5, y + 15, 79, 4.5);
    addField('Order Payment Terms', order.paymentTerms, metaX + 5, y + 18.5, 79, 4.5);
  }
  y += Math.max(clientHeight, metaHeight) + 4;

  if (type === 'order') {
    const addressHeight = Math.max(
      drawAddressCard(doc, addField, wrap, SIDE, y, 89, 'Bill to', 'Billing Address', order.billingAddress || `${customer.companyName}\n${customer.customerEmail}`, bodyFont),
      drawAddressCard(doc, addField, wrap, PAGE_WIDTH - SIDE - 89, y, 89, 'Service / ship to', 'Service Address', order.serviceAddress || 'Same as bill-to', bodyFont)
    );
    y += addressHeight + 4;
  }

  const lineItems = calc.lineItems.length ? calc.lineItems : [];
  const tableRows = lineItems.map((item) => [
    `${item.label}${!item.isDiscountable ? ' (Discount exempt)' : ''}${item.note ? `\n${item.note}` : ''}`,
    String(item.qty),
    formatCurrencyVal(item.unitCostDiscounted, currency),
    formatCurrencyVal(item.totalDiscounted, currency),
  ]);
  if (!tableRows.length) tableRows.push(['No products or services selected', '0', formatCurrencyVal(0, currency), formatCurrencyVal(0, currency)]);

  autoTable(doc, {
    startY: y,
    margin: { left: SIDE, right: SIDE, top: 24, bottom: PAGE_HEIGHT - FOOTER_TOP },
    head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT']],
    body: tableRows,
    theme: 'grid',
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    headStyles: { fillColor: [22, 32, 50], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: Math.max(4.4, 6.5 * scale), cellPadding: 1.5 * scale },
    styles: { font: 'helvetica', fontSize: Math.max(4, 6.2 * scale), cellPadding: 1.35 * scale, lineColor: [226, 232, 240], lineWidth: 0.1, textColor: [30, 41, 59], overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 101 }, 1: { cellWidth: 15, halign: 'center' }, 2: { cellWidth: 31, halign: 'right' }, 3: { cellWidth: 35, halign: 'right' } },
  });
  const tableEnd = (doc as any).lastAutoTable?.finalY ?? y;
  y = tableEnd + 4;

  if (quote.disclaimerNotice.trim() && type === 'quote') {
    const termsSize = Math.max(5.4, bodyFont - 0.5);
    const termsLines = wrap(quote.disclaimerNotice, CONTENT_WIDTH - 10, termsSize);
    const termsHeight = Math.max(15, 11 + termsLines.length * termsSize * 0.48 + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(SIDE, y, CONTENT_WIDTH, termsHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2 * scale);
    doc.setTextColor(111, 91, 177);
    doc.text('COMMERCIAL TERMS', SIDE + 5, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(termsSize);
    doc.setTextColor(51, 65, 85);
    doc.text(termsLines, SIDE + 5, y + 10, { lineHeightFactor: 1.05 });
    addField('Commercial Terms', quote.disclaimerNotice, SIDE + 5, y + 7, CONTENT_WIDTH - 10, termsHeight - 9, true);
    y += termsHeight + 4;
  }

  if (type === 'order') {
    const noteLines = order.instructions.trim() ? wrap(order.instructions, CONTENT_WIDTH - 12, bodyFont) : [''];
    const noteHeight = Math.max(13, noteLines.length * lineHeight + 8);
    doc.setFillColor(242, 247, 255);
    doc.setDrawColor(211, 222, 244);
    doc.roundedRect(SIDE, y, CONTENT_WIDTH, noteHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2 * scale);
    doc.setTextColor(111, 91, 177);
    doc.text('ORDER INSTRUCTIONS', SIDE + 5, y + 5);
    addField('Order Instructions', order.instructions, SIDE + 5, y + 6, CONTENT_WIDTH - 10, noteHeight - 8, true);
    y += noteHeight + 4;
  }

  const hasDiscount = calc.discountAmount > 0;
  const leftRows: Array<[string, string]> = [['List subtotal', formatCurrencyVal(calc.subtotalOriginal, currency)]];
  if (hasDiscount) leftRows.push(['Discount', `−${formatCurrencyVal(calc.discountAmount, currency)}`]);
  leftRows.push([quote.discountSettings.billingCycle === 'monthly' ? 'Monthly total' : 'Annual total', formatCurrencyVal(calc.grandTotal, currency)]);
  if (calc.commitmentYears > 1) leftRows.push([`${calc.commitmentYears}-year contract value`, formatCurrencyVal(calc.multiYearTotal, currency)]);
  const payRows = [
    `Billing: ${quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`,
    `Schedule: ${calc.paymentScheduleStr}`,
    `Payment terms: ${type === 'order' ? order.paymentTerms : customer.paymentTerms}`,
  ];
  const summaryLineCount = Math.max(
    leftRows.length,
    ...payRows.map((line) => wrap(line, 78, 6.2 * scale).length + (payRows.indexOf(line) * 0.8)),
  );
  const summaryHeight = Math.max(29, 10 + Math.ceil(summaryLineCount) * (5 * scale));
  doc.setFillColor(237, 243, 255);
  doc.roundedRect(SIDE, y, CONTENT_WIDTH, summaryHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5 * scale);
  doc.setTextColor(91, 74, 159);
  doc.text('ORDER SUMMARY', SIDE + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2 * scale);
  doc.setTextColor(51, 65, 95);
  leftRows.forEach(([label, value], index) => {
    const rowY = y + 11 + index * 4.8 * scale;
    doc.text(label, SIDE + 5, rowY);
    doc.text(value, SIDE + 87, rowY, { align: 'right' });
  });
  doc.setDrawColor(183, 194, 220);
  doc.line(SIDE + 96, y + 5, SIDE + 96, y + summaryHeight - 5);
  doc.setFontSize(6.2 * scale);
  payRows.forEach((line, index) => doc.text(wrap(line, 78, 6.2 * scale), SIDE + 102, y + 11 + index * 5 * scale, { lineHeightFactor: 1.05 }));
  y += summaryHeight + 4;

  const creator: string[] = [
    quote.creatorContactInfo?.authorName || customer.preparedBy || 'TestGrid account team',
    quote.creatorContactInfo?.authorEmail || customer.preparedByEmail || '',
  ].filter(Boolean);
  const creatorHeight = drawCard(SIDE, y, CONTENT_WIDTH, 'Prepared by TestGrid', creator, 6.6 * scale);
  y += creatorHeight + 4;

  if (type === 'order') {
    const signatureHeight = 23;
    const cardWidth = (CONTENT_WIDTH - 4) / 2;
    drawSignatureCard(doc, addField, SIDE, y, cardWidth, signatureHeight, 'TESTGRID AUTHORIZED SIGNATURE', 'TestGrid Signature', 'TestGrid Signature Date');
    drawSignatureCard(doc, addField, SIDE + cardWidth + 4, y, cardWidth, signatureHeight, 'CUSTOMER AUTHORIZED SIGNATURE', 'Customer Signature', 'Customer Signature Date');
    y += signatureHeight + 3;
  }

  // Light, diagonal quote watermark sits below text and never obscures order fields.
  if (type === 'quote' && quote.watermarkSettings.enabled) {
    const opacity = Math.min(0.3, Math.max(0.02, quote.watermarkSettings.opacity ?? 0.08));
    const formApi = doc as any;
    const hasTransparency = typeof formApi.GState === 'function' && typeof doc.setGState === 'function';
    if (hasTransparency) doc.setGState(new formApi.GState({ opacity }));
    if (quote.watermarkSettings.mode === 'image' && quote.watermarkSettings.imageUrl) {
      try {
        const imageWidth = Math.min(140, quote.watermarkSettings.imageWidth || 100);
        const imageHeight = imageWidth * 0.4;
        doc.addImage(quote.watermarkSettings.imageUrl, 'PNG', (PAGE_WIDTH - imageWidth) / 2, (PAGE_HEIGHT - imageHeight) / 2, imageWidth, imageHeight, undefined, 'FAST');
      } catch (error) {
        warnings.push('Watermark image could not be embedded in the PDF.');
      }
    } else {
      const rgb = hexToRgb(quote.watermarkSettings.color || '#7283bd');
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(Math.min(30, Math.max(16, quote.watermarkSettings.fontSize || 18)));
      const angle = quote.watermarkSettings.angle ?? 20;
      doc.text(quote.watermarkSettings.text || 'TESTGRID · CONFIDENTIAL', PAGE_WIDTH / 2, 150, { align: 'center', angle });
      if (quote.watermarkSettings.subtext) {
        doc.setFontSize(10);
        doc.text(quote.watermarkSettings.subtext, PAGE_WIDTH / 2, 160, { align: 'center', angle });
      }
    }
    if (hasTransparency) doc.setGState(new formApi.GState({ opacity: 1 }));
  }

  const fieldNames = [...fields];
  const requiredFields: string[] = type === 'order'
    ? ['Invoice Number', 'Purchase Order Number', 'Billing Address', 'Service Address', 'Order Instructions', 'TestGrid Signature', 'Customer Signature', 'TestGrid Signature Date', 'Customer Signature Date']
    : ['Quote Number', 'Customer Name', 'Customer Email', 'Commercial Terms'];
  if (type === 'order') requiredFields.push('Order Payment Terms');
  // Validate actual AcroForm fields before enabling download.
  const actualFields = ((doc as any).internal?.acroformPlugin?.acroFormDictionaryRoot?.Fields || []) as Array<{ fieldName?: string }>;
  const verifiedNames = actualFields.map((field) => field.fieldName).filter(Boolean) as string[];
  const missingFields = requiredFields.filter((name) => !verifiedNames.includes(name));
  if (missingFields.length) warnings.push(`Missing editable PDF fields: ${missingFields.join(', ')}.`);

  const pageCount = (doc as any).internal.getNumberOfPages() as number;
  const pageWidthMm = doc.internal.pageSize.getWidth();
  const pageHeightMm = doc.internal.pageSize.getHeight();
  const hasFieldBoundsWarning = warnings.some((warning) => warning.includes('falls outside the printable content area'));
  const overflow = pageCount !== 1 || y > FOOTER_TOP || Math.abs(pageWidthMm - 210) > 0.1 || Math.abs(pageHeightMm - 297) > 0.1 || missingFields.length > 0 || hasFieldBoundsWarning;
  if (density === 'compact') warnings.push('Compact layout uses smaller table type and tighter spacing.');
  if (pageCount !== 1) warnings.push(`Content produced ${pageCount} pages; the export must fit on one A4 page.`);
  if (y > FOOTER_TOP) warnings.push(`Content extends ${Math.ceil(y - FOOTER_TOP)} mm into the reserved footer. Choose a tighter layout or shorten long fields.`);
  if (Math.abs(pageWidthMm - 210) > 0.1 || Math.abs(pageHeightMm - 297) > 0.1) warnings.push('The generated page size is not A4 portrait.');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(153, 27, 27);
  const privacy = doc.splitTextToSize(PRIVACY_CONFIDENTIALITY_NOTICE, CONTENT_WIDTH);
  doc.text(privacy, PAGE_WIDTH / 2, 285, { align: 'center', lineHeightFactor: 1.08 });

  if (overflow) return { pageCount, pageWidthMm, pageHeightMm, fieldNames: verifiedNames, fitsOnePage: false, warnings, density };
  const customerFileName = customer.customerName.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Customer';
  const fileDate = (type === 'order' ? order.orderDate : customer.date) || new Date().toISOString().slice(0, 10);
  const base = `${customerFileName}_${type === 'order' ? 'Sales_Order_Form' : 'Quote'}_${fileDate}`;
  doc.setProperties({ title: base, subject: `TestGrid ${type === 'order' ? 'sales order' : 'commercial quote'}` });
  return { blob: doc.output('blob'), pageCount, pageWidthMm, pageHeightMm, fieldNames: verifiedNames, fitsOnePage: true, warnings, density };
}

function drawAddressCard(
  doc: jsPDF,
  addField: (name: string, value: string, x: number, y: number, width: number, height: number, multiline?: boolean) => void,
  wrap: (value: string, width: number, size?: number) => string[],
  x: number,
  y: number,
  width: number,
  label: string,
  fieldName: string,
  address: string,
  fontSize: number,
): number {
  const lines = wrap(address, width - 10, fontSize);
  const height = Math.max(19, 11 + lines.length * (fontSize * 0.48) + 3);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(148, 110, 45);
  doc.text(label.toUpperCase(), x + 5, y + 5.5);
  addField(fieldName, address, x + 5, y + 7, width - 10, height - 9, true);
  return height;
}

function drawSignatureCard(
  doc: jsPDF,
  addField: (name: string, value: string, x: number, y: number, width: number, height: number, multiline?: boolean) => void,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  field: string,
  dateField: string,
): void {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.6);
  doc.setTextColor(51, 65, 85);
  doc.text(title, x + 4, y + 5);
  addField(field, '', x + 4, y + 7, width - 8, 8);
  doc.setDrawColor(100, 116, 139);
  doc.line(x + 4, y + 15, x + width - 4, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text('Signature / printed name', x + 4, y + 19);
  doc.text('Date', x + width - 24, y + 19);
  addField(dateField, '', x + width - 21, y + 16, 17, 5);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;
  const number = parseInt(expanded, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function drawGradient(doc: jsPDF, x: number, y: number, width: number, height: number, stops: Array<[number, number, number]>): void {
  const steps = 100;
  for (let step = 0; step < steps; step += 1) {
    const progress = step / (steps - 1);
    const scaled = progress * (stops.length - 1);
    const segment = Math.min(stops.length - 2, Math.floor(scaled));
    const local = scaled - segment;
    const color = stops[segment].map((channel, index) => Math.round(channel + (stops[segment + 1][index] - channel) * local));
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x + (width * step) / steps, y, width / steps + 0.06, height, 'F');
  }
}

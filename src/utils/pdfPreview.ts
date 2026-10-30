import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PROPOSAL_THEMES } from '../data/themes';
import { QuoteData, SalesOrderData } from '../types';
import { calculateQuoteLineItems, formatCurrencyVal } from './exportUtils';

export type PdfDensity = 'compact' | 'balanced' | 'roomy';

export interface PdfPreviewResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  editableFieldCount: number;
  fitsOnePage: boolean;
  warnings: string[];
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const SIDE = 14;
const CONTENT_WIDTH = PAGE_WIDTH - SIDE * 2;
const FOOTER_TOP = 278;

export function buildPdfPreview(
  quote: QuoteData,
  type: 'quote' | 'order',
  density: PdfDensity
): PdfPreviewResult {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const order: SalesOrderData = quote.salesOrder ?? {
    id: `order-${quote.id}`,
    sourceQuoteId: quote.id,
    invoiceNumber: '',
    orderDate: '',
    purchaseOrderNumber: '',
    paymentTerms: quote.customerInfo.paymentTerms,
    billingAddress: '',
    serviceAddress: '',
    instructions: '',
  };
  const calc = calculateQuoteLineItems(quote);
  const customer = quote.customerInfo;
  const currency = customer.currency || 'USD';
  const theme = PROPOSAL_THEMES[quote.themePreset || 'slate-teal'];
  const [primaryR, primaryG, primaryB] = hexToRgb(theme.headerBg);
  const [accentR, accentG, accentB] = hexToRgb(theme.accentColor);
  const scale = density === 'compact' ? 0.86 : density === 'roomy' ? 1.12 : 1;
  const warnings: string[] = [];
  let editableFieldCount = 0;

  const addField = (
    name: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number,
    multiline = false
  ) => {
    if (x < SIDE || y < 0 || x + width > PAGE_WIDTH - SIDE || y + height > FOOTER_TOP) {
      warnings.push(`Editable field "${name}" falls outside the printable area.`);
    }

    const formApi = doc as unknown as {
      AcroForm: { TextField: new () => {
        fieldName: string;
        value: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontSize: number;
        multiline: boolean;
        borderWidth: number;
        backgroundColor: string;
        color: string;
      } };
    };
    const field = new formApi.AcroForm.TextField();
    field.fieldName = name;
    field.value = value || '';
    field.x = x;
    field.y = y;
    field.width = width;
    field.height = height;
    field.fontSize = Math.max(5, 6.4 * scale);
    field.multiline = multiline;
    field.borderWidth = 0;
    field.backgroundColor = '#f8fafc';
    field.color = '#0f172a';
    doc.addField(field);
    editableFieldCount += 1;
  };

  const addTextFieldCard = (
    label: string,
    name: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number,
    multiline = false
  ) => {
    drawCard(doc, x, y, width, height, label, [primaryR, primaryG, primaryB]);
    addField(name, value, x + 4, y + 8, width - 8, height - 11, multiline);
  };

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, PAGE_WIDTH, 23, 'F');
  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(0, 22, PAGE_WIDTH, 1.1, 'F');
  drawGradient(doc, 0, 23.1, PAGE_WIDTH, 1, [
    [primaryR, primaryG, primaryB],
    [accentR, accentG, accentB],
    [236, 72, 153],
  ]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(primaryR, primaryG, primaryB);
  doc.text('TestGrid', SIDE, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ENTERPRISE TESTING SOLUTIONS', SIDE, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryR, primaryG, primaryB);
  doc.text(type === 'order' ? 'SALES ORDER' : 'COMMERCIAL QUOTE', PAGE_WIDTH - SIDE, 14, {
    align: 'right',
  });

  let y = 31;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12 * scale);
  doc.setTextColor(15, 23, 42);
  doc.text(type === 'order' ? 'Sales order' : 'Commercial quote', SIDE, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5 * scale);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${type === 'order' ? 'Order' : 'Issue'} date · ${
      type === 'order' ? order.orderDate || '—' : customer.date || '—'
    }`,
    PAGE_WIDTH - SIDE,
    y,
    { align: 'right' }
  );
  y += 5;

  const cardWidth = (CONTENT_WIDTH - 4) / 2;
  const customerName = [customer.customerName, customer.customerOrganization, customer.customerEmail]
    .filter(Boolean)
    .join('\n');
  const providerName = customer.companyName || 'TestGrid';
  const preparedBy = [
    customer.preparedBy,
    customer.preparedByTitle,
    customer.preparedByEmail,
  ].filter(Boolean).join('\n');
  const customerCardHeight = 30 * scale;
  drawCard(doc, SIDE, y, cardWidth, customerCardHeight, 'Customer', [primaryR, primaryG, primaryB]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6 * scale);
  doc.setTextColor(51, 65, 85);
  doc.text(wrap(doc, customerName || '—', cardWidth - 10, 6.6 * scale), SIDE + 5, y + 11);
  addField('Customer Name', customer.customerName, SIDE + 5, y + 10, cardWidth - 10, 5);
  addField('Customer Email', customer.customerEmail, SIDE + 5, y + 17, cardWidth - 10, 5);

  const metaX = SIDE + cardWidth + 4;
  drawCard(doc, metaX, y, cardWidth, customerCardHeight, 'Provider & prepared by', [
    primaryR,
    primaryG,
    primaryB,
  ]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.6 * scale);
  doc.setTextColor(51, 65, 85);
  doc.text(providerName, metaX + 5, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    wrap(doc, preparedBy || '—', cardWidth - 10, 6.2 * scale),
    metaX + 5,
    y + 16
  );

  const metadata = type === 'order'
    ? [
        `Invoice: ${order.invoiceNumber || '—'}`,
        `PO: ${order.purchaseOrderNumber || 'Pending'}`,
        `Payment terms: ${order.paymentTerms || '—'}`,
      ]
    : [
        `Quote: ${customer.quoteNumber || '—'}`,
        `Validity: ${customer.validityDays || '—'}`,
        `Payment terms: ${customer.paymentTerms || '—'}`,
      ];
  doc.setFontSize(5.8 * scale);
  doc.text(metadata.join('   ·   '), metaX + 5, y + 25);
  if (type === 'order') {
    addField('Invoice Number', order.invoiceNumber, metaX + 5, y + 7, cardWidth - 10, 4.5);
    addField('Purchase Order Number', order.purchaseOrderNumber, metaX + 5, y + 13, cardWidth - 10, 4.5);
    addField('Order Payment Terms', order.paymentTerms, metaX + 5, y + 19, cardWidth - 10, 4.5);
  } else {
    addField('Quote Number', customer.quoteNumber, metaX + 5, y + 7, cardWidth - 10, 4.5);
  }
  y += customerCardHeight + 4;

  if (type === 'order') {
    const addressHeight = 23 * scale;
    addTextFieldCard('Bill to', 'Billing Address', order.billingAddress || customer.customerOrganization || customer.customerName, SIDE, y, cardWidth, addressHeight, true);
    addTextFieldCard('Service / ship to', 'Service Address', order.serviceAddress || 'Same as bill-to', metaX, y, cardWidth, addressHeight, true);
    y += addressHeight + 4;
  }

  const tableRows = calc.lineItems.length
    ? calc.lineItems.map((item) => [
        `${item.label}${!item.isDiscountable ? ' (Discount exempt)' : ''}${item.note ? `\n${item.note}` : ''}`,
        String(item.qty),
        formatCurrencyVal(item.unitCostDiscounted, currency),
        formatCurrencyVal(item.totalDiscounted, currency),
      ])
    : [['No products or services selected', '0', formatCurrencyVal(0, currency), formatCurrencyVal(0, currency)]];
  autoTable(doc, {
    startY: y,
    margin: { left: SIDE, right: SIDE, top: 24, bottom: PAGE_HEIGHT - FOOTER_TOP },
    head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT']],
    body: tableRows,
    theme: 'grid',
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    headStyles: {
      fillColor: [primaryR, primaryG, primaryB],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.5 * scale,
      cellPadding: 1.5 * scale,
    },
    styles: {
      font: 'helvetica',
      fontSize: 6.2 * scale,
      cellPadding: 1.35 * scale,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 101 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 31, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });
  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 4;

  const termsText = type === 'order' ? order.instructions : quote.disclaimerNotice;
  if (termsText.trim()) {
    const termsLines = wrap(doc, termsText, CONTENT_WIDTH - 10, 6.2 * scale);
    const termsHeight = Math.max(17, 10 + termsLines.length * 3.2 * scale);
    addTextFieldCard(
      type === 'order' ? 'Order instructions' : 'Commercial terms',
      type === 'order' ? 'Order Instructions' : 'Commercial Terms',
      termsText,
      SIDE,
      y,
      CONTENT_WIDTH,
      termsHeight,
      true
    );
    y += termsHeight + 4;
  }

  const summaryHeight = 34 * scale;
  drawCard(doc, SIDE, y, CONTENT_WIDTH, summaryHeight, 'Order summary', [
    primaryR,
    primaryG,
    primaryB,
  ]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4 * scale);
  doc.setTextColor(51, 65, 85);
  const totalLabel = quote.discountSettings.billingCycle === 'monthly' ? 'Monthly total' : 'Annual total';
  doc.text(`List subtotal  ${formatCurrencyVal(calc.subtotalOriginal, currency)}`, SIDE + 5, y + 12);
  if (calc.discountAmount > 0) {
    doc.text(`Discount  −${formatCurrencyVal(calc.discountAmount, currency)}`, SIDE + 5, y + 18);
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryR, primaryG, primaryB);
  doc.text(`${totalLabel}  ${formatCurrencyVal(calc.grandTotal, currency)}`, SIDE + 5, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6 * scale);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Billing: ${quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`,
    SIDE + 110,
    y + 11
  );
  doc.text(`Schedule: ${calc.paymentScheduleStr}`, SIDE + 110, y + 17);
  doc.text(
    `Installment: ${formatCurrencyVal(calc.installmentAmount, currency)} · ${calc.installmentLabel}`,
    SIDE + 110,
    y + 23
  );
  doc.text(
    calc.commitmentYears > 1
      ? `${calc.commitmentYears}-year value: ${formatCurrencyVal(calc.multiYearTotal, currency)}`
      : `Terms: ${customer.paymentTerms || '—'}`,
    SIDE + 110,
    y + 29
  );
  y += summaryHeight + 4;

  if (type === 'order') {
    const signatureWidth = (CONTENT_WIDTH - 4) / 2;
    drawSignatureCard(doc, SIDE, y, signatureWidth, 'Provider authorization', primaryR, primaryG, primaryB);
    drawSignatureCard(doc, SIDE + signatureWidth + 4, y, signatureWidth, 'Customer authorization', primaryR, primaryG, primaryB);
    y += 25;
  }

  if (quote.watermarkSettings.enabled) {
    drawWatermark(doc, quote, warnings);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `TestGrid · ${type === 'order' ? 'Sales order' : 'Commercial quote'} · ${customer.quoteNumber || ''}`,
    PAGE_WIDTH / 2,
    286,
    { align: 'center' }
  );

  const pageCount = doc.getNumberOfPages();
  const fitsOnePage = pageCount === 1 && y <= FOOTER_TOP && warnings.length === 0;
  if (pageCount !== 1) warnings.push(`This layout requires ${pageCount} pages; choose tighter spacing or shorten the content.`);
  if (y > FOOTER_TOP) warnings.push('Content extends into the reserved footer area; choose tighter spacing or shorten the content.');
  const name = customer.customerName.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Customer';
  const date = (type === 'order' ? order.orderDate : customer.date) || new Date().toISOString().slice(0, 10);
  const filename = `${name}_${type === 'order' ? 'Sales_Order_Form' : 'Quote'}_${date}.pdf`;
  return {
    blob: doc.output('blob'),
    filename,
    pageCount,
    editableFieldCount,
    fitsOnePage,
    warnings,
  };
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  color: [number, number, number]
): void {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(label.toUpperCase(), x + 5, y + 5.5);
}

function drawSignatureCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  r: number,
  g: number,
  b: number
): void {
  drawCard(doc, x, y, width, 22, label, [r, g, b]);
  doc.setDrawColor(100, 116, 139);
  doc.line(x + 4, y + 13, x + width - 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Signature / printed name', x + 4, y + 18);
  const formApi = doc as unknown as {
    AcroForm: { TextField: new () => {
      fieldName: string;
      value: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      borderWidth: number;
    } };
  };
  const field = new formApi.AcroForm.TextField();
  field.fieldName = label.replace(/\W+/g, '_');
  field.value = '';
  field.x = x + 4;
  field.y = y + 7;
  field.width = width - 8;
  field.height = 6;
  field.fontSize = 6;
  field.borderWidth = 0;
  doc.addField(field);
}

function drawWatermark(doc: jsPDF, quote: QuoteData, warnings: string[]): void {
  try {
    const transparencyApi = doc as unknown as {
      GState?: new (options: { opacity: number }) => unknown;
      setGState?: (state: unknown) => void;
    };
    let opacity = quote.watermarkSettings.opacity;
    if (typeof opacity !== 'number' || Number.isNaN(opacity)) opacity = 0.18;
    if (opacity > 1) opacity /= 100;
    if (opacity <= 0) opacity = 0.18;
    opacity = Math.max(0.12, Math.min(0.28, opacity));
    if (transparencyApi.GState && transparencyApi.setGState) {
      transparencyApi.setGState(
        new transparencyApi.GState({ opacity: Math.min(0.3, Math.max(0.02, opacity || 0.08)) })
      );
    }

    if (quote.watermarkSettings.mode === 'image' && quote.watermarkSettings.imageUrl) {
      const width = Math.min(140, quote.watermarkSettings.imageWidth || 100);
      doc.addImage(
        quote.watermarkSettings.imageUrl,
        'PNG',
        (PAGE_WIDTH - width) / 2,
        125,
        width,
        width * 0.4,
        undefined,
        'FAST'
      );
    } else {
      const [r, g, b] = hexToRgb(quote.watermarkSettings.color || '#7283bd');
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text(quote.watermarkSettings.text || 'TESTGRID · CONFIDENTIAL', PAGE_WIDTH / 2, 150, {
        align: 'center',
        angle: quote.watermarkSettings.angle ?? -20,
      });
      if (quote.watermarkSettings.subtext) {
        doc.setFontSize(13);
        doc.text(quote.watermarkSettings.subtext, PAGE_WIDTH / 2, 160, {
          align: 'center',
          angle: quote.watermarkSettings.angle ?? -20,
        });
      }
    }

    if (transparencyApi.GState && transparencyApi.setGState) {
      transparencyApi.setGState(new transparencyApi.GState({ opacity: 1 }));
    }
  } catch {
    warnings.push('The watermark could not be included in the PDF preview.');
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;
  const value = Number.parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function drawGradient(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  stops: Array<[number, number, number]>
): void {
  const steps = 80;
  for (let step = 0; step < steps; step += 1) {
    const progress = step / (steps - 1);
    const segmentPosition = progress * (stops.length - 1);
    const segment = Math.min(stops.length - 2, Math.floor(segmentPosition));
    const mix = segmentPosition - segment;
    const color = stops[segment].map((channel, index) =>
      Math.round(channel + (stops[segment + 1][index] - channel) * mix)
    );
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x + (width * step) / steps, y, width / steps + 0.05, height, 'F');
  }
}

function wrap(doc: jsPDF, value: string, width: number, fontSize: number): string[] {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(value || '—', width) as string[];
}

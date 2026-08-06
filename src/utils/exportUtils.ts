import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { QuoteData, QuoteCalculatedLineItem } from '../types';
import { CURRENCIES } from '../data/defaults';
import { PROPOSAL_THEMES } from '../data/themes';

// Utility currency formatter
export function formatCurrencyVal(amount: number, currencyCode: string = 'USD'): string {
  const currencyObj = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const symbol = currencyObj ? currencyObj.symbol : '$';
  return (
    symbol +
    ' ' +
    Math.round(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// Convert Hex Color to RGB tuple for jsPDF
function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((char) => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function calculateQuoteLineItems(quote: QuoteData): {
  lineItems: QuoteCalculatedLineItem[];
  subtotalOriginal: number;
  subtotalDiscounted: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  effectiveDiscountRate: number;
  annualValue: number;
  multiYearTotal: number;
  commitmentYears: number;
  paymentScheduleStr: string;
  installmentAmount: number;
  installmentLabel: string;
} {
  const isMonthly = quote.discountSettings.billingCycle === 'monthly';
  const globalDiscountRate = isMonthly ? 0 : (quote.discountSettings.rate || 0) / 100;
  const excludedSet = new Set(quote.excludedLineItemIds || []);
  const lineItems: QuoteCalculatedLineItem[] = [];

  let subtotalOriginal = 0;
  let subtotalDiscounted = 0;

  // Process Tiers
  quote.plans.forEach((plan) => {
    if (plan.hidden) return;
    plan.tiers.forEach((tier) => {
      // Device Licenses
      if (tier.deviceQty > 0) {
        const itemId = `${tier.id}-device`;
        if (!excludedSet.has(itemId)) {
          const isDiscountable = tier.deviceDiscountable !== false;
          const discountRate = isDiscountable ? globalDiscountRate : 0;

          const origUnit = tier.deviceCost || 0;
          const discUnit = origUnit * (1 - discountRate);
          const origTotal = origUnit * tier.deviceQty;
          const discTotal = discUnit * tier.deviceQty;

          subtotalOriginal += origTotal;
          subtotalDiscounted += discTotal;

          lineItems.push({
            id: itemId,
            type: 'tier-device',
            label: `${plan.title} · ${tier.label || 'Tier'} (Device Licence(s))`,
            note: tier.note,
            qty: tier.deviceQty,
            unitCostOriginal: origUnit,
            unitCostDiscounted: discUnit,
            totalOriginal: origTotal,
            totalDiscounted: discTotal,
            isDiscountable,
            sourceRef: tier.id,
          });
        }
      }

      // Browser Licenses
      if (tier.browserQty > 0) {
        const itemId = `${tier.id}-browser`;
        if (!excludedSet.has(itemId)) {
          const isDiscountable = tier.browserDiscountable !== false;
          const discountRate = isDiscountable ? globalDiscountRate : 0;

          const origUnit = tier.browserCost || 0;
          const discUnit = origUnit * (1 - discountRate);
          const origTotal = origUnit * tier.browserQty;
          const discTotal = discUnit * tier.browserQty;

          subtotalOriginal += origTotal;
          subtotalDiscounted += discTotal;

          lineItems.push({
            id: itemId,
            type: 'tier-browser',
            label: `${plan.title} · ${tier.label || 'Tier'} (Browser Licence(s))`,
            note: tier.note,
            qty: tier.browserQty,
            unitCostOriginal: origUnit,
            unitCostDiscounted: discUnit,
            totalOriginal: origTotal,
            totalDiscounted: discTotal,
            isDiscountable,
            sourceRef: tier.id,
          });
        }
      }

      // Concurrent Channels
      if (tier.concurrentQty && tier.concurrentQty > 0) {
        const itemId = `${tier.id}-concurrent`;
        if (!excludedSet.has(itemId)) {
          const isDiscountable = tier.concurrentDiscountable !== false;
          const discountRate = isDiscountable ? globalDiscountRate : 0;

          const origUnit = tier.concurrentCost || 0;
          const discUnit = origUnit * (1 - discountRate);
          const origTotal = origUnit * tier.concurrentQty;
          const discTotal = discUnit * tier.concurrentQty;

          subtotalOriginal += origTotal;
          subtotalDiscounted += discTotal;

          lineItems.push({
            id: itemId,
            type: 'tier-concurrent',
            label: `${plan.title} · ${tier.label || 'Tier'} (Concurrent Channels)`,
            note: tier.note,
            qty: tier.concurrentQty,
            unitCostOriginal: origUnit,
            unitCostDiscounted: discUnit,
            totalOriginal: origTotal,
            totalDiscounted: discTotal,
            isDiscountable,
            sourceRef: tier.id,
          });
        }
      }
    });
  });

  // Process Add-ons
  if (quote.showAddonsSection !== false) {
    quote.addons.forEach((addon) => {
      if (addon.selected && addon.cost > 0) {
        const itemId = addon.id;
        if (!excludedSet.has(itemId)) {
          const isDiscountable = addon.discountable !== false;
          const discountRate = isDiscountable ? globalDiscountRate : 0;

          const qty = addon.qty || 1;
          const origUnit = addon.cost;
          const discUnit = origUnit * (1 - discountRate);
          const origTotal = origUnit * qty;
          const discTotal = discUnit * qty;

          subtotalOriginal += origTotal;
          subtotalDiscounted += discTotal;

          lineItems.push({
            id: itemId,
            type: 'addon',
            label: `Add-On · ${addon.label}`,
            qty: qty,
            unitCostOriginal: origUnit,
            unitCostDiscounted: discUnit,
            totalOriginal: origTotal,
            totalDiscounted: discTotal,
            isDiscountable,
            sourceRef: addon.id,
          });
        }
      }
    });
  }

  // Process Custom Professional Services
  if (quote.showServicesSection !== false) {
    quote.customServices.forEach((service) => {
      if (service.cost > 0 && service.qty > 0) {
        const itemId = service.id;
        if (!excludedSet.has(itemId)) {
          const isDiscountable = service.discountable !== false;
          const discountRate = isDiscountable ? globalDiscountRate : 0;

          const origUnit = service.cost;
          const discUnit = origUnit * (1 - discountRate);
          const origTotal = origUnit * service.qty;
          const discTotal = discUnit * service.qty;

          subtotalOriginal += origTotal;
          subtotalDiscounted += discTotal;

          lineItems.push({
            id: itemId,
            type: 'custom-service',
            label: `Service · ${service.description} (${service.billingType})`,
            qty: service.qty,
            unitCostOriginal: origUnit,
            unitCostDiscounted: discUnit,
            totalOriginal: origTotal,
            totalDiscounted: discTotal,
            isDiscountable,
            sourceRef: service.id,
          });
        }
      }
    });
  }

  const discountAmount = subtotalOriginal - subtotalDiscounted;
  const taxAmount = 0;
  const grandTotal = subtotalDiscounted;
  const effectiveDiscountRate = subtotalOriginal > 0 ? (discountAmount / subtotalOriginal) * 100 : 0;

  const commitmentYears = quote.discountSettings.commitmentYears || 1;
  const paymentScheduleStr = quote.discountSettings.paymentSchedule || 'Annually';

  const annualValue = isMonthly ? grandTotal * 12 : grandTotal;
  const multiYearTotal = annualValue * commitmentYears;

  // Installment calculations
  let installmentAmount = annualValue;
  let installmentLabel = 'Annual Payment';

  switch (paymentScheduleStr) {
    case 'Upfront':
      installmentAmount = multiYearTotal;
      installmentLabel = 'Full Contract Upfront Payment';
      break;
    case 'Bi-annually':
      installmentAmount = annualValue / 2;
      installmentLabel = 'Semi-Annual Installment (2x/yr)';
      break;
    case 'Quarterly':
      installmentAmount = annualValue / 4;
      installmentLabel = 'Quarterly Installment (4x/yr)';
      break;
    case 'Monthly':
      installmentAmount = annualValue / 12;
      installmentLabel = 'Monthly Installment (12x/yr)';
      break;
    case 'Annually':
    default:
      installmentAmount = annualValue;
      installmentLabel = 'Annual Installment (1x/yr)';
      break;
  }

  return {
    lineItems,
    subtotalOriginal,
    subtotalDiscounted,
    discountAmount,
    taxAmount,
    grandTotal,
    effectiveDiscountRate,
    annualValue,
    multiYearTotal,
    commitmentYears,
    paymentScheduleStr,
    installmentAmount,
    installmentLabel,
  };
}

// 1. EDITABLE VECTOR PDF EXPORT WITH THEME & WATERMARK SUPPORT
export function exportToPdf(quote: QuoteData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const creator = quote.creatorContactInfo;
  const themeKey = quote.themePreset || 'slate-teal';
  const theme = PROPOSAL_THEMES[themeKey] || PROPOSAL_THEMES['slate-teal'];
  const primaryRgb = hexToRgb(theme.primaryColor);
  const accentRgb = hexToRgb(theme.accentColor);

  // Draw Watermark on Page
  const drawWatermark = () => {
    if (!quote.watermarkSettings.enabled) return;

    doc.saveGraphicsState();
    if (quote.watermarkSettings.mode === 'image' && quote.watermarkSettings.imageUrl) {
      try {
        // Draw image watermark centered
        const imgWidth = quote.watermarkSettings.imageWidth || 100;
        const imgHeight = imgWidth * 0.4;
        const xPos = (210 - imgWidth) / 2;
        const yPos = (297 - imgHeight) / 2;
        
        doc.addImage(
          quote.watermarkSettings.imageUrl,
          'PNG',
          xPos,
          yPos,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      } catch (e) {
        console.warn('Failed to render image watermark in PDF', e);
      }
    } else {
      // Text Watermark
      const watermarkColor = hexToRgb(quote.watermarkSettings.color || theme.primaryColor);
      doc.setTextColor(watermarkColor[0], watermarkColor[1], watermarkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text(quote.watermarkSettings.text || 'CONFIDENTIAL ESTIMATE', 105, 140, {
        align: 'center',
        angle: quote.watermarkSettings.angle || -20,
      });
      if (quote.watermarkSettings.subtext) {
        doc.setFontSize(13);
        doc.text(quote.watermarkSettings.subtext, 105, 152, {
          align: 'center',
          angle: quote.watermarkSettings.angle || -20,
        });
      }
    }
    doc.restoreGraphicsState();
  };

  drawWatermark();

  // Draw Header Bar with Theme
  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(0, 0, 210, 26, 'F');

  // Embed Custom Logo if present, otherwise render clean brand text
  let headerTextX = 14;
  if (quote.customerInfo.logoUrl) {
    try {
      doc.addImage(quote.customerInfo.logoUrl, 'PNG', 12, 4, 38, 18, undefined, 'FAST');
      headerTextX = 54;
    } catch (e) {
      console.warn('Could not render logo in PDF', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(quote.customerInfo.companyName || 'TestGrid Labs Inc.', headerTextX, 16);

  doc.setFontSize(9);
  doc.setTextColor(220, 225, 235);
  doc.text('OFFICIAL COMMERCIAL PROPOSAL', 196, 16, { align: 'right' });

  // Metadata Block (Customer & Details)
  doc.setFontSize(8.5);
  doc.setTextColor(40, 45, 60);

  // Left Column (Customer)
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR:', 14, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${quote.customerInfo.customerName || 'N/A'}`, 14, 39);
  doc.text(`Customer Email: ${quote.customerInfo.customerEmail || 'N/A'}`, 14, 44);
  doc.text(`Vendor: ${quote.customerInfo.companyName || 'TestGrid Inc.'}`, 14, 49);

  // Right Column (Quote Metadata)
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTE METADATA:', 125, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote Ref #: ${quote.customerInfo.quoteNumber || 'TG-QUOTE'}`, 125, 39);
  doc.text(`Issue Date: ${quote.customerInfo.date}`, 125, 44);
  doc.text(`Validity Period: ${quote.customerInfo.validityDays}`, 125, 49);
  doc.text(`Prepared By: ${quote.customerInfo.preparedBy || 'Sales Engineering'}`, 125, 54);
  doc.text(`Billing Term: ${calc.commitmentYears} Yr(s) Commitment`, 125, 59);

  // Prepare Table Data
  const tableRows = calc.lineItems.map((item) => {
    const noteText = item.note ? `\nNote: ${item.note}` : '';
    const discountNote = !item.isDiscountable ? ' (Exempt from discount)' : '';
    return [
      `${item.label}${discountNote}${noteText}`,
      item.qty.toString(),
      formatCurrencyVal(item.unitCostDiscounted, currency),
      formatCurrencyVal(item.totalDiscounted, currency),
    ];
  });

  if (tableRows.length === 0) {
    tableRows.push(['No core licenses or add-ons selected', '0', '$0', '$0']);
  }

  // AutoTable
  // @ts-expect-error autoTable plugin attaches to jsPDF
  doc.autoTable({
    startY: 65,
    head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
    body: tableRows,
    headStyles: {
      fillColor: primaryRgb,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: [35, 40, 55],
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 30 },
    },
    didDrawPage: () => {
      drawWatermark();
    },
  });

  // @ts-expect-error autoTable stores finalY
  const finalY = (doc.lastAutoTable?.finalY || 120) + 6;

  // Financial & Payment Schedule Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, 182, 36, 2, 2, 'FD');

  // Left side: Investment Totals
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`Subtotal Original: ${formatCurrencyVal(calc.subtotalOriginal, currency)}`, 20, finalY + 8);
  if (calc.discountAmount > 0) {
    doc.text(`Annual Discount (${quote.discountSettings.rate}%): -${formatCurrencyVal(calc.discountAmount, currency)}`, 20, finalY + 14);
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text(`ANNUAL CONTRACT VALUE (ACV): ${formatCurrencyVal(calc.grandTotal, currency)} ${currency}`, 20, finalY + 23);

  if (calc.commitmentYears > 1) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 110, 130);
    doc.text(`Total Multi-Year Value (${calc.commitmentYears} Yrs): ${formatCurrencyVal(calc.multiYearTotal, currency)} ${currency}`, 20, finalY + 30);
  }

  // Right side: Payment Schedule & Installment Breakdown
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text(`PAYMENT SCHEDULE: ${calc.paymentScheduleStr.toUpperCase()}`, 115, finalY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`Schedule Type: ${calc.paymentScheduleStr}`, 115, finalY + 14);
  doc.text(`Installment Amount: ${formatCurrencyVal(calc.installmentAmount, currency)} ${currency}`, 115, finalY + 20);
  doc.text(`(${calc.installmentLabel})`, 115, finalY + 25);
  doc.text(`Payment Terms: ${quote.customerInfo.paymentTerms || 'Net 30 Days'}`, 115, finalY + 30);

  // Legal Disclaimer
  const disclaimerY = finalY + 42;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 130, 145);

  const disclaimerLines = doc.splitTextToSize(
    quote.disclaimerNotice || 'CONFIDENTIAL - TestGrid Pricing Proposal. Valid for 30 days.',
    182
  );
  doc.text(disclaimerLines, 14, disclaimerY);

  // Creator & Advisory Contact Information Block
  if (creator) {
    const footerY = disclaimerY + (disclaimerLines.length * 3) + 6;
    doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.rect(14, footerY, 182, 16, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`PROPOSAL ISSUED BY: ${creator.authorName}  ·  ${creator.authorRole} (${creator.department || 'Advisory'})`, 18, footerY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(225, 230, 240);
    doc.text(
      `Email: ${creator.authorEmail}   |   Phone: ${creator.authorPhone}   |   Web: ${creator.companyWebsite}   |   Support: ${creator.supportEmail}`,
      18,
      footerY + 11.5
    );
  }

  // Save PDF file
  const filename = `TestGrid_Quote_${quote.customerInfo.quoteNumber || 'Estimate'}_${
    quote.customerInfo.customerName ? quote.customerInfo.customerName.replace(/[^a-zA-Z0-9]/g, '_') : 'Client'
  }.pdf`;
  doc.save(filename);
}

// 2. WORD (.DOCX) EXPORT
export function exportToDocx(quote: QuoteData): void {
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const creator = quote.creatorContactInfo;

  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'ITEM DESCRIPTION', bold: true, color: 'FFFFFF', size: 18 })],
            }),
          ],
          shading: { fill: '2C3260' },
          width: { size: 55, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'QTY', bold: true, color: 'FFFFFF', size: 18 })],
            }),
          ],
          shading: { fill: '2C3260' },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'SUBTOTAL', bold: true, color: 'FFFFFF', size: 18 })],
            }),
          ],
          shading: { fill: '2C3260' },
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  calc.lineItems.forEach((item) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: item.label, bold: true, size: 18, color: '2C3260' }),
                  !item.isDiscountable ? new TextRun({ text: ' [Exempt from discount]', italics: true, size: 16, color: '94A3B8' }) : new TextRun({ text: '' }),
                  item.note ? new TextRun({ text: `\nNote: ${item.note}`, italics: true, size: 16, color: '64748B' }) : new TextRun({ text: '' }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: item.qty.toString(), size: 18 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: formatCurrencyVal(item.totalDiscounted, currency), bold: true, size: 18 })],
              }),
            ],
          }),
        ],
      })
    );
  });

  const docChildren: Paragraph[] | Table[] = [
    new Paragraph({
      children: [
        new TextRun({ text: `${quote.customerInfo.companyName || 'TestGrid Inc.'} `, bold: true, size: 32, color: '2C3260' }),
        new TextRun({ text: '· Commercial Pricing Proposal', size: 24, color: '52BFA3' }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Quote Reference: `, bold: true }),
        new TextRun({ text: quote.customerInfo.quoteNumber }),
        new TextRun({ text: `   |   Date: `, bold: true }),
        new TextRun({ text: quote.customerInfo.date }),
        new TextRun({ text: `   |   Validity: `, bold: true }),
        new TextRun({ text: quote.customerInfo.validityDays }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Customer Name: `, bold: true }),
        new TextRun({ text: quote.customerInfo.customerName || 'N/A' }),
        new TextRun({ text: `   |   Customer Email: `, bold: true }),
        new TextRun({ text: quote.customerInfo.customerEmail }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Prepared By: `, bold: true }),
        new TextRun({ text: `${quote.customerInfo.preparedBy}` }),
        new TextRun({ text: `   |   Schedule: `, bold: true }),
        new TextRun({ text: `${calc.commitmentYears} Year(s) (${calc.paymentScheduleStr} - ${formatCurrencyVal(calc.installmentAmount, currency)} / installment)` }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
        left: { style: BorderStyle.NONE, size: 0, color: 'AUTO' },
        right: { style: BorderStyle.NONE, size: 0, color: 'AUTO' },
        insideHorizontal: { style: BorderStyle.DASHED, size: 1, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'AUTO' },
      },
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Subtotal: ${formatCurrencyVal(calc.subtotalOriginal, currency)}`, size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Annual Discount (${quote.discountSettings.rate}%): -${formatCurrencyVal(calc.discountAmount, currency)}`, size: 20, color: '685DA7' })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Annual Contract Value (ACV): ${formatCurrencyVal(calc.grandTotal, currency)} ${currency}`, bold: true, size: 26, color: '2C3260' })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Payment Schedule (${calc.paymentScheduleStr}): ${formatCurrencyVal(calc.installmentAmount, currency)} / installment`, bold: true, size: 20, color: '52BFA3' })],
    }),
  ];

  if (calc.commitmentYears > 1) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `Total Multi-Year Value (${calc.commitmentYears} Yrs): ${formatCurrencyVal(calc.multiYearTotal, currency)} ${currency}`, italics: true, size: 20, color: '64748B' })],
      })
    );
  }

  docChildren.push(
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: quote.watermarkSettings.enabled ? `[ WATERMARK: ${quote.watermarkSettings.text} ]\n` : '', bold: true, size: 16, color: '94A3B8' }),
        new TextRun({ text: quote.disclaimerNotice, size: 16, color: '64748B' }),
      ],
    })
  );

  if (creator) {
    docChildren.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({ text: `Issued By: ${creator.authorName} (${creator.authorRole} - ${creator.department || 'Advisory'})\n`, bold: true, size: 18, color: '2C3260' }),
          new TextRun({ text: `Email: ${creator.authorEmail} | Phone: ${creator.authorPhone} | Website: ${creator.companyWebsite} | Support: ${creator.supportEmail}`, size: 16, color: '64748B' }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren as Paragraph[],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(
      blob,
      `TestGrid_Quote_${quote.customerInfo.quoteNumber || 'Estimate'}_${
        quote.customerInfo.customerName ? quote.customerInfo.customerName.replace(/[^a-zA-Z0-9]/g, '_') : 'Client'
      }.docx`
    );
  });
}

// 3. EXCEL (.XLSX) EXPORT
export function exportToExcel(quote: QuoteData): void {
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const creator = quote.creatorContactInfo;

  // Sheet 1: Executive Summary
  const summaryData = [
    ['TESTGRID PRICING ESTIMATE & QUOTE'],
    ['Quote Number', quote.customerInfo.quoteNumber],
    ['Customer Name', quote.customerInfo.customerName],
    ['Customer Email', quote.customerInfo.customerEmail],
    ['Company', quote.customerInfo.companyName],
    ['Prepared By', quote.customerInfo.preparedBy],
    ['Date', quote.customerInfo.date],
    ['Validity', quote.customerInfo.validityDays],
    ['Payment Terms', quote.customerInfo.paymentTerms],
    ['Currency', currency],
    ['Commitment Term', `${calc.commitmentYears} Year(s)`],
    ['Payment Schedule', calc.paymentScheduleStr],
    ['Installment Amount', calc.installmentAmount],
    [],
    ['FINANCIAL SUMMARY'],
    ['Original Subtotal', calc.subtotalOriginal],
    ['Discount Rate', `${quote.discountSettings.rate}%`],
    ['Discount Amount', calc.discountAmount],
    ['Annual Contract Value (ACV)', calc.grandTotal],
    ['Multi-Year Commitment Total', calc.multiYearTotal],
    [],
    ['WATERMARK BRANDING', quote.watermarkSettings.enabled ? quote.watermarkSettings.text : 'Disabled'],
  ];

  if (creator) {
    summaryData.push([]);
    summaryData.push(['CREATOR CONTACT INFO']);
    summaryData.push(['Author Name', creator.authorName]);
    summaryData.push(['Author Role', creator.authorRole]);
    summaryData.push(['Department', creator.department || 'Advisory']);
    summaryData.push(['Email', creator.authorEmail]);
    summaryData.push(['Phone', creator.authorPhone]);
    summaryData.push(['Website', creator.companyWebsite]);
    summaryData.push(['Support', creator.supportEmail]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Sheet 2: Itemized Line Items
  const itemsData = [
    ['Item Type', 'Description', 'Quantity', 'Unit Price Original', 'Unit Price Discounted', 'Total Discounted Price', 'Discount Eligible', 'Notes'],
  ];

  calc.lineItems.forEach((item) => {
    itemsData.push([
      item.type,
      item.label,
      item.qty.toString(),
      item.unitCostOriginal.toString(),
      item.unitCostDiscounted.toString(),
      item.totalDiscounted.toString(),
      item.isDiscountable ? 'Yes' : 'No',
      item.note || '',
    ]);
  });

  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Quote Summary');
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Line Items');

  const filename = `TestGrid_Quote_${quote.customerInfo.quoteNumber || 'Estimate'}_${
    quote.customerInfo.customerName ? quote.customerInfo.customerName.replace(/[^a-zA-Z0-9]/g, '_') : 'Client'
  }.xlsx`;

  XLSX.writeFile(workbook, filename);
}

// 4. GOOGLE SHEETS EXPORT / CSV COPY
export function exportToGoogleSheetsCSV(quote: QuoteData): { csvContent: string; tsvClipboard: string } {
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const creator = quote.creatorContactInfo;

  const rows = [
    ['TestGrid Commercial Proposal Export', '', '', '', ''],
    ['Quote Reference', quote.customerInfo.quoteNumber, '', 'Date', quote.customerInfo.date],
    ['Customer', quote.customerInfo.customerName, '', 'Prepared By', quote.customerInfo.preparedBy],
    ['Company', quote.customerInfo.companyName, '', 'Validity', quote.customerInfo.validityDays],
    ['Currency', currency, '', 'Terms', quote.customerInfo.paymentTerms],
    ['Commitment Term', `${calc.commitmentYears} Yr(s)`, '', 'Schedule', calc.paymentScheduleStr],
    ['Installment Amount', formatCurrencyVal(calc.installmentAmount, currency), '', 'Schedule Note', calc.installmentLabel],
    ['', '', '', '', ''],
    ['Item Description', 'Qty', 'Unit Price Original', 'Unit Price Discounted', 'Subtotal Discounted'],
  ];

  calc.lineItems.forEach((item) => {
    rows.push([
      item.label + (item.note ? ` (${item.note})` : '') + (!item.isDiscountable ? ' [Exempt]' : ''),
      item.qty.toString(),
      item.unitCostOriginal.toString(),
      item.unitCostDiscounted.toString(),
      item.totalDiscounted.toString(),
    ]);
  });

  rows.push(['', '', '', '', '']);
  rows.push(['Subtotal Original', '', '', '', calc.subtotalOriginal.toString()]);
  rows.push([`Discount (${quote.discountSettings.rate}%)`, '', '', '', (-calc.discountAmount).toString()]);
  rows.push(['Annual Contract Value (ACV)', '', '', '', calc.grandTotal.toString()]);
  if (calc.commitmentYears > 1) {
    rows.push([`Multi-Year Total (${calc.commitmentYears} Yrs)`, '', '', '', calc.multiYearTotal.toString()]);
  }

  if (creator) {
    rows.push(['', '', '', '', '']);
    rows.push(['Prepared By', creator.authorName, `${creator.authorRole} (${creator.department || 'Advisory'})`, creator.authorEmail, creator.companyWebsite]);
  }

  if (quote.watermarkSettings.enabled) {
    rows.push(['', '', '', '', '']);
    rows.push(['Watermark Note', quote.watermarkSettings.text, '', '', '']);
  }

  const csvContent = rows.map((r) => r.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const tsvClipboard = rows.map((r) => r.join('\t')).join('\n');

  return { csvContent, tsvClipboard };
}

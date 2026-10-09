import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteData, QuoteCalculatedLineItem, CreatorContactInfo } from '../types';
import { CURRENCIES } from '../data/defaults';

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
  let cleanHex = (hex || '#6366f1').replace('#', '');
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
  if (quote.plans) {
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
  }

  // Process Add-ons
  if (quote.showAddonsSection !== false && quote.addons) {
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
  if (quote.showServicesSection !== false && quote.customServices) {
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

// EDITABLE MODERN PREMIUM SALES PROPOSAL VECTOR PDF EXPORT
export function exportToPdf(quote: QuoteData): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const calc = calculateQuoteLineItems(quote);
    const currency = quote.customerInfo.currency || 'USD';

    // Ensure Creator Info has complete fallback data
    const creator: CreatorContactInfo = quote.creatorContactInfo || {
      authorName: quote.customerInfo.preparedBy || 'TestGrid Solutions Advisory',
      authorRole: quote.customerInfo.preparedByTitle || 'Senior Enterprise Solutions Architect',
      department: 'Solutions Engineering & Advisory',
      authorEmail: quote.customerInfo.preparedByEmail || 'sales@testgrid.io',
      authorPhone: '+1 (800) 555-8378',
      companyWebsite: 'https://testgrid.io',
      supportEmail: 'support@testgrid.io',
    };

    // Compact single-page A4, with editable AcroForm fields for client-facing details.
    const formApi = doc as any;
    const addField = (name: string, value: string, x: number, y: number, w: number, h: number, fontSize = 8) => {
      try {
        if (!formApi.AcroForm || !formApi.AcroForm.TextField) return;
        const field = new formApi.AcroForm.TextField();
        field.fieldName = name;
        field.value = value || '';
        field.x = x; field.y = y; field.width = w; field.height = h;
        field.fontSize = fontSize;
        field.borderWidth = 0;
        field.backgroundColor = [255, 255, 255];
        field.color = [15, 23, 42];
        doc.addField(field);
      } catch (error) { console.warn(`Could not add editable PDF field: ${name}`, error); }
    };
    // Premium navy and restrained brass palette.
    const primaryRgb: [number, number, number] = [15, 23, 42]; // Slate 900
    const headerBlueRgb: [number, number, number] = [30, 41, 59]; // Slate Navy Header
    const accentPurpleRgb: [number, number, number] = [176, 139, 72];
    const accentTealRgb: [number, number, number] = [224, 190, 120];
    const accentPinkRgb: [number, number, number] = [176, 139, 72];

    // Helper: Draw Header Bar on any page
    const drawPageHeader = (pdfDoc: jsPDF) => {
      // Header dark slate base
      pdfDoc.setFillColor(headerBlueRgb[0], headerBlueRgb[1], headerBlueRgb[2]);
      pdfDoc.rect(0, 0, 210, 22, 'F');

      // Title Brand
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(255, 255, 255);
      pdfDoc.text('TestGrid', 14, 14);

      pdfDoc.setFontSize(9);
      pdfDoc.setTextColor(accentTealRgb[0], accentTealRgb[1], accentTealRgb[2]);
      pdfDoc.text('ENTERPRISE', 14, 19);

      pdfDoc.setFontSize(8.5);
      pdfDoc.setTextColor(226, 232, 240);
      pdfDoc.text('SALES ORDER QUOTE', 196, 14, { align: 'right' });

      // Multi-color modern gradient accent bar (Blue -> Purple -> Pink -> Teal)
      pdfDoc.setFillColor(59, 130, 246); // Blue
      pdfDoc.rect(0, 22, 210, 1, 'F');
      pdfDoc.setFillColor(139, 92, 246); // Purple
      pdfDoc.rect(52.5, 22, 52.5, 1, 'F');
      pdfDoc.setFillColor(236, 72, 153); // Pink
      pdfDoc.rect(105, 22, 52.5, 1, 'F');
      pdfDoc.setFillColor(20, 184, 166); // Teal
      pdfDoc.rect(157.5, 22, 52.5, 1, 'F');
    };

    // Draw Page 1 Header
    drawPageHeader(doc);

    // 2. Client & Metadata Details Card (3 Columns with Soft Indigo/Purple Border)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(221, 214, 254); // Purple 200
    doc.roundedRect(14, 27, 182, 35, 3, 3, 'FD');

    // Column 1: Client Info
    doc.setFontSize(7.5);
    doc.setTextColor(139, 92, 246); // Purple Accent Header
    doc.setFont('helvetica', 'bold');
    doc.text('PREPARED FOR CLIENT', 18, 37);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(quote.customerInfo.customerName || 'Valued Enterprise Client', 18, 43);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Contact: ${quote.customerInfo.customerEmail || 'N/A'}`, 18, 49);
    doc.text(`Organization: ${quote.customerInfo.companyName || 'TestGrid Partner'}`, 18, 55);
    doc.text(`Payment Terms: ${quote.customerInfo.paymentTerms || 'Net 30 Days'}`, 18, 61);
    addField('Customer Name', quote.customerInfo.customerName, 18, 39, 59, 6, 9);
    addField('Customer Email', quote.customerInfo.customerEmail, 18, 46, 59, 5, 7);
    addField('Customer Company', quote.customerInfo.companyName, 18, 52, 59, 5, 7);

    // Column 2: Provider & Representative Info
    doc.setFontSize(7.5);
    doc.setTextColor(20, 184, 166); // Teal Accent Header
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUING PROVIDER ENTITY', 82, 37);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TestGrid Labs Inc.', 82, 43);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Lead: ${creator.authorName}`, 82, 49);
    doc.text(`Title: ${creator.authorRole}`, 82, 55);
    doc.text(`Email: ${creator.authorEmail}`, 82, 61);

    // Column 3: Proposal Commercial Metadata
    doc.setFontSize(7.5);
    doc.setTextColor(236, 72, 153); // Pink Accent Header
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSAL METADATA', 148, 37);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(139, 92, 246);
    doc.text(`Ref: ${quote.customerInfo.quoteNumber || 'TG-QUOTE'}`, 148, 43);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Issue Date: ${quote.customerInfo.date}`, 148, 49);
    doc.text(`Validity: ${quote.customerInfo.validityDays}`, 148, 55);
    doc.text(`Contract Term: ${calc.commitmentYears} Year(s)`, 148, 61);
    addField('Quote Reference', quote.customerInfo.quoteNumber, 148, 39, 45, 5, 8);

    // 3. Prepare Line Items Table
    const tableRows = calc.lineItems.map((item) => {
      const noteText = item.note ? `\nNote: ${item.note}` : '';
      const discountNote = !item.isDiscountable ? ' (Discount Exempt)' : '';
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

    // 4. Render Itemized Pricing AutoTable
    autoTable(doc, {
      startY: 67,
      head: [['COMMERCIAL ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
      body: tableRows,
      headStyles: {
        fillColor: primaryRgb,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        font: 'helvetica',
        fontSize: 6.5,
        cellPadding: 1.6,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 105 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 32 },
      },
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      didDrawPage: (data) => {
        if (data.pageNumber > 1) doc.deletePage(data.pageNumber);
      },
    });

    // Layout management
    // @ts-expect-error autoTable attaches finalY
    let currentY = (doc.lastAutoTable?.finalY || 120) + 6;
    const pageMaxY = 278;

    function ensureSpace(neededHeight: number) {
      if (currentY + neededHeight > pageMaxY) currentY = Math.max(currentY, 276 - neededHeight);
    }

    // 5. Executive Financial Investment Summary Box
    ensureSpace(40);

    doc.setFillColor(15, 23, 42); // Dark Slate Indigo Card
    doc.setDrawColor(30, 41, 59);
    doc.roundedRect(14, currentY, 182, 38, 3, 3, 'FD');

    // Gradient accent bar on left of investment card
    doc.setFillColor(236, 72, 153); // Pink
    doc.rect(14, currentY, 2.5, 38, 'F');

    // Left Box Column - Commercial Investment Totals
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166); // Light Teal Accent
    doc.text('TOTAL CONTRACT INVESTMENT SUMMARY', 20, currentY + 8);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Base List Price Subtotal: ${formatCurrencyVal(calc.subtotalOriginal, currency)}`, 20, currentY + 15);

    if (calc.discountAmount > 0) {
      doc.setTextColor(52, 211, 153); // Emerald Green Savings
      doc.text(
        `Applied Commercial Discount (${quote.discountSettings.rate}%): -${formatCurrencyVal(calc.discountAmount, currency)}`,
        20,
        currentY + 21
      );
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text(`Applied Commercial Discount: Standard List Price`, 20, currentY + 21);
    }

    doc.setFontSize(11.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`ANNUAL VALUE (ACV): ${formatCurrencyVal(calc.grandTotal, currency)} ${currency}`, 20, currentY + 30);

    if (calc.commitmentYears > 1) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Multi-Year Contract Value (${calc.commitmentYears} Yrs): ${formatCurrencyVal(calc.multiYearTotal, currency)} ${currency}`, 20, currentY + 37);
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
    doc.text(`1-Year Subscription Commitment`, 20, currentY + 37);
    }

    // Right Box Column - Payment & Billing Schedule
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246); // Purple Accent
    doc.text('PAYMENT SCHEDULE & BILLING TERMS', 115, currentY + 8);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Billing Cadence: ${quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual Contract'}`, 115, currentY + 15);
    doc.text(`Payment Schedule: ${calc.paymentScheduleStr}`, 115, currentY + 21);
    doc.text(`Installment: ${formatCurrencyVal(calc.installmentAmount, currency)} ${currency} (${calc.installmentLabel})`, 115, currentY + 27);
    doc.text(`Invoicing Term: ${quote.customerInfo.paymentTerms || 'Net 30 Days'}`, 115, currentY + 33);
    doc.text(`Currency: Base ${currency}`, 115, currentY + 39);

    currentY += 41;

    // 6. Commercial Terms & Stipulations Box
    const disclaimerLines = doc.splitTextToSize(
      quote.disclaimerNotice || 'CONFIDENTIAL - TestGrid Commercial Proposal. Valid for 30 days from issue date.',
      178
    );
    const disclaimerBoxHeight = Math.min(19, Math.max(16, disclaimerLines.length * 2.1 + 8));

    ensureSpace(disclaimerBoxHeight + 3);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, disclaimerBoxHeight, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('COMMERCIAL TERMS & STIPULATIONS', 18, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(disclaimerLines, 18, currentY + 11);

    currentY += disclaimerBoxHeight + 6;

    // 7. Proposal Issued By Section (GUARANTEED TO EXPORT - Height ~26mm)
    ensureSpace(26);

    doc.setFillColor(245, 243, 255); // Soft Purple Background (#f5f3ff)
    doc.setDrawColor(221, 214, 254); // Soft Purple Border (#ddd6fe)
      doc.roundedRect(14, currentY, 182, 22, 3, 3, 'FD');

    // Purple accent bar
    doc.setFillColor(139, 92, 246);
    doc.rect(14, currentY, 2.5, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PROPOSAL ISSUED BY — ADVISORY CONTACT INFORMATION', 20, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(139, 92, 246);
    doc.text(`${creator.authorName}  ·  ${creator.authorRole}`, 20, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Department: ${creator.department || 'Solutions Engineering & Advisory'}   |   Email: ${creator.authorEmail}   |   Phone: ${creator.authorPhone}`,
      20,
      currentY + 17
    );
    doc.text(
      `Website: ${creator.companyWebsite}   |   Technical Support: ${creator.supportEmail}`,
      20,
      currentY + 21.5
    );

    // 8. FINAL PASS: DRAW WATERMARK & FOOTERS ON ALL PAGES OVER BACKGROUNDS WITH GSTATE OPACITY
    // @ts-expect-error jsPDF total pages getter
    const totalPages = doc.internal.getNumberOfPages();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      doc.setPage(pageNum);

      // Render Watermark Over Content with Translucent Blend Opacity
      if (quote.watermarkSettings && quote.watermarkSettings.enabled) {
        try {
          let opacityVal = quote.watermarkSettings.opacity;
          if (typeof opacityVal !== 'number' || isNaN(opacityVal)) opacityVal = 0.18;
          if (opacityVal > 1) opacityVal = opacityVal / 100;
          if (opacityVal <= 0) opacityVal = 0.18;
          // Ensure watermark is reasonably visible (between 0.12 and 0.25)
          opacityVal = Math.max(0.12, Math.min(0.28, opacityVal));

          // @ts-expect-error jsPDF supports GState
          if (typeof doc.GState === 'function') {
            // @ts-expect-error jsPDF supports GState
            doc.setGState(new doc.GState({ opacity: opacityVal }));
          }

          if (quote.watermarkSettings.mode === 'image' && quote.watermarkSettings.imageUrl) {
            const imgUrl = quote.watermarkSettings.imageUrl;
            const imgWidth = quote.watermarkSettings.imageWidth || 120;
            const imgHeight = imgWidth * 0.4;
            const xPos = (210 - imgWidth) / 2;
            const yPos = (297 - imgHeight) / 2;
            doc.addImage(imgUrl, 'PNG', xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');
          } else {
            const watermarkColor = hexToRgb(quote.watermarkSettings.color || '#8b5cf6');
            doc.setTextColor(watermarkColor[0], watermarkColor[1], watermarkColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.text(quote.watermarkSettings.text || 'TESTGRID · CONFIDENTIAL ESTIMATE', 105, 140, {
              align: 'center',
              angle: quote.watermarkSettings.angle !== undefined ? quote.watermarkSettings.angle : -20,
            });
            if (quote.watermarkSettings.subtext) {
              doc.setFontSize(13);
              doc.text(quote.watermarkSettings.subtext, 105, 155, {
                align: 'center',
                angle: quote.watermarkSettings.angle !== undefined ? quote.watermarkSettings.angle : -20,
              });
            }
          }

          // Reset Opacity Back to 1.0 for Footer
          // @ts-expect-error jsPDF supports GState
          if (typeof doc.GState === 'function') {
            // @ts-expect-error jsPDF supports GState
            doc.setGState(new doc.GState({ opacity: 1.0 }));
          }
        } catch (e) {
          console.warn('Watermark render warning', e);
        }
      }

      // Draw Page Number Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `TestGrid  ·  PRIVATE & CONFIDENTIAL  ·  Ref: ${quote.customerInfo.quoteNumber || 'TG-QUOTE'}`,
        105,
        291,
        { align: 'center' }
      );
    }

    // Save PDF
    const clientClean = quote.customerInfo.customerName
      ? quote.customerInfo.customerName.replace(/[^a-zA-Z0-9]/g, '_')
      : 'Client';
    const filename = `TestGrid_Quote_${quote.customerInfo.quoteNumber || 'Estimate'}_${clientClean}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF proposal:', error);
    alert('An error occurred while exporting the PDF. Please check browser console or try again.');
  }
}

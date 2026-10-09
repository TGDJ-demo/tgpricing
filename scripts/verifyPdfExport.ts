import assert from 'node:assert/strict';
import { INITIAL_QUOTE_STATE } from '../src/data/defaults';
import { buildPdfExport } from '../src/utils/pdfExport';
import { QuoteData } from '../src/types';

const makeQuote = (): QuoteData => structuredClone(INITIAL_QUOTE_STATE);

for (const type of ['quote', 'order'] as const) {
  const quote = makeQuote();
  quote.plans[0].tiers[0].deviceQty = 3;
  quote.plans[0].tiers[0].browserQty = 5;
  quote.salesOrder.purchaseOrderNumber = 'PO-TEST-2048';
  quote.salesOrder.billingAddress = 'Accounts Payable, 100 Market Street, San Francisco, CA 94105';
  quote.salesOrder.serviceAddress = 'Engineering, 200 Mission Street, San Francisco, CA 94105';
  quote.salesOrder.instructions = 'Provision the tenant after receipt of the signed order.';

  const result = buildPdfExport(quote, type, 'balanced');
  assert.equal(result.fitsOnePage, true, `${type} with typical data should fit one page: ${result.warnings.join(' ')}`);
  assert.equal(result.pageCount, 1);
  assert.ok(Math.abs(result.pageWidthMm - 210) < 0.1);
  assert.ok(Math.abs(result.pageHeightMm - 297) < 0.1);
  assert.ok(result.blob && result.blob.size > 0);
  assert.ok(result.fieldNames.includes(type === 'order' ? 'Invoice Number' : 'Quote Number'));
  assert.ok(result.fieldNames.includes(type === 'order' ? 'Order Instructions' : 'Commercial Terms'));
  if (type === 'order') {
    for (const field of ['Purchase Order Number', 'Billing Address', 'Service Address', 'Order Instructions', 'TestGrid Signature', 'Customer Signature']) {
      assert.ok(result.fieldNames.includes(field), `order PDF should include ${field}`);
    }
  }
}

const longQuote = makeQuote();
longQuote.disclaimerNotice = 'Detailed commercial terms. '.repeat(300);
longQuote.salesOrder.purchaseOrderNumber = 'PO-LONG-TEST';
longQuote.salesOrder.billingAddress = 'Billing department, address line. '.repeat(50);
longQuote.salesOrder.serviceAddress = 'Service department, location detail. '.repeat(50);
longQuote.salesOrder.instructions = 'Order fulfillment instructions. '.repeat(300);
longQuote.customServices = Array.from({ length: 28 }, (_, index) => ({
  id: `verification-service-${index}`,
  description: `Extended enterprise implementation and onboarding service ${index + 1} `.repeat(5),
  cost: 100 + index,
  qty: 1,
  billingType: 'one-time' as const,
}));

const longResult = buildPdfExport(longQuote, 'order', 'compact');
assert.equal(longResult.fitsOnePage, false, 'unusually long order data must be held when it cannot fit one page');
assert.equal(longResult.blob, undefined, 'overflowing order must not be downloadable');
assert.ok(longResult.warnings.length > 0, 'overflow must be explained in the preview');
assert.ok(longResult.pageCount >= 1);
assert.ok(Math.abs(longResult.pageWidthMm - 210) < 0.1);
assert.ok(Math.abs(longResult.pageHeightMm - 297) < 0.1);

console.log('PDF checks passed for typical quote/order and oversized order content.');

import type { ReactNode } from 'react';
import { QuoteData } from '../types';
import { PROPOSAL_THEMES } from '../data/themes';
import { calculateQuoteLineItems, formatCurrencyVal } from '../utils/exportUtils';
import { PdfDensity } from '../utils/pdfPreview';

interface PdfDocumentPreviewProps {
  quote: QuoteData;
  type: 'quote' | 'order';
  density: PdfDensity;
}

export function PdfDocumentPreview({ quote, type, density }: PdfDocumentPreviewProps) {
  const calc = calculateQuoteLineItems(quote);
  const order = quote.salesOrder;
  const customer = quote.customerInfo;
  const theme = PROPOSAL_THEMES[quote.themePreset || 'slate-teal'];
  const compact = density === 'compact';
  const roomy = density === 'roomy';
  const providerName = customer.companyName || 'TestGrid';
  const customerName = customer.customerOrganization || customer.customerName || 'Customer';
  const terms = type === 'order' ? order?.instructions : quote.disclaimerNotice;
  const date = type === 'order' ? order?.orderDate : customer.date;
  const fieldClass = compact ? 'py-1' : roomy ? 'py-2' : 'py-1.5';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          [data-preview-document], [data-preview-document] * { visibility: visible !important; }
          [data-preview-document] { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; }
          [data-preview-scroll] { overflow: visible !important; height: auto !important; background: white !important; padding: 0 !important; }
        }
      `}</style>
      <div data-preview-scroll className="min-h-0 flex-1 overflow-auto bg-slate-200/80 p-4 sm:p-7">
        <article
          data-preview-document
          className="relative mx-auto min-h-[1123px] w-full max-w-[794px] overflow-hidden border border-slate-200 bg-white px-8 py-8 shadow-xl sm:px-12 sm:py-10 print:min-h-[297mm] print:w-[210mm] print:max-w-none print:px-[14mm] print:py-[14mm]"
          style={{ color: '#0f172a' }}
        >
          {quote.watermarkSettings.enabled && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            >
              {quote.watermarkSettings.mode === 'image' && quote.watermarkSettings.imageUrl ? (
                <img
                  src={quote.watermarkSettings.imageUrl}
                  alt=""
                  className="max-h-[45%] max-w-[78%] object-contain grayscale"
                  style={{
                    width: `${quote.watermarkSettings.imageWidth || 120}mm`,
                    opacity: Math.max(0.02, Math.min(0.3, quote.watermarkSettings.opacity || 0.08)),
                    transform: `rotate(${quote.watermarkSettings.angle ?? -20}deg)`,
                  }}
                />
              ) : (
                <div
                  className="text-center font-black uppercase tracking-widest"
                  style={{
                    color: quote.watermarkSettings.color || '#2c3260',
                    opacity: Math.max(0.02, Math.min(0.3, quote.watermarkSettings.opacity || 0.08)),
                    fontSize: `${Math.min(34, Math.max(16, quote.watermarkSettings.fontSize || 10))}pt`,
                    transform: `rotate(${quote.watermarkSettings.angle ?? -20}deg)`,
                  }}
                >
                  <div>{quote.watermarkSettings.text || 'TESTGRID · CONFIDENTIAL ESTIMATE'}</div>
                  {quote.watermarkSettings.subtext && <div className="mt-2 text-[0.55em]">{quote.watermarkSettings.subtext}</div>}
                </div>
              )}
            </div>
          )}

          <div className="relative z-10">
            <header
              className={`-mx-8 -mt-8 mb-6 flex items-center justify-between border-b-[3px] px-8 py-5 sm:-mx-12 sm:-mt-10 sm:px-12 ${roomy ? 'mb-9 py-7' : ''}`}
              style={{ borderColor: theme.accentColor, backgroundColor: '#f8fafc' }}
            >
              <div>
                <div className="text-2xl font-black" style={{ color: theme.headerBg }}>TestGrid</div>
                <div className="mt-1 text-[9px] font-semibold tracking-[.18em] text-slate-500">ENTERPRISE TESTING SOLUTIONS</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-[.18em]" style={{ color: theme.headerBg }}>
                  {type === 'order' ? 'SALES ORDER' : 'COMMERCIAL QUOTE'}
                </div>
                <div className="mt-1 text-xs text-slate-500">{type === 'order' ? 'Order' : 'Issue'} date · {date || '—'}</div>
              </div>
            </header>

            <h1 className="mb-4 text-xl font-bold">{type === 'order' ? 'Sales order' : 'Commercial quote'}</h1>

            <section className={`mb-4 grid grid-cols-2 gap-3 ${roomy ? 'mb-6 gap-5' : ''}`}>
              <PreviewCard title="Customer" color={theme.headerBg}>
                <PreviewField label="Name" value={customer.customerName} className={fieldClass} />
                <PreviewField label="Organization" value={customer.customerOrganization} className={fieldClass} />
                <PreviewField label="Email" value={customer.customerEmail} className={fieldClass} />
              </PreviewCard>
              <PreviewCard title="Provider & prepared by" color={theme.headerBg}>
                <PreviewField label="Provider" value={providerName} className={fieldClass} />
                <PreviewField label="Prepared by" value={customer.preparedBy} className={fieldClass} />
                <PreviewField label="Title" value={customer.preparedByTitle} className={fieldClass} />
                <PreviewField label="Email" value={customer.preparedByEmail} className={fieldClass} />
              </PreviewCard>
            </section>

            <section
              className={`mb-4 grid grid-cols-3 gap-x-4 gap-y-2 border-y border-slate-200 py-3 text-[10px] ${roomy ? 'mb-6 py-5' : ''}`}
            >
              <PreviewField label={type === 'order' ? 'Invoice' : 'Quote'} value={type === 'order' ? order?.invoiceNumber : customer.quoteNumber} />
              <PreviewField label={type === 'order' ? 'Purchase order' : 'Validity'} value={type === 'order' ? order?.purchaseOrderNumber || 'Pending' : customer.validityDays} />
              <PreviewField label="Payment terms" value={type === 'order' ? order?.paymentTerms : customer.paymentTerms} />
              {type === 'order' && (
                <>
                  <PreviewField label="Bill to" value={order?.billingAddress || customerName} />
                  <PreviewField label="Service / ship to" value={order?.serviceAddress || 'Same as bill-to'} />
                  <PreviewField label="Source quote" value={customer.quoteNumber} />
                </>
              )}
            </section>

            <table className="mb-4 w-full border-collapse text-left text-[10px]">
              <thead>
                <tr style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
                  <th className="px-2.5 py-2 font-bold">DESCRIPTION</th>
                  <th className="w-[9%] px-2 py-2 text-center font-bold">QTY</th>
                  <th className="w-[19%] px-2 py-2 text-right font-bold">UNIT PRICE</th>
                  <th className="w-[20%] px-2.5 py-2 text-right font-bold">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {calc.lineItems.length ? calc.lineItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="border-b border-slate-200 px-2.5 py-2.5 align-top">
                      <span className="font-semibold">{item.label}{!item.isDiscountable ? ' (Discount exempt)' : ''}</span>
                      {item.note && <span className="mt-1 block text-[9px] text-slate-500">{item.note}</span>}
                    </td>
                    <td className="border-b border-slate-200 px-2 py-2.5 text-center align-top">{item.qty}</td>
                    <td className="border-b border-slate-200 px-2 py-2.5 text-right align-top">{formatCurrencyVal(item.unitCostDiscounted, customer.currency)}</td>
                    <td className="border-b border-slate-200 px-2.5 py-2.5 text-right align-top">{formatCurrencyVal(item.totalDiscounted, customer.currency)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="border-b border-slate-200 px-2.5 py-4 text-center text-slate-500">No priced items selected</td></tr>
                )}
              </tbody>
            </table>

            {(type === 'order' || Boolean(terms?.trim())) && (
              <section className={`mb-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3 ${roomy ? 'mb-6 p-5' : ''}`}>
                <h2 className="mb-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.headerBg }}>
                  {type === 'order' ? 'Order instructions' : 'Commercial terms'}
                </h2>
                <p className="whitespace-pre-wrap text-[9px] leading-relaxed text-slate-700">{terms || '—'}</p>
              </section>
            )}

            <section className={`mb-5 rounded-lg border border-slate-200 bg-slate-50/90 p-3 ${roomy ? 'mb-7 p-5' : ''}`}>
              <h2 className="mb-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.headerBg }}>Order summary</h2>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="space-y-1">
                  <PreviewField label="List subtotal" value={formatCurrencyVal(calc.subtotalOriginal, customer.currency)} />
                  {calc.discountAmount > 0 && <PreviewField label="Discount" value={`−${formatCurrencyVal(calc.discountAmount, customer.currency)}`} />}
                  <div className="mt-2 border-t border-slate-200 pt-2 font-bold" style={{ color: theme.headerBg }}>
                    <PreviewField label={quote.discountSettings.billingCycle === 'monthly' ? 'Monthly total' : 'Annual total'} value={formatCurrencyVal(calc.grandTotal, customer.currency)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <PreviewField label="Billing" value={quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} />
                  <PreviewField label="Payment schedule" value={calc.paymentScheduleStr} />
                  <PreviewField label="Commitment" value={`${calc.commitmentYears} year(s)`} />
                </div>
              </div>
            </section>

            {type === 'order' && (
              <section className="grid grid-cols-2 gap-4">
                {[`For ${providerName}`, `For ${customerName}`].map((label) => (
                  <div key={label} className="rounded-lg border border-slate-200 px-3 py-3">
                    <div className="mb-8 text-[9px] font-semibold" style={{ color: theme.headerBg }}>{label}</div>
                    <div className="border-b border-slate-400" />
                    <div className="mt-1.5 text-[8px] text-slate-500">Authorized signature / printed name / date</div>
                  </div>
                ))}
              </section>
            )}

            <footer className="mt-7 border-t border-slate-200 pt-2 text-center text-[8px] text-slate-400">
              TestGrid · {type === 'order' ? 'Sales order' : 'Commercial quote'} · {customer.quoteNumber}
            </footer>
          </div>
        </article>
      </div>
    </>
  );
}

function PreviewCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <h2 className="mb-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{title}</h2>
      {children}
    </div>
  );
}

function PreviewField({ label, value, className = '' }: { label: string; value?: string; className?: string }) {
  return (
    <div className={`flex min-w-0 justify-between gap-2 text-[9px] ${className}`}>
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}

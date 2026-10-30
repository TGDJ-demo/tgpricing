import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { QuoteData, SalesOrderData } from '../types';
import { calculateQuoteLineItems, formatCurrencyVal } from '../utils/exportUtils';
import { WatermarkBackground } from './WatermarkBackground';

interface SalesOrderTabProps {
  quote: QuoteData;
  order: SalesOrderData;
  onChangeOrder: (order: SalesOrderData) => void;
  onOpenPdfPreview: () => void;
}

export const SalesOrderTab: React.FC<SalesOrderTabProps> = ({ quote, order, onChangeOrder, onOpenPdfPreview }) => {
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const customer = quote.customerInfo;

  const updateOrder = <K extends keyof SalesOrderData>(key: K, value: SalesOrderData[K]) => {
    onChangeOrder({ ...order, [key]: value });
  };

  const inputClass =
    'w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-400/30';
  const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[.14em] text-slate-600';

  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-indigo-950/5">
      <WatermarkBackground settings={quote.watermarkSettings} />
      <div className="relative z-10">
      <header className="bg-gradient-to-br from-sky-50 via-teal-50 to-purple-100 p-6 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-xl font-black text-indigo-900">TestGrid</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              Enterprise testing solutions
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-purple-700">
              Quote conversion
            </div>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Sales Order</h1>
            <div className="mt-1 text-sm text-slate-600">Source quote · {customer.quoteNumber}</div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          Prepared for {customer.customerName || 'Your customer'}
          <span className="ml-auto">{order.orderDate}</span>
        </div>
      </header>

      <div className="space-y-8 p-5 sm:p-9">
        <div className="grid gap-5 sm:grid-cols-3">
          <Info
            label="Customer"
            primary={customer.customerName}
            lines={[customer.customerOrganization, customer.customerEmail]}
          />
          <Info
            label="Prepared by"
            primary={customer.preparedBy}
            lines={[customer.preparedByTitle, customer.preparedByEmail]}
          />
          <Info
            label="Provider"
            primary={customer.companyName}
            lines={[
              `${calc.commitmentYears} year commitment`,
              `${quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} billing`,
            ]}
          />
        </div>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrderInput label="Invoice number" value={order.invoiceNumber} onChange={(v) => updateOrder('invoiceNumber', v)} className={inputClass} labelClass={labelClass} />
          <OrderInput label="Order date" type="date" value={order.orderDate} onChange={(v) => updateOrder('orderDate', v)} className={inputClass} labelClass={labelClass} />
          <OrderInput label="Purchase order number" value={order.purchaseOrderNumber} onChange={(v) => updateOrder('purchaseOrderNumber', v)} placeholder="Customer PO" className={inputClass} labelClass={labelClass} />
          <OrderInput label="Payment terms" value={order.paymentTerms} onChange={(v) => updateOrder('paymentTerms', v)} placeholder="e.g. Net 30" className={inputClass} labelClass={labelClass} />
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <OrderAddress label="Bill to" address={order.billingAddress} placeholder={`${customer.customerOrganization || customer.customerName}\n${customer.customerEmail}`} onChange={(v) => updateOrder('billingAddress', v)} className={inputClass} labelClass={labelClass} />
          <OrderAddress label="Service / ship to" address={order.serviceAddress} placeholder="Same as bill-to" onChange={(v) => updateOrder('serviceAddress', v)} className={inputClass} labelClass={labelClass} />
        </div>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[.2em] text-amber-700">Order details</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Products & services</h2>
            </div>
            <span className="text-xs text-slate-500">{calc.lineItems.length} items</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit price</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calc.lineItems.length ? calc.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {item.label}
                      {item.note && <div className="mt-1 text-xs font-normal text-slate-500">{item.note}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{item.qty}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{formatCurrencyVal(item.unitCostDiscounted, currency)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-900">{formatCurrencyVal(item.totalDiscounted, currency)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No priced items selected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <label className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className={labelClass}>Order instructions</span>
            <span className="mt-1 block text-xs text-slate-500">Delivery, provisioning, or procurement instructions.</span>
            <textarea
              value={order.instructions}
              onChange={(event) => updateOrder('instructions', event.target.value)}
              placeholder="Add order-specific instructions"
              rows={4}
              className={`${inputClass} mt-3 resize-y leading-6`}
            />
          </label>
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-purple-50 p-5 text-indigo-950 shadow-sm">
            <div className="text-xs uppercase tracking-widest text-indigo-500">Order summary</div>
            <div className="mt-4 flex justify-between text-sm text-slate-600">
              <span>List subtotal</span><span>{formatCurrencyVal(calc.subtotalOriginal, currency)}</span>
            </div>
            {calc.discountAmount > 0 && (
              <div className="mt-2 flex justify-between text-sm text-slate-600">
                <span>Discount</span><span>−{formatCurrencyVal(calc.discountAmount, currency)}</span>
              </div>
            )}
            <div className="my-4 border-t border-indigo-100" />
            <div className="flex items-end justify-between gap-2">
              <span className="text-sm font-medium">Total {quote.discountSettings.billingCycle === 'monthly' ? 'monthly' : 'annual'}</span>
              <span className="text-xl font-semibold text-indigo-800">{formatCurrencyVal(calc.grandTotal, currency)}</span>
            </div>
            <div className="mt-3 text-xs text-slate-500">{calc.paymentScheduleStr} · {currency}</div>
          </div>
        </div>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Acceptance & signatures</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">By signing below, each party confirms acceptance of this order and its commercial terms.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <SignatureBlock title={`For ${customer.companyName || 'TestGrid'}`} name={customer.preparedBy} />
            <SignatureBlock title={`For ${customer.customerOrganization || customer.customerName || 'Customer'}`} name={customer.customerName} />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-indigo-100 pt-5">
          <div className="text-xs text-slate-500">A4 portrait · sales order PDF</div>
          <button type="button" onClick={onOpenPdfPreview} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:brightness-105">
            <FileText className="h-4 w-4" /> Preview &amp; download order PDF
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};

const Info: React.FC<{ label: string; primary?: string; lines: (string | undefined)[] }> = ({ label, primary, lines }) => (
  <div className="min-w-0 border-l-2 border-teal-400 pl-4">
    <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{label}</div>
    <div className="mt-2 break-words text-sm font-semibold text-slate-900">{primary || '—'}</div>
    {lines.filter(Boolean).map((line, index) => <div key={index} className="mt-1 break-words text-xs text-slate-500">{line}</div>)}
  </div>
);

const OrderInput: React.FC<{
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  className: string;
  labelClass: string;
  onChange: (value: string) => void;
}> = ({ label, value, type = 'text', placeholder, className, labelClass, onChange }) => (
  <label className="block min-w-0">
    <span className={labelClass}>{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
  </label>
);

const OrderAddress: React.FC<{
  label: string;
  address: string;
  placeholder: string;
  className: string;
  labelClass: string;
  onChange: (value: string) => void;
}> = ({ label, address, placeholder, className, labelClass, onChange }) => (
  <label className="block min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/30">
    <span className={labelClass}>{label}</span>
    <textarea value={address} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className={`${className} mt-3 resize-y leading-5`} />
  </label>
);

const SignatureBlock: React.FC<{ title: string; name?: string }> = ({ title, name }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
    <div className="text-xs font-semibold text-slate-800">{title}</div>
    <div className="mt-10 border-b border-slate-400" />
    <div className="mt-2 text-[10px] text-slate-500">Authorized signature{name ? ` · ${name}` : ''}</div>
    <div className="mt-5 border-b border-slate-300 pb-1 text-[10px] text-slate-500">Name, title & date</div>
  </div>
);

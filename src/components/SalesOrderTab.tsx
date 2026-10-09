import React from 'react';
import { QuoteData } from '../types';
import { calculateQuoteLineItems, exportToPdf, formatCurrencyVal } from '../utils/exportUtils';
import { Download, ShieldCheck } from 'lucide-react';

export const SalesOrderTab: React.FC<{ quote: QuoteData }> = ({ quote }) => {
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const customer = quote.customerInfo;
  return <section className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_-40px_rgba(15,23,42,.32)]">
    <div className="relative overflow-hidden bg-[#111b2e] px-8 py-8 text-white sm:px-12">
      <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <div className="absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div><div className="text-xl font-bold tracking-tight">TestGrid</div><div className="mt-1 text-xs uppercase tracking-[.24em] text-slate-400">Enterprise testing solutions</div></div>
        <div className="text-right"><div className="text-[11px] font-semibold uppercase tracking-[.25em] text-amber-300">Commercial document</div><h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">Sales order <span className="font-semibold">quote</span></h1><div className="mt-2 text-sm text-slate-300">Quote reference · {customer.quoteNumber}</div></div>
      </div>
      <div className="relative mt-8 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck className="h-4 w-4 text-amber-300"/> Prepared for {customer.customerName || 'Your customer'} <span className="ml-auto">{customer.date}</span></div>
    </div>
    <div className="space-y-8 p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-3">
        <Info label="Customer" primary={customer.customerName} lines={[customer.companyName, customer.customerEmail]} />
        <Info label="Prepared by" primary={customer.preparedBy} lines={[customer.preparedByTitle, customer.preparedByEmail]} />
        <Info label="Order terms" primary={customer.paymentTerms} lines={[`Valid for ${customer.validityDays}`, `${calc.commitmentYears} year commitment`]} />
      </div>
      <div>
        <div className="mb-3 flex items-end justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.2em] text-amber-700">Order details</div><h2 className="mt-1 text-lg font-semibold text-slate-900">Products & services</h2></div><span className="text-xs text-slate-500">{calc.lineItems.length} items</span></div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-500"><tr><th className="px-5 py-3">Description</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Unit price</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{calc.lineItems.length ? calc.lineItems.map(i=><tr key={i.id}><td className="px-5 py-3.5 font-medium text-slate-800">{i.label}{i.note && <div className="mt-1 text-xs font-normal text-slate-500">{i.note}</div>}</td><td className="px-4 py-3.5 text-center text-slate-600">{i.qty}</td><td className="px-4 py-3.5 text-right text-slate-600">{formatCurrencyVal(i.unitCostDiscounted,currency)}</td><td className="px-5 py-3.5 text-right font-medium text-slate-900">{formatCurrencyVal(i.totalDiscounted,currency)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No priced items selected</td></tr>}</tbody></table></div>
      </div>
      <div className="grid gap-8 border-t border-slate-200 pt-6 sm:grid-cols-[1fr_300px]">
        <div><div className="text-[11px] font-bold uppercase tracking-[.2em] text-amber-700">Commercial terms</div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{quote.disclaimerNotice || 'Quote valid for the period shown above. Services and subscriptions are subject to the agreed payment terms.'}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-slate-500">Private & confidential</p></div>
        <div className="rounded-2xl bg-[#111b2e] p-5 text-white"><div className="text-xs uppercase tracking-[.16em] text-slate-400">Order summary</div><div className="mt-4 flex justify-between text-sm text-slate-300"><span>List subtotal</span><span>{formatCurrencyVal(calc.subtotalOriginal,currency)}</span></div><div className="mt-2 flex justify-between text-sm text-slate-300"><span>Discount</span><span>−{formatCurrencyVal(calc.discountAmount,currency)}</span></div><div className="my-4 border-t border-white/15"/><div className="flex items-end justify-between"><span className="text-sm font-medium">Total {quote.discountSettings.billingCycle === 'monthly' ? 'monthly' : 'annual'}</span><span className="text-2xl font-semibold tracking-tight text-amber-300">{formatCurrencyVal(calc.grandTotal,currency)}</span></div><div className="mt-3 text-xs text-slate-400">{calc.paymentScheduleStr} · {currency}</div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5"><div className="text-xs text-slate-500">TestGrid · Private & confidential</div><button type="button" onClick={() => exportToPdf(quote)} className="inline-flex items-center gap-2 rounded-xl bg-[#111b2e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"><Download className="h-4 w-4"/> Download editable A4 PDF</button></div>
    </div>
  </section>;
};

const Info: React.FC<{label:string;primary?:string;lines:(string|undefined)[]}> = ({label,primary,lines}) => <div className="border-l-2 border-amber-400 pl-4"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{label}</div><div className="mt-2 text-sm font-semibold text-slate-900">{primary || '—'}</div>{lines.filter(Boolean).map((line,i)=><div key={i} className="mt-1 text-xs text-slate-500">{line}</div>)}</div>;

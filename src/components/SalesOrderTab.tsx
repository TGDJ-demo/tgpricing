import React, { useLayoutEffect, useRef, useState } from 'react';
import { QuoteData, SalesOrderData } from '../types';
import { calculateQuoteLineItems, formatCurrencyVal } from '../utils/exportUtils';
import { Download, ShieldCheck } from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';
import { formInputClassName, formLabelClassName, formTextareaClassName } from './formStyles';

export const SalesOrderTab: React.FC<{ quote: QuoteData; order: SalesOrderData; onChangeOrder: (order: SalesOrderData) => void }> = ({ quote, order, onChangeOrder }) => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const orderInstructionsRef = useRef<HTMLTextAreaElement>(null);
  const calc = calculateQuoteLineItems(quote);
  const currency = quote.customerInfo.currency || 'USD';
  const customer = quote.customerInfo;
  const updateOrder = <K extends keyof SalesOrderData>(key: K, value: SalesOrderData[K]) => onChangeOrder({ ...order, [key]: value });
  useLayoutEffect(() => {
    const field = orderInstructionsRef.current;
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = `${Math.max(field.scrollHeight, 104)}px`;
  }, [order.instructions]);
  return <section className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white/75 shadow-[0_28px_80px_-40px_rgba(70,75,145,.28)] backdrop-blur-xl">
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-teal-50 to-purple-100 px-8 py-8 text-indigo-950 sm:px-12">
      <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/70" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div><div className="bg-gradient-to-r from-sky-700 via-teal-600 to-purple-700 bg-clip-text text-xl font-black tracking-tight text-transparent">TestGrid</div><div className="mt-1 text-xs uppercase tracking-[.24em] text-slate-500">Enterprise testing solutions</div></div>
        <div className="text-right"><div className="text-[11px] font-semibold uppercase tracking-[.25em] text-purple-700">Quote conversion</div><h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">Sales <span className="font-semibold">Order</span></h1><div className="mt-2 text-sm text-slate-600">Source quote · {customer.quoteNumber}</div></div>
      </div>
      <div className="relative mt-8 flex items-center gap-2 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 text-teal-600"/> Prepared for {customer.customerName || 'Your customer'} <span className="ml-auto">{customer.date}</span></div>
    </div>
    <div className="space-y-8 p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-3">
        <Info label="Customer" primary={customer.customerName} lines={[customer.companyName, customer.customerEmail]} />
        <Info label="Prepared by" primary={customer.preparedBy} lines={[customer.preparedByTitle, customer.preparedByEmail]} />
        <Info label="Contract term" primary={`${calc.commitmentYears} year commitment`} lines={[`Quote valid for ${customer.validityDays}`, `${quote.discountSettings.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} billing`]} />
      </div>
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <OrderInput label="Invoice number" value={order.invoiceNumber} onChange={(value) => updateOrder('invoiceNumber', value)} />
        <OrderInput label="Order date" type="date" value={order.orderDate} onChange={(value) => updateOrder('orderDate', value)} />
        <OrderInput label="Purchase order number" value={order.purchaseOrderNumber} onChange={(value) => updateOrder('purchaseOrderNumber', value)} placeholder="Customer PO" />
        <OrderInput label="Payment terms" value={order.paymentTerms} onChange={(value) => updateOrder('paymentTerms', value)} placeholder="e.g. Net 30" />
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <OrderAddress label="Bill to" address={order.billingAddress} placeholder={`${customer.companyName}\n${customer.customerEmail}`} onChange={(value) => updateOrder('billingAddress', value)} />
        <OrderAddress label="Service / ship to" address={order.serviceAddress} placeholder="Same as bill-to" onChange={(value) => updateOrder('serviceAddress', value)} />
      </div>
      <div>
        <div className="mb-3 flex items-end justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.2em] text-amber-700">Order details</div><h2 className="mt-1 text-lg font-semibold text-slate-900">Products & services</h2></div><span className="text-xs text-slate-500">{calc.lineItems.length} items</span></div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-500"><tr><th className="px-5 py-3">Description</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Unit price</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{calc.lineItems.length ? calc.lineItems.map(i=><tr key={i.id}><td className="px-5 py-3.5 font-medium text-slate-800">{i.label}{i.note && <div className="mt-1 text-xs font-normal text-slate-500">{i.note}</div>}</td><td className="px-4 py-3.5 text-center text-slate-600">{i.qty}</td><td className="px-4 py-3.5 text-right text-slate-600">{formatCurrencyVal(i.unitCostDiscounted,currency)}</td><td className="px-5 py-3.5 text-right font-medium text-slate-900">{formatCurrencyVal(i.totalDiscounted,currency)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No priced items selected</td></tr>}</tbody></table></div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label htmlFor="sales-order-notes" className="text-[11px] font-bold uppercase tracking-[.2em] text-amber-700">Order instructions</label>
          <p className="mt-1 text-xs text-slate-500">Optional instructions for delivery, provisioning, access, or customer procurement.</p>
          <textarea ref={orderInstructionsRef} id="sales-order-notes" value={order.instructions} onChange={(event) => updateOrder('instructions', event.target.value)} placeholder="Add order-specific instructions" rows={3} className={`${formTextareaClassName} mt-3 resize-none overflow-hidden text-sm leading-6`} />
        </section>
        <div className="self-start rounded-2xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-purple-50 p-5 text-indigo-950 shadow-lg shadow-indigo-950/5"><div className="text-xs uppercase tracking-[.16em] text-indigo-500">Order summary</div><div className="mt-4 flex justify-between text-sm text-slate-600"><span>List subtotal</span><span>{formatCurrencyVal(calc.subtotalOriginal,currency)}</span></div>{calc.discountAmount > 0 && <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Discount</span><span>−{formatCurrencyVal(calc.discountAmount,currency)}</span></div>}<div className="my-4 border-t border-indigo-100"/><div className="flex items-end justify-between"><span className="text-sm font-medium">Total {quote.discountSettings.billingCycle === 'monthly' ? 'monthly' : 'annual'}</span><span className="bg-gradient-to-r from-sky-700 via-teal-600 to-purple-700 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">{formatCurrencyVal(calc.grandTotal,currency)}</span></div><div className="mt-3 text-xs text-slate-500">{calc.paymentScheduleStr} · {currency}</div></div>
      </div>
      <section className="border-t border-slate-200 pt-6">
        <div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-700">Authorization</div><h2 className="mt-1 text-lg font-semibold text-slate-900">Acceptance & signatures</h2><p className="mt-1 text-xs leading-5 text-slate-500">By signing below, each party confirms acceptance of this order and its commercial terms.</p></div>
        <div className="grid gap-8 sm:grid-cols-2">
          <SignatureBlock title="For TestGrid" name={quote.creatorContactInfo?.authorName || customer.preparedBy} />
          <SignatureBlock title={`For ${customer.companyName || 'Customer'}`} name={customer.customerName} />
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-indigo-100 pt-5"><div className="text-xs text-slate-500">A4 portrait · fillable PDF</div><button type="button" onClick={() => setShowPdfPreview(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:brightness-105"><Download className="h-4 w-4"/> Preview &amp; download order PDF</button></div>
    </div>
    {showPdfPreview && <PdfPreviewModal quote={quote} type="order" onClose={() => setShowPdfPreview(false)} />}
  </section>;
};

const Info: React.FC<{label:string;primary?:string;lines:(string|undefined)[]}> = ({label,primary,lines}) => <div className="min-w-0 border-l-2 border-teal-400 pl-4"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{label}</div><div className="mt-2 break-words text-sm font-semibold text-slate-900">{primary || '—'}</div>{lines.filter(Boolean).map((line,i)=><div key={i} className="mt-1 break-words text-xs text-slate-500">{line}</div>)}</div>;

const OrderInput: React.FC<{label:string;value:string;type?:string;placeholder?:string;onChange:(value:string)=>void}> = ({label,value,type='text',placeholder,onChange}) => <label className="block min-w-0"><span className={formLabelClassName}>{label}</span><input type={type} value={value} onChange={event=>onChange(event.target.value)} placeholder={placeholder} className={`${formInputClassName} text-sm`} /></label>;

const OrderAddress: React.FC<{label:string;address:string;placeholder:string;onChange:(value:string)=>void}> = ({label,address,placeholder,onChange}) => <label className="block min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm focus-within:border-purple-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-400/30"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</span><textarea value={address} onChange={event=>onChange(event.target.value)} placeholder={placeholder} rows={3} className="mt-3 min-h-20 w-full resize-y break-words bg-transparent text-sm font-semibold leading-5 text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" /></label>;

const SignatureBlock: React.FC<{title:string;name?:string}> = ({title,name}) => <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5"><div className="text-xs font-semibold text-slate-800">{title}</div><div className="mt-10 border-b border-slate-400"/><div className="mt-2 grid grid-cols-[1fr_100px] gap-4 text-[10px] text-slate-500"><span>Authorized signature{name ? ` · ${name}` : ''}</span><span className="border-b border-slate-300 pb-1">Date</span></div><div className="mt-5 border-b border-slate-300 pb-1 text-[10px] text-slate-500">Name &amp; title</div></div>;

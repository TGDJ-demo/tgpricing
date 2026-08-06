import React from 'react';
import { QuoteData, DiscountSettings, CreatorContactInfo } from '../types';
import { calculateQuoteLineItems, formatCurrencyVal, exportToPdf } from '../utils/exportUtils';
import { Tooltip } from './Tooltip';
import {
  Tag,
  Percent,
  PiggyBank,
  ShieldAlert,
  Calendar,
  UserCheck,
  Phone,
  Mail,
  Globe,
  HelpCircle,
  Building2,
  Download,
  X,
  CreditCard,
  FileCheck,
} from 'lucide-react';

interface LineItemsSummaryProps {
  quote: QuoteData;
  onChangeDiscount: (discount: DiscountSettings) => void;
  onChangeDisclaimer: (text: string) => void;
  onChangeCreatorInfo?: (creator: CreatorContactInfo) => void;
  onExcludeLineItem: (itemId: string) => void;
  onOpenGoogleSheetsModal?: () => void;
  currencyCode: string;
}

export const LineItemsSummary: React.FC<LineItemsSummaryProps> = ({
  quote,
  onChangeDiscount,
  onChangeDisclaimer,
  onChangeCreatorInfo,
  onExcludeLineItem,
  currencyCode,
}) => {
  const calc = calculateQuoteLineItems(quote);

  const handleToggleBillingCycle = (cycle: 'annual' | 'monthly') => {
    onChangeDiscount({
      ...quote.discountSettings,
      billingCycle: cycle,
      rate: cycle === 'monthly' ? 0 : quote.discountSettings.rate,
    });
  };

  const handleRateChange = (val: number) => {
    onChangeDiscount({ ...quote.discountSettings, rate: val });
  };

  const handleCommitmentYearsChange = (years: number) => {
    onChangeDiscount({ ...quote.discountSettings, commitmentYears: years });
  };

  const handlePaymentScheduleChange = (
    schedule: 'Upfront' | 'Annually' | 'Bi-annually' | 'Quarterly' | 'Monthly'
  ) => {
    onChangeDiscount({ ...quote.discountSettings, paymentSchedule: schedule });
  };

  const creator: CreatorContactInfo = quote.creatorContactInfo || {
    authorName: 'TestGrid Solutions Engineering',
    authorRole: 'Enterprise Advisory Lead',
    department: 'Solutions Engineering & Architecture',
    authorEmail: 'sales@testgrid.io',
    authorPhone: '+1 (800) 555-8378',
    companyWebsite: 'https://testgrid.io',
    supportEmail: 'support@testgrid.io',
  };

  const handleUpdateCreatorField = (field: keyof CreatorContactInfo, value: string) => {
    if (onChangeCreatorInfo) {
      onChangeCreatorInfo({ ...creator, [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Itemized Line Items Table Box */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" /> Commercial Line Item Summary
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
              Review itemized license totals and individual line items included in this proposal
            </p>
          </div>
          <span className="text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {calc.lineItems.length} Line Item(s) Selected
          </span>
        </div>

        <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2 px-1">
          <span className="col-span-6 sm:col-span-6">Line Item Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-3 sm:col-span-3 text-right">Subtotal</span>
          <span className="col-span-1 text-center">Action</span>
        </div>

        {calc.lineItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No line items selected yet. Select devices, browsers, or add-ons above.
          </div>
        ) : (
          <div className="space-y-2.5 divide-y divide-slate-100">
            {calc.lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center text-xs text-slate-800 pt-2.5 px-1 hover:bg-slate-50/80 rounded-lg transition"
              >
                <div className="col-span-6 sm:col-span-6 flex flex-col pr-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap leading-relaxed">
                    {item.label}
                    {!item.isDiscountable && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                        Discount Exempt
                      </span>
                    )}
                  </span>
                  {item.note && (
                    <span className="text-[11px] text-slate-500 italic pl-1 leading-relaxed">
                      Note: {item.note}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-slate-800">
                  {item.qty}
                </div>
                <div className="col-span-3 sm:col-span-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrencyVal(item.totalDiscounted, currencyCode)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Tooltip content="Remove or exclude this line item from totals" position="left">
                    <button
                      type="button"
                      onClick={() => onExcludeLineItem(item.id)}
                      className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subtotal Summary Footer */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
          <div>
            Base List Subtotal:{' '}
            <span className="font-mono text-slate-900 font-bold">
              {formatCurrencyVal(calc.subtotalOriginal, currencyCode)}
            </span>
          </div>
          {calc.discountAmount > 0 && (
            <div className="text-teal-800">
              Applied Commercial Discount ({quote.discountSettings.rate}%): -
              <span className="font-mono font-bold">
                {formatCurrencyVal(calc.discountAmount, currencyCode)}
              </span>
            </div>
          )}
          <div className="text-sm font-black text-slate-900">
            Net Investment Total:{' '}
            <span className="font-mono text-base text-slate-900 font-extrabold">
              {formatCurrencyVal(calc.subtotalDiscounted, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Commercial Terms & Payment Schedule Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-600" /> Commercial Structure & Multi-Year Payment Terms
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
            Configure multi-year commitment duration, annual discount incentives, and payment schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Billing Cadence */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Billing Cadence
            </span>
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-2xs">
              <Tooltip content="Annual subscription billing with custom discount eligibility" position="top" className="flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleBillingCycle('annual')}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    quote.discountSettings.billingCycle === 'annual'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual Billing
                </button>
              </Tooltip>
              <Tooltip content="Monthly subscription cadence without annual discount incentives" position="top" className="flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleBillingCycle('monthly')}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    quote.discountSettings.billingCycle === 'monthly'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly (0% Disc)
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Discount Rate Input */}
          <div className="space-y-1.5">
            <Tooltip content="Set percentage discount applied to eligible subscription line items" position="top">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 cursor-pointer">
                <Percent className="w-3.5 h-3.5 text-teal-600" /> Commercial Discount Rate
              </label>
            </Tooltip>
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={quote.discountSettings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                disabled={quote.discountSettings.billingCycle === 'monthly'}
                className="w-full text-center font-bold text-xs text-slate-900 outline-none bg-transparent disabled:opacity-40"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>

          {/* Multi-Year Commitment Term */}
          <div className="space-y-1.5">
            <Tooltip content="Select contract term duration in years" position="top">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Contract Duration
              </label>
            </Tooltip>
            <select
              value={quote.discountSettings.commitmentYears || 1}
              onChange={(e) => handleCommitmentYearsChange(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs"
            >
              <option value={1}>1 Year Term</option>
              <option value={2}>2 Years Multi-Year</option>
              <option value={3}>3 Years Multi-Year</option>
              <option value={5}>5 Years Multi-Year</option>
            </select>
          </div>

          {/* Payment Schedule Option */}
          <div className="space-y-1.5">
            <Tooltip content="Select invoice installment payment frequency" position="top">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 cursor-pointer">
                <PiggyBank className="w-3.5 h-3.5 text-teal-600" /> Payment Schedule
              </label>
            </Tooltip>
            <select
              value={quote.discountSettings.paymentSchedule || 'Annually'}
              onChange={(e) =>
                handlePaymentScheduleChange(
                  e.target.value as 'Upfront' | 'Annually' | 'Bi-annually' | 'Quarterly' | 'Monthly'
                )
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs"
            >
              <option value="Upfront">Upfront (100% at Signing)</option>
              <option value="Annually">Annually (1x / Year)</option>
              <option value="Bi-annually">Bi-annually (2x / Year)</option>
              <option value="Quarterly">Quarterly (4x / Year)</option>
              <option value="Monthly">Monthly Installments</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Executive Financial Investment Card */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl shadow-indigo-950/20 border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-950/80 border border-pink-700/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-pink-400" /> Total Contract Value Summary
            </span>
            {calc.discountAmount > 0 && (
              <span className="text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md">
                Savings: {formatCurrencyVal(calc.discountAmount, currencyCode)} ({calc.effectiveDiscountRate.toFixed(1)}% Discount)
              </span>
            )}
          </div>

          {/* Annual Value (ACV) */}
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white pt-1">
            {formatCurrencyVal(calc.grandTotal, currencyCode)}{' '}
            <span className="text-xs font-bold text-slate-300 font-sans uppercase tracking-wider">
              {currencyCode} / Annual Contract Value (ACV)
            </span>
          </div>

          {/* Multi-Year TCV & Installment Breakdown */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-300 font-semibold pt-1">
            <div>
              Total Multi-Year Value ({calc.commitmentYears} Yrs):{' '}
              <strong className="text-white font-mono font-bold text-sm">
                {formatCurrencyVal(calc.multiYearTotal, currencyCode)} {currencyCode}
              </strong>
            </div>
            <div className="text-teal-300">
              Installment Amount:{' '}
              <strong className="text-white font-mono font-bold text-sm">
                {formatCurrencyVal(calc.installmentAmount, currencyCode)} {currencyCode}
              </strong>{' '}
              ({calc.installmentLabel})
            </div>
          </div>
        </div>

        {/* Primary Single PDF Export Action */}
        <div className="shrink-0 w-full md:w-auto">
          <Tooltip content="Generate and download high-resolution PDF sales proposal document" position="left">
            <button
              type="button"
              onClick={() => exportToPdf(quote)}
              className="w-full md:w-auto px-7 py-4 bg-gradient-to-r from-teal-400 via-indigo-500 to-pink-500 hover:from-teal-300 hover:to-pink-400 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-pink-500/25 transition transform active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" /> Export Proposal (PDF)
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 4. Creator Contact Information in Footer */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-indigo-50 pb-2">
          <UserCheck className="w-4 h-4 text-purple-600" /> Proposal Issued By — Advisory Contact Information
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Author Name */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Name</span>
              <input
                type="text"
                value={creator.authorName}
                onChange={(e) => handleUpdateCreatorField('authorName', e.target.value)}
                placeholder="Name"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Author Email */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
              <input
                type="text"
                value={creator.authorEmail}
                onChange={(e) => handleUpdateCreatorField('authorEmail', e.target.value)}
                placeholder="Email"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Department</span>
              <input
                type="text"
                value={creator.department || ''}
                onChange={(e) => handleUpdateCreatorField('department', e.target.value)}
                placeholder="Department"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
              <input
                type="text"
                value={creator.authorPhone}
                onChange={(e) => handleUpdateCreatorField('authorPhone', e.target.value)}
                placeholder="Phone Number"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Website */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Website</span>
              <input
                type="text"
                value={creator.companyWebsite}
                onChange={(e) => handleUpdateCreatorField('companyWebsite', e.target.value)}
                placeholder="Website"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Support Email */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Support Email</span>
              <input
                type="text"
                value={creator.supportEmail}
                onChange={(e) => handleUpdateCreatorField('supportEmail', e.target.value)}
                placeholder="Support Email"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Terms, Disclaimer Notice */}
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" /> Commercial Terms & Legal Disclaimer Notice
        </label>
        <textarea
          rows={3}
          value={quote.disclaimerNotice}
          onChange={(e) => onChangeDisclaimer(e.target.value)}
          placeholder="Stipulations & commercial terms..."
          className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-teal-500 transition resize-y font-sans shadow-2xs"
        />
      </div>
    </div>
  );
};

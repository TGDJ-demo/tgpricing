import React, { useState } from 'react';
import { QuoteData, DiscountSettings, CreatorContactInfo } from '../types';
import { calculateQuoteLineItems, formatCurrencyVal, exportToPdf, exportToDocx, exportToExcel } from '../utils/exportUtils';
import { PROPOSAL_THEMES } from '../data/themes';
import {
  Tag,
  Percent,
  PiggyBank,
  FileText,
  Printer,
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
  ChevronDown,
} from 'lucide-react';

interface LineItemsSummaryProps {
  quote: QuoteData;
  onChangeDiscount: (discount: DiscountSettings) => void;
  onChangeDisclaimer: (text: string) => void;
  onChangeCreatorInfo?: (creator: CreatorContactInfo) => void;
  onExcludeLineItem: (itemId: string) => void;
  onOpenGoogleSheetsModal: () => void;
  currencyCode: string;
}

export const LineItemsSummary: React.FC<LineItemsSummaryProps> = ({
  quote,
  onChangeDiscount,
  onChangeDisclaimer,
  onChangeCreatorInfo,
  onExcludeLineItem,
  onOpenGoogleSheetsModal,
  currencyCode,
}) => {
  const [showMoreExports, setShowMoreExports] = useState(false);
  const calc = calculateQuoteLineItems(quote);
  const theme = PROPOSAL_THEMES[quote.themePreset || 'slate-teal'] || PROPOSAL_THEMES['slate-teal'];

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-600" /> Commercial Line Item Summary
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {calc.lineItems.length} Active Items
          </span>
        </div>

        <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 px-1">
          <span className="col-span-6 sm:col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-3 sm:col-span-3 text-right">Subtotal</span>
          <span className="col-span-1 text-center">Delete</span>
        </div>

        {calc.lineItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No line items selected yet. Select devices, browsers, or add-ons above.
          </div>
        ) : (
          <div className="space-y-2 divide-y divide-slate-100">
            {calc.lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center text-xs text-slate-800 pt-2 px-1 hover:bg-slate-50/50 rounded-lg transition"
              >
                <div className="col-span-6 sm:col-span-6 flex flex-col pr-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    {item.label}
                    {!item.isDiscountable && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                        Discount Exempt
                      </span>
                    )}
                  </span>
                  {item.note && (
                    <span className="text-[11px] text-slate-500 italic pl-1">
                      Note: {item.note}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-slate-700">
                  {item.qty}
                </div>
                <div className="col-span-3 sm:col-span-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrencyVal(item.totalDiscounted, currencyCode)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => onExcludeLineItem(item.id)}
                    className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 flex items-center justify-center transition"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subtotal Summary Footer */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
          <div>
            Base Subtotal:{' '}
            <span className="font-mono text-slate-900">
              {formatCurrencyVal(calc.subtotalOriginal, currencyCode)}
            </span>
          </div>
          {calc.discountAmount > 0 && (
            <div className="text-teal-700">
              Applied Discount ({quote.discountSettings.rate}%): -
              <span className="font-mono font-bold">
                {formatCurrencyVal(calc.discountAmount, currencyCode)}
              </span>
            </div>
          )}
          <div className="text-sm font-bold text-slate-900">
            Net Total:{' '}
            <span className="font-mono text-base text-[#2c3260]">
              {formatCurrencyVal(calc.subtotalDiscounted, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Multi-Year & Payment Schedule Controls (Requirement 8) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
          <CreditCard className="w-4 h-4 text-emerald-600" /> Contract Term & Payment Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Billing Cycle */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Billing Cadence
            </span>
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleToggleBillingCycle('annual')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                  quote.discountSettings.billingCycle === 'annual'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Billing
              </button>
              <button
                type="button"
                onClick={() => handleToggleBillingCycle('monthly')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                  quote.discountSettings.billingCycle === 'monthly'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly (0% Disc)
              </button>
            </div>
          </div>

          {/* Discount Rate Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-teal-600" /> Discount Rate
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
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
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Commitment Term
            </label>
            <select
              value={quote.discountSettings.commitmentYears || 1}
              onChange={(e) => handleCommitmentYearsChange(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value={1}>1 Year Term</option>
              <option value={2}>2 Years Multi-Year</option>
              <option value={3}>3 Years Multi-Year</option>
              <option value={5}>5 Years Multi-Year</option>
            </select>
          </div>

          {/* Payment Schedule Option (Upfront, Annually, Bi-annually) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" /> Payment Schedule
            </label>
            <select
              value={quote.discountSettings.paymentSchedule || 'Annually'}
              onChange={(e) =>
                handlePaymentScheduleChange(
                  e.target.value as 'Upfront' | 'Annually' | 'Bi-annually' | 'Quarterly' | 'Monthly'
                )
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
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

      {/* 3. Executive Financial Investment Card (Requirement 8 - ACV, TCV, Installment Amount) */}
      <div
        className="rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-white/10 px-2.5 py-0.5 rounded-md">
              Total Contract Summary
            </span>
            {calc.discountAmount > 0 && (
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Save {formatCurrencyVal(calc.discountAmount, currencyCode)} ({calc.effectiveDiscountRate.toFixed(1)}% Off)
              </span>
            )}
          </div>

          {/* Annual Value (ACV) */}
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight pt-1">
            {formatCurrencyVal(calc.grandTotal, currencyCode)}{' '}
            <span className="text-xs font-bold text-slate-300 font-sans uppercase">
              {currencyCode} / Annual Contract Value
            </span>
          </div>

          {/* Multi-Year TCV & Installment Breakdown */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-200 font-medium pt-1">
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

        {/* Primary Single PDF Export Action (Requirement 1) */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => exportToPdf(quote)}
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition"
          >
            <Download className="w-4 h-4 text-slate-950" /> Export Proposal (PDF)
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreExports(!showMoreExports)}
              className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition"
            >
              <span>Other Export Formats (Word / Excel)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMoreExports && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    exportToDocx(quote);
                    setShowMoreExports(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-indigo-600" /> Export Word Document (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportToExcel(quote);
                    setShowMoreExports(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-600" /> Export Excel Sheet (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenGoogleSheetsModal();
                    setShowMoreExports(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-600" /> Copy for Google Sheets / CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Creator Contact Information in Footer (Requirement 4: Name, Email, Department, Phone) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
          <UserCheck className="w-4 h-4 text-teal-600" /> Proposal Issued By — Advisory Contact Information
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Author Name */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Department</span>
              <input
                type="text"
                value={creator.department || ''}
                onChange={(e) => handleUpdateCreatorField('department', e.target.value)}
                placeholder="Department (e.g. Solutions Advisory)"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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

      {/* 5. Terms, Disclaimer & Page Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Commercial Terms & Legal Disclaimer
          </label>
          <textarea
            rows={3}
            value={quote.disclaimerNotice}
            onChange={(e) => onChangeDisclaimer(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-teal-500 transition resize-y font-sans"
          />
        </div>

        <div className="lg:col-span-4 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Print / Browser View
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Print / Save Web View
          </button>
        </div>
      </div>
    </div>
  );
};

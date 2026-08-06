import React from 'react';
import { QuoteCustomerInfo } from '../types';
import { Tooltip } from './Tooltip';
import {
  User,
  Building2,
  UserCheck,
  Calendar,
  Clock,
  FileCode,
  Mail,
  CreditCard,
  RefreshCw,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

interface CustomerHeaderProps {
  customerInfo: QuoteCustomerInfo;
  onChangeCustomerInfo: (updated: QuoteCustomerInfo) => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customerInfo,
  onChangeCustomerInfo,
}) => {
  const handleChange = (field: keyof QuoteCustomerInfo, value: string) => {
    onChangeCustomerInfo({ ...customerInfo, [field]: value });
  };

  const handleGenerateQuoteNum = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    handleChange('quoteNumber', `TG-${year}-${randomNum}`);
  };

  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-50 pb-5">
        <div className="flex items-center gap-3.5">
          {/* Default Clean TestGrid Modern Gradient Brand Badge */}
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-purple-500/20 shrink-0">
            TG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                TestGrid Enterprise Proposal
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Commercial Quote
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
              Enterprise Automated Testing Platform & Cross-Browser Infrastructure
            </p>
          </div>
        </div>

        {/* Reference Number Badge with Hover Description */}
        <div className="flex items-center gap-2">
          <Tooltip content="Unique commercial proposal reference ID for client tracking" position="left">
            <div className="text-xs font-mono font-bold text-indigo-950 bg-gradient-to-r from-blue-50/80 to-purple-50/80 px-3.5 py-2 rounded-xl border border-indigo-200/80 flex items-center gap-2 shadow-2xs">
              <FileCode className="w-4 h-4 text-indigo-600" /> Ref: {customerInfo.quoteNumber}
              <Tooltip content="Generate new random quote reference number" position="top">
                <button
                  type="button"
                  onClick={handleGenerateQuoteNum}
                  className="text-indigo-400 hover:text-indigo-700 transition p-1 hover:bg-indigo-100/60 rounded-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Metadata Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Name */}
        <div className="space-y-1.5">
          <Tooltip content="Specify the name of the prospective purchasing client" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <User className="w-3.5 h-3.5 text-purple-500" /> Client / Customer Name
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="e.g. Acme Enterprise"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Customer Email */}
        <div className="space-y-1.5">
          <Tooltip content="Primary email contact for procurement & technical review" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Mail className="w-3.5 h-3.5 text-purple-500" /> Client Email Contact
            </label>
          </Tooltip>
          <input
            type="email"
            value={customerInfo.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            placeholder="e.g. procurement@acme.com"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Provider Organization */}
        <div className="space-y-1.5">
          <Tooltip content="Issuing platform provider entity" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Building2 className="w-3.5 h-3.5 text-teal-500" /> Provider Entity
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-xs font-semibold text-purple-950 outline-none cursor-default"
          />
        </div>

        {/* Account Executive */}
        <div className="space-y-1.5">
          <Tooltip content="Name of Account Representative or Solutions Engineer issuing quote" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <UserCheck className="w-3.5 h-3.5 text-pink-500" /> Account Lead
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.preparedBy}
            onChange={(e) => handleChange('preparedBy', e.target.value)}
            placeholder="Your Name"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Issue Date */}
        <div className="space-y-1.5">
          <Tooltip content="Official publication date of this commercial proposal" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Proposal Issue Date
            </label>
          </Tooltip>
          <input
            type="date"
            value={customerInfo.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Quote Validity */}
        <div className="space-y-1.5">
          <Tooltip content="Number of days this proposal and pricing guarantee remains active" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-purple-500" /> Quote Validity
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.validityDays}
            onChange={(e) => handleChange('validityDays', e.target.value)}
            placeholder="e.g. 30 days"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Payment Terms */}
        <div className="space-y-1.5">
          <Tooltip content="Standard invoice payment timeframe agreement (e.g., Net 30 Days)" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <CreditCard className="w-3.5 h-3.5 text-teal-500" /> Invoicing Window
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
            placeholder="e.g. Net 30 Days"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs"
          />
        </div>

        {/* Quote Reference ID */}
        <div className="space-y-1.5">
          <Tooltip content="Custom reference code for tracking and internal billing" position="top">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Briefcase className="w-3.5 h-3.5 text-pink-500" /> Reference ID
            </label>
          </Tooltip>
          <input
            type="text"
            value={customerInfo.quoteNumber}
            onChange={(e) => handleChange('quoteNumber', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-300 outline-none transition shadow-2xs font-mono"
          />
        </div>
      </div>
    </div>
  );
};

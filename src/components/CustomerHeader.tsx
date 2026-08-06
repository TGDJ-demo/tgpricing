import React from 'react';
import { QuoteCustomerInfo } from '../types';
import { ProposalThemeKey, PROPOSAL_THEMES } from '../data/themes';
import {
  User,
  Building,
  UserCheck,
  Calendar,
  Clock,
  FileCode,
  Mail,
  CreditCard,
  RefreshCw,
  Upload,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

interface CustomerHeaderProps {
  customerInfo: QuoteCustomerInfo;
  themePreset?: ProposalThemeKey;
  onChangeCustomerInfo: (updated: QuoteCustomerInfo) => void;
  onChangeTheme?: (themeKey: ProposalThemeKey) => void;
}

const PRESET_LOGOS = [
  {
    name: 'TestGrid Default',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><text x="0" y="28" font-family="Arial,sans-serif" font-weight="900" font-size="24" fill="%232c3260">Test<tspan fill="%2352bfa3">Grid</tspan></text></svg>',
  },
  {
    name: 'Apex Tech Logo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><polygon points="10,32 25,8 40,32" fill="%234f46e5"/><text x="48" y="28" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="%231e1b4b">APEX<tspan fill="%23f43f5e"> LABS</tspan></text></svg>',
  },
  {
    name: 'Enterprise Shield',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><path d="M10,8 L28,8 L28,26 Q19,36 10,26 Z" fill="%230f172a"/><text x="36" y="27" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="%230f172a">PRIME<tspan fill="%23d97706"> CORP</tspan></text></svg>',
  },
];

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customerInfo,
  themePreset = 'slate-teal',
  onChangeCustomerInfo,
  onChangeTheme,
}) => {
  const handleChange = (field: keyof QuoteCustomerInfo, value: string) => {
    onChangeCustomerInfo({ ...customerInfo, [field]: value });
  };

  const handleGenerateQuoteNum = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    handleChange('quoteNumber', `TG-${year}-${randomNum}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentTheme = PROPOSAL_THEMES[themePreset] || PROPOSAL_THEMES['slate-teal'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
      {/* Top Bar: Title & Theme Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
            style={{ backgroundColor: currentTheme.primaryColor }}
          >
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Proposal Metadata & Client Settings
            </h2>
            <p className="text-xs text-slate-500">
              Customize client details, proposal theme, and vendor branding logo
            </p>
          </div>
        </div>

        {/* Reference ID Pill & Theme Picker */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-slate-500" /> Ref: {customerInfo.quoteNumber}
            <button
              type="button"
              onClick={handleGenerateQuoteNum}
              className="text-slate-400 hover:text-slate-700 transition p-0.5"
              title="Generate New Ref ID"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>

      {/* Theme Selection Preset Bar (Requirement 7) */}
      {onChangeTheme && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-slate-500" /> Proposal Aesthetic Theme
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              Selected: <strong className="text-slate-900">{currentTheme.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(PROPOSAL_THEMES) as ProposalThemeKey[]).map((key) => {
              const themeItem = PROPOSAL_THEMES[key];
              const isSelected = themePreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeTheme(key)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-2xs'
                      : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: themeItem.primaryColor }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 truncate">
                    {themeItem.name.replace('TestGrid ', '').replace('Modern ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendor Logo Updater Section (Requirement 2) */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Vendor Branding Logo
          </label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-teal-600" /> Upload Custom Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {customerInfo.logoUrl && (
              <button
                type="button"
                onClick={() => handleChange('logoUrl', '')}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Reset Logo
              </button>
            )}
          </div>
        </div>

        {/* Logo Preview & Presets */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center min-w-[120px] h-12 shadow-2xs">
            {customerInfo.logoUrl ? (
              <img
                src={customerInfo.logoUrl}
                alt="Vendor Logo"
                className="max-h-8 max-w-[140px] object-contain"
              />
            ) : (
              <span className="text-[11px] font-bold text-[#2c3260]">
                Test<span className="text-[#52bfa3]">Grid</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-slate-500">Preset Logos:</span>
            {PRESET_LOGOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleChange('logoUrl', preset.url)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                  customerInfo.logoUrl === preset.url
                    ? 'bg-white border-teal-500 text-teal-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Customer & Proposal Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Customer Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" /> Customer / Client Name
          </label>
          <input
            type="text"
            value={customerInfo.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="e.g. Acme Enterprise"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Customer Email */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" /> Customer Email
          </label>
          <input
            type="email"
            value={customerInfo.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            placeholder="e.g. procurement@acme.com"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Vendor Provider Company */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" /> Provider Organization
          </label>
          <input
            type="text"
            value={customerInfo.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none"
          />
        </div>

        {/* Prepared By */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-400" /> Account Executive
          </label>
          <input
            type="text"
            value={customerInfo.preparedBy}
            onChange={(e) => handleChange('preparedBy', e.target.value)}
            placeholder="Your Name"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Issue Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" /> Proposal Date
          </label>
          <input
            type="date"
            value={customerInfo.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Validity */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Quote Validity
          </label>
          <input
            type="text"
            value={customerInfo.validityDays}
            onChange={(e) => handleChange('validityDays', e.target.value)}
            placeholder="e.g. 30 days"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Payment Terms */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" /> Payment Terms
          </label>
          <input
            type="text"
            value={customerInfo.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
            placeholder="e.g. Net 30 Days"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Reference ID */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <FileCode className="w-3 h-3 text-slate-400" /> Quote Reference ID
          </label>
          <input
            type="text"
            value={customerInfo.quoteNumber}
            onChange={(e) => handleChange('quoteNumber', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition font-mono"
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CurrencyOption, WatermarkSettings } from '../types';
import { CURRENCIES } from '../data/defaults';
import { Stamp, FolderOpen, RotateCcw, DollarSign } from 'lucide-react';

interface NavbarProps {
  watermarkSettings: WatermarkSettings;
  onOpenWatermarkModal: () => void;
  onOpenHistoryModal: () => void;
  selectedCurrency: string;
  onCurrencyChange: (code: string) => void;
  onResetQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  watermarkSettings,
  onOpenWatermarkModal,
  onOpenHistoryModal,
  selectedCurrency,
  onCurrencyChange,
  onResetQuote,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-2xl tracking-tight text-[#2c3260]">
            <span>Test</span>
            <span className="text-[#52bfa3]">Grid</span>
          </div>
          <span className="hidden sm:inline-block h-5 w-px bg-slate-200"></span>
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-500">
            Quote Estimator & Generator
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <div className="relative flex items-center bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <select
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {CURRENCIES.map((c: CurrencyOption) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Watermark Modal Button */}
          <button
            type="button"
            onClick={onOpenWatermarkModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              watermarkSettings.enabled
                ? 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Configure Watermark Branding"
          >
            <Stamp className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Watermark</span>
            <span
              className={`w-2 h-2 rounded-full ${
                watermarkSettings.enabled ? 'bg-teal-500' : 'bg-slate-400'
              }`}
            ></span>
          </button>

          {/* Quote Library Button */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="px-3 py-1.5 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Quote History & Templates"
          >
            <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Templates & Library</span>
          </button>

          {/* Reset Quote */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset quote to default values? Any unsaved changes will be cleared.')) {
                onResetQuote();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="Reset Quote"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

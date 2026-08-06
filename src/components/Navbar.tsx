import React from 'react';
import { CurrencyOption, WatermarkSettings } from '../types';
import { CURRENCIES } from '../data/defaults';
import { Stamp, FolderOpen, RotateCcw, DollarSign } from 'lucide-react';
import { Tooltip } from './Tooltip';

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
    <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-2xl tracking-tight text-slate-900">
            <span>Test</span>
            <span className="bg-gradient-to-r from-teal-500 via-purple-600 to-pink-500 bg-clip-text text-transparent font-black">
              Grid
            </span>
          </div>
          <span className="hidden sm:inline-block h-5 w-px bg-purple-200"></span>
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-purple-800/80">
            Enterprise Proposal Studio
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <Tooltip content="Select base commercial currency (USD $, EUR €, GBP £, etc.)" position="bottom">
            <div className="relative flex items-center bg-gradient-to-r from-blue-50 to-indigo-50/80 rounded-xl px-2.5 py-1.5 border border-indigo-200/80 shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 mr-1" />
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-indigo-950 outline-none cursor-pointer pr-1"
              >
                {CURRENCIES.map((c: CurrencyOption) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>

          {/* Watermark Modal Button */}
          <Tooltip content="Configure background watermark text, color, opacity, or custom logo overlay" position="bottom">
            <button
              type="button"
              onClick={onOpenWatermarkModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition shadow-2xs ${
                watermarkSettings.enabled
                  ? 'bg-gradient-to-r from-teal-50 via-purple-50 to-pink-50 border-purple-300 text-purple-950 hover:border-purple-400'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Stamp className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Watermark Config</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  watermarkSettings.enabled ? 'bg-pink-500' : 'bg-slate-400'
                }`}
              ></span>
            </button>
          </Tooltip>

          {/* Quote Library Button */}
          <Tooltip content="Load saved proposal drafts, client quotes, or pre-built industry templates" position="bottom">
            <button
              type="button"
              onClick={onOpenHistoryModal}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:border-purple-300 text-indigo-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Templates & History</span>
            </button>
          </Tooltip>

          {/* Reset Quote */}
          <Tooltip content="Reset proposal form to default baseline values" position="bottom">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset proposal to default baseline values? Unsaved changes will be cleared.')) {
                  onResetQuote();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

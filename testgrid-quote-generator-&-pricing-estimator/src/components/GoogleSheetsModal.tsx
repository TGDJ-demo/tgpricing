import React, { useState } from 'react';
import { QuoteData } from '../types';
import { exportToGoogleSheetsCSV } from '../utils/exportUtils';
import { X, FileSpreadsheet, Copy, Check, ExternalLink, Download } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteData;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  quote,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { csvContent, tsvClipboard } = exportToGoogleSheetsCSV(quote);

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tsvClipboard);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `TestGrid_Quote_${quote.customerInfo.quoteNumber || 'Estimate'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Google Sheets Export & Integration</h3>
              <p className="text-xs text-emerald-200">
                Instant copy for Google Sheets paste or CSV download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Option 1: One-Click Copy */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  1. Copy Tabular Data to Clipboard
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Formatted as TSV grid. Open any Google Sheet and press{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono text-[10px] text-emerald-900">
                    Ctrl + V
                  </kbd>{' '}
                  or{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono text-[10px] text-emerald-900">
                    Cmd + V
                  </kbd>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>

          {/* Option 2: Open Google Sheets directly */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  2. Launch Google Sheets
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Opens a fresh blank spreadsheet in a new Google Sheets browser tab
                </p>
              </div>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition shrink-0"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                Open sheets.new
              </a>
            </div>
          </div>

          {/* Option 3: Download CSV */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  3. Download Formatted CSV File
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Export structured .csv file compatible with Google Sheets File &rarr; Import
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition shrink-0"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Code Preview box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Data Preview
            </label>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-32 border border-slate-800">
              {tsvClipboard}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

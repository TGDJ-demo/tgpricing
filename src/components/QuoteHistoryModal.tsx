import React, { useState, useEffect } from 'react';
import { QuoteData } from '../types';
import { SAMPLE_TEMPLATES } from '../data/defaults';
import { X, Save, FolderOpen, Trash2, Copy, Sparkles, Download, Upload, Check } from 'lucide-react';

interface QuoteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuote: QuoteData;
  onLoadQuote: (quote: QuoteData) => void;
}

const LOCAL_STORAGE_KEY = 'testgrid_saved_quotes';

export const QuoteHistoryModal: React.FC<QuoteHistoryModalProps> = ({
  isOpen,
  onClose,
  currentQuote,
  onLoadQuote,
}) => {
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          setSavedQuotes(JSON.parse(raw));
        } else {
          setSavedQuotes([]);
        }
      } catch {
        setSavedQuotes([]);
      }
      setSaveTitle(`${currentQuote.customerInfo.customerName || 'Draft'} - ${currentQuote.customerInfo.quoteNumber}`);
    }
  }, [isOpen, currentQuote]);

  if (!isOpen) return null;

  const persistQuotes = (updated: QuoteData[]) => {
    setSavedQuotes(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage quota
    }
  };

  const handleSaveCurrent = () => {
    const newQuoteRecord: QuoteData = {
      ...currentQuote,
      id: `quote-${Date.now()}`,
      title: saveTitle || 'Saved Quote',
      updatedAt: new Date().toISOString(),
    };

    const updated = [newQuoteRecord, ...savedQuotes.filter((q) => q.id !== currentQuote.id)];
    persistQuotes(updated);
    setSaveSuccessMsg('Quote saved successfully to local library!');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = savedQuotes.filter((q) => q.id !== id);
    persistQuotes(updated);
  };

  const handleLoadTemplate = (templateData: Partial<QuoteData>) => {
    const merged: QuoteData = {
      ...currentQuote,
      ...templateData,
      updatedAt: new Date().toISOString(),
    };
    onLoadQuote(merged);
    onClose();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(currentQuote, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentQuote.customerInfo.quoteNumber || 'TestGrid_Quote'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.customerInfo && parsed.plans) {
          onLoadQuote(parsed);
          onClose();
        }
      } catch {
        alert('Invalid Quote JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Quote Library & Preset Templates</h3>
              <p className="text-xs text-slate-400">
                Save, load, duplicate, or import/export quote configurations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Save Current Quote */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Save className="w-4 h-4 text-slate-600" /> Save Current Active Quote
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter quote name..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <Save className="w-3.5 h-3.5" /> Save to Library
              </button>
            </div>
            {saveSuccessMsg && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {saveSuccessMsg}
              </p>
            )}
          </div>

          {/* Preset Industry Templates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Starter Preset Templates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-slate-200 hover:border-purple-300 rounded-xl shadow-2xs transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {tmpl.name}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate(tmpl.data)}
                    className="mt-3 w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" /> Load Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Quotes History List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Saved Quotes ({savedQuotes.length})
            </h4>
            {savedQuotes.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                No saved quotes found in local storage yet. Click "Save to Library" above to save your current quote configuration.
              </div>
            ) : (
              <div className="space-y-2">
                {savedQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        {q.title || 'Untitled Quote'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {q.customerInfo.customerName || 'No customer'} · {q.customerInfo.quoteNumber} · Saved {new Date(q.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadQuote(q);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* JSON Backup & Restore */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">
              Backup & Transfer Configuration
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" /> Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

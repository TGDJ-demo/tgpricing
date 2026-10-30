import { useEffect, useState } from 'react';
import { Download, FileText, Printer, X } from 'lucide-react';
import { QuoteData } from '../types';
import { buildPdfPreview, PdfDensity, PdfPreviewResult } from '../utils/pdfPreview';
import { PdfDocumentPreview } from './PdfDocumentPreview';

interface PdfPreviewModalProps {
  quote: QuoteData;
  type: 'quote' | 'order' | null;
  onClose: () => void;
}

export function PdfPreviewModal({ quote, type, onClose }: PdfPreviewModalProps) {
  const [density, setDensity] = useState<PdfDensity>('balanced');
  const [preview, setPreview] = useState<PdfPreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) return;
    setDensity('balanced');
  }, [type]);

  useEffect(() => {
    if (!type) return;
    setError(null);
    setPreview(null);

    try {
      const result = buildPdfPreview(quote, type, density);
      setPreview(result);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'PDF preview generation failed.');
    }
  }, [quote, type, density]);

  if (!type) return null;

  const download = () => {
    if (!preview?.blob || !preview.fitsOnePage) return;
    const previewUrl = URL.createObjectURL(preview.blob);
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = preview.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 1000);
  };

  const print = () => {
    window.print();
  };

  const title = type === 'order' ? 'Sales order' : 'Quote';
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} PDF preview`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[min(94vh,960px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/70 to-pink-50/60 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText className="h-5 w-5 shrink-0 text-indigo-700" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900">{title} PDF preview</h2>
              <p className="text-[11px] text-slate-500">The selected spacing is used for preview and download.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              Spacing
              <select
                aria-label="PDF spacing"
                value={density}
                onChange={(event) => setDensity(event.target.value as PdfDensity)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
              >
                <option value="compact">Tight</option>
                <option value="balanced">Balanced</option>
                <option value="roomy">More space</option>
              </select>
            </label>
            <button
              type="button"
              onClick={print}
              disabled={!preview}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!preview?.fitsOnePage || !preview?.blob}
              title={preview?.fitsOnePage ? 'Download the approved one-page PDF' : 'Adjust spacing or shorten content until the document fits one page.'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF preview"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {error ? (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : preview && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs sm:px-6">
            <span className={preview.fitsOnePage ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
              {preview.fitsOnePage
                ? `Ready to download · ${preview.editableFieldCount} editable fields`
                : `Download unavailable · ${preview.pageCount} page(s), ${preview.editableFieldCount} editable fields`}
            </span>
            {preview.warnings.length > 0 && (
              <span className="text-slate-600">{preview.warnings.join(' ')}</span>
            )}
          </div>
        )}

        {preview && (
          <PdfDocumentPreview quote={quote} type={type} density={density} />
        )}
        {!preview && !error && (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm text-slate-500">
            Preparing the document preview…
          </div>
        )}
      </div>
    </div>
  );
}

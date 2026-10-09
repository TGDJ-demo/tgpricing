import React, { useEffect, useState } from 'react';
import { X, Download, FileText, Maximize2 } from 'lucide-react';
import { QuoteData } from '../types';
import { buildPdfExport, PdfDensity, PdfExportResult } from '../utils/pdfExport';

export const PdfPreviewModal: React.FC<{ quote: QuoteData; type: 'quote' | 'order'; onClose: () => void }> = ({ quote, type, onClose }) => {
  const [density, setDensity] = useState<PdfDensity>('balanced');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<PdfExportResult | null>(null);
  useEffect(() => {
    setUrl('');
    const nextResult = buildPdfExport(quote, type, density);
    setResult(nextResult);
    if (!nextResult.blob) return;
    const nextUrl = URL.createObjectURL(nextResult.blob);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [quote, type, density]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  const name = quote.customerInfo.customerName?.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Customer';
  const date = type === 'order' ? quote.salesOrder.orderDate : quote.customerInfo.date;
  const filename = `${name}_${type === 'order' ? 'Sales_Order_Form' : 'Quote'}_${date}.pdf`;
  const setLayout = (value: string) => setDensity(value as PdfDensity);
  return <div onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/65 p-2 pt-3 backdrop-blur-md sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="PDF preview">
    <div className="isolate flex h-[calc(100dvh-1.25rem)] max-h-[900px] w-full max-w-7xl shrink-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-2xl shadow-indigo-950/20 backdrop-blur-2xl sm:h-[min(96dvh,900px)]">
      <header className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-indigo-100/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3"><div className="rounded-lg bg-slate-900 p-2 text-amber-300"><FileText className="h-4 w-4"/></div><div><div className="text-sm font-semibold text-slate-900">{type === 'order' ? 'Sales order' : 'Commercial quote'} preview</div><div className="text-xs text-slate-500">Editable fields · A4 portrait · fit checked before download</div></div></div>
        <div className="flex items-center gap-2">
          <label className="hidden items-center gap-2 text-xs font-semibold text-indigo-950 sm:flex">Spacing<select value={density} onChange={e=>setLayout(e.target.value)} className="rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-xs text-slate-800 shadow-sm focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300/40"><option value="compact">Tight</option><option value="balanced">Balanced</option><option value="roomy">More space</option></select></label>
          {url && result?.fitsOnePage && result.blob && <a href={url} download={filename} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/20 hover:brightness-105"><Download className="h-4 w-4"/><span className="hidden sm:inline">Download PDF</span></a>}
          <button type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2.5 text-xs font-semibold text-indigo-950 shadow-sm hover:border-purple-300 hover:bg-purple-50" aria-label="Close preview"><X className="h-4 w-4"/><span>Close</span></button>
        </div>
        <label className="flex w-full items-center gap-2 text-xs font-semibold text-indigo-950 sm:hidden">Spacing<select value={density} onChange={e=>setLayout(e.target.value)} className="rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-xs text-slate-800 shadow-sm focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300/40"><option value="compact">Tight</option><option value="balanced">Balanced</option><option value="roomy">More space</option></select></label>
      </header>
      {result && <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs ${result.fitsOnePage ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-950'}`}><span>{result.fitsOnePage ? `Validated · A4 portrait · ${result.pageCount} page · ${result.fieldNames.length} editable fields · ${density} layout` : `Cannot export as one legible A4 page using ${density} spacing`}</span>{!result.fitsOnePage && <span>Shorten long text or choose a tighter layout.</span>}</div>}
      {result?.fitsOnePage && result.warnings.length > 0 && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">{result.warnings.join(' ')}</div>}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50/70 via-purple-50/50 to-pink-50/50 p-2 sm:p-5">
        {url ? <iframe key={url} title={`${type} PDF preview`} src={`${url}#view=FitH&toolbar=1`} className="h-full w-full rounded-lg border border-slate-300 bg-white shadow-lg"/> : result && !result.fitsOnePage ? <div className="max-w-2xl rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm"><div className="text-sm font-semibold text-slate-900">This content needs more room</div><p className="mt-2 text-sm leading-6 text-slate-600">{result.warnings.join(' ')}</p><p className="mt-3 text-xs text-slate-500">The export is held until it fits one A4 page. Change spacing or shorten long fields to continue.</p></div> : <div className="text-sm text-slate-500">Preparing PDF preview…</div>}
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-indigo-100 bg-white/90 px-4 py-2 text-[11px] text-slate-500 backdrop-blur-xl"><span className="flex items-center gap-2"><Maximize2 className="h-3.5 w-3.5 text-purple-500"/> Preview and download use the same generated PDF.</span><span className="hidden sm:inline">Esc to close</span></footer>
    </div>
  </div>;
};

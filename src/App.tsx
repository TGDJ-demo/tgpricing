import { useState, useEffect } from 'react';
import { QuoteData, WatermarkSettings, QuoteCustomerInfo, PlanColumn, AddonItem, CustomServiceItem, DiscountSettings, SalesOrderData } from './types';
import { buildDefaultOrderInstructions, INITIAL_QUOTE_STATE } from './data/defaults';
import { Navbar } from './components/Navbar';
import { CustomerHeader } from './components/CustomerHeader';
import { TierSection } from './components/TierSection';
import { AddonsSection } from './components/AddonsSection';
import { CustomServicesSection } from './components/CustomServicesSection';
import { LineItemsSummary } from './components/LineItemsSummary';
import { WatermarkBackground } from './components/WatermarkBackground';
import { WatermarkConfigModal } from './components/WatermarkConfigModal';
import { QuoteHistoryModal } from './components/QuoteHistoryModal';
import { SalesOrderTab } from './components/SalesOrderTab';

function createOrderFromQuote(quote: QuoteData, forceNew = false): SalesOrderData {
  const legacyCustomer = quote.customerInfo as QuoteCustomerInfo & { poNumber?: string; billingAddress?: string; serviceAddress?: string };
  return quote.salesOrder && !forceNew ? quote.salesOrder : {
    id: `order-${quote.id}`,
    sourceQuoteId: quote.id,
    invoiceNumber: `TG-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    orderDate: new Date().toISOString().split('T')[0],
    purchaseOrderNumber: legacyCustomer.poNumber || '',
    paymentTerms: quote.customerInfo.paymentTerms || 'Net 30 Days',
    billingAddress: legacyCustomer.billingAddress || '',
    serviceAddress: legacyCustomer.serviceAddress || '',
    instructions: (quote as QuoteData & { salesOrderNotes?: string }).salesOrderNotes || buildDefaultOrderInstructions(quote.disclaimerNotice),
  };
}

function normalizeQuote(quote: QuoteData): QuoteData {
  const salesOrder = createOrderFromQuote(quote);
  return {
    ...quote,
    salesOrder: {
      ...salesOrder,
      sourceQuoteId: quote.id,
      instructions: salesOrder.instructions || buildDefaultOrderInstructions(quote.disclaimerNotice),
    },
    watermarkSettings: { ...quote.watermarkSettings, angle: Math.abs(quote.watermarkSettings.angle ?? 20) },
  };
}

export default function App() {
  const [quote, setQuote] = useState<QuoteData>(() => {
    try {
      const active = localStorage.getItem('testgrid_active_quote');
      if (active) {
        return normalizeQuote(JSON.parse(active) as QuoteData);
      }
    } catch {
      // ignore
    }
    return INITIAL_QUOTE_STATE;
  });

  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quote' | 'sales-order'>('quote');

  // Auto-save active state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('testgrid_active_quote', JSON.stringify(quote));
    } catch {
      // quota
    }
  }, [quote]);

  // Handlers for state mutation
  const handleUpdateCustomerInfo = (customerInfo: QuoteCustomerInfo) => {
    setQuote((prev) => ({ ...prev, customerInfo, updatedAt: new Date().toISOString() }));
  };

  const handleUpdatePlans = (plans: PlanColumn[]) => {
    setQuote((prev) => ({ ...prev, plans, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateAddons = (addons: AddonItem[]) => {
    setQuote((prev) => ({ ...prev, addons, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateCustomServices = (customServices: CustomServiceItem[]) => {
    setQuote((prev) => ({ ...prev, customServices, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateDiscount = (discountSettings: DiscountSettings) => {
    setQuote((prev) => ({ ...prev, discountSettings, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateWatermark = (watermarkSettings: WatermarkSettings) => {
    setQuote((prev) => ({ ...prev, watermarkSettings, updatedAt: new Date().toISOString() }));
  };

  const handleExcludeLineItem = (itemId: string) => {
    setQuote((prev) => {
      const current = prev.excludedLineItemIds || [];
      const updated = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, excludedLineItemIds: updated, updatedAt: new Date().toISOString() };
    });
  };

  const handleUpdateCreatorInfo = (creatorContactInfo: any) => {
    setQuote((prev) => ({ ...prev, creatorContactInfo, updatedAt: new Date().toISOString() }));
  };

  const handleToggleAddonsSection = () => {
    setQuote((prev) => ({
      ...prev,
      showAddonsSection: prev.showAddonsSection === false ? true : false,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleToggleServicesSection = () => {
    setQuote((prev) => ({
      ...prev,
      showServicesSection: prev.showServicesSection === false ? true : false,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleCurrencyChange = (code: string) => {
    setQuote((prev) => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, currency: code },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleResetQuote = () => {
    const freshQuote: QuoteData = {
      ...INITIAL_QUOTE_STATE,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerInfo: {
        ...INITIAL_QUOTE_STATE.customerInfo,
        date: new Date().toISOString().split('T')[0],
        quoteNumber: `TG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    };
    freshQuote.salesOrder = createOrderFromQuote(freshQuote, true);
    setQuote(freshQuote);
  };

  const currencySymbol =
    quote.customerInfo.currency === 'EUR'
      ? '€'
      : quote.customerInfo.currency === 'GBP'
      ? '£'
      : '$';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-teal-50/45 to-purple-50/55 font-sans text-slate-800 antialiased selection:bg-purple-500/20 selection:text-purple-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-[100px]" />
        <div className="absolute right-[-8rem] top-[30rem] h-[30rem] w-[30rem] rounded-full bg-teal-300/20 blur-[110px]" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-pink-300/20 blur-[120px]" />
      </div>
      {/* Main Sticky Navbar */}
      <Navbar
        watermarkSettings={quote.watermarkSettings}
        onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        selectedCurrency={quote.customerInfo.currency || 'USD'}
        onCurrencyChange={handleCurrencyChange}
        onResetQuote={handleResetQuote}
      />

      {/* Main Pricing Card Container with Watermark Layer behind Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="mb-5 flex w-fit gap-2 rounded-2xl border border-white/80 bg-white/65 p-1.5 shadow-lg shadow-indigo-950/5 backdrop-blur-xl">
          <button type="button" onClick={() => setActiveTab('quote')} className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'quote' ? 'bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-white/80'}`}>Quote builder</button>
          <button type="button" onClick={() => setActiveTab('sales-order')} className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'sales-order' ? 'bg-gradient-to-r from-sky-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-white/80'}`}>Sales order</button>
        </div>
        {activeTab === 'sales-order' ? <SalesOrderTab quote={quote} order={quote.salesOrder || createOrderFromQuote(quote)} onChangeOrder={(salesOrder) => setQuote((prev) => ({ ...prev, salesOrder, updatedAt: new Date().toISOString() }))} /> : <>
        <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl border border-purple-100/80 rounded-3xl shadow-xl shadow-purple-950/5 p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Background Watermark Layer - Sits behind the entire form and scrolls naturally */}
          <WatermarkBackground settings={quote.watermarkSettings} />

          <div className="relative z-10 space-y-6 sm:space-y-8">
            {/* Section 1: Customer Header & Commercial Metadata */}
            <CustomerHeader
              customerInfo={quote.customerInfo}
              onChangeCustomerInfo={handleUpdateCustomerInfo}
            />

            {/* Section 2: Deployment Plans & License Tiers */}
            <TierSection
              plans={quote.plans}
              onChangePlans={handleUpdatePlans}
              currencySymbol={currencySymbol}
            />

            {/* Section 3: Premium Add-ons Checklist */}
            {quote.showAddonsSection !== false ? (
              <AddonsSection
                addons={quote.addons}
                onChangeAddons={handleUpdateAddons}
                currencySymbol={currencySymbol}
                onRemoveSection={handleToggleAddonsSection}
              />
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500">
                <span>Add-ons Section Hidden</span>
                <button
                  type="button"
                  onClick={handleToggleAddonsSection}
                  className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg border border-teal-200 transition"
                  title="Restore Premium Add-ons Section"
                >
                  + Restore Add-ons Section
                </button>
              </div>
            )}

            {/* Section 4: Professional Custom Services */}
            {quote.showServicesSection !== false ? (
              <CustomServicesSection
                services={quote.customServices}
                onChangeServices={handleUpdateCustomServices}
                currencySymbol={currencySymbol}
                onRemoveSection={handleToggleServicesSection}
              />
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500">
                <span>Professional Services Section Hidden</span>
                <button
                  type="button"
                  onClick={handleToggleServicesSection}
                  className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg border border-slate-300 transition"
                  title="Restore Professional Services Section"
                >
                  + Restore Professional Services Section
                </button>
              </div>
            )}

            {/* Section 5: Itemized Line Items, Multi-Year Payment Terms, Creator Footer & Export Action */}
            <LineItemsSummary
              quote={quote}
              onChangeDiscount={handleUpdateDiscount}
              onChangeDisclaimer={(disclaimerNotice) => setQuote((prev) => {
                const priorCopiedTerms = buildDefaultOrderInstructions(prev.disclaimerNotice);
                const nextCopiedTerms = buildDefaultOrderInstructions(disclaimerNotice);
                const shouldRefreshInstructions = !prev.salesOrder.instructions.trim() || prev.salesOrder.instructions === priorCopiedTerms;
                return {
                  ...prev,
                  disclaimerNotice,
                  salesOrder: shouldRefreshInstructions ? { ...prev.salesOrder, instructions: nextCopiedTerms } : prev.salesOrder,
                };
              })}
              onChangeCreatorInfo={handleUpdateCreatorInfo}
              onExcludeLineItem={handleExcludeLineItem}
              currencyCode={quote.customerInfo.currency || 'USD'}
            />
          </div>
        </div>
        </>}
      </main>

      {/* Modals */}
      <WatermarkConfigModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        settings={quote.watermarkSettings}
        onChange={handleUpdateWatermark}
      />

      <QuoteHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentQuote={quote}
        onLoadQuote={(q) => setQuote(normalizeQuote(q))}
      />
    </div>
  );
}

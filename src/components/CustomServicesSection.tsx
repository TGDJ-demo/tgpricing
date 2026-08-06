import React from 'react';
import { CustomServiceItem } from '../types';
import { Wrench, Plus, X } from 'lucide-react';

interface CustomServicesSectionProps {
  services: CustomServiceItem[];
  onChangeServices: (services: CustomServiceItem[]) => void;
  currencySymbol: string;
  onRemoveSection?: () => void;
}

export const CustomServicesSection: React.FC<CustomServicesSectionProps> = ({
  services,
  onChangeServices,
  currencySymbol,
  onRemoveSection,
}) => {
  const handleUpdate = (
    id: string,
    field: keyof CustomServiceItem,
    value: string | number | boolean
  ) => {
    const updated = services.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    onChangeServices(updated);
  };

  const handleAdd = () => {
    const newService: CustomServiceItem = {
      id: `service-${Date.now()}`,
      description: 'Dedicated Account Management & Onboarding',
      cost: 1500,
      qty: 1,
      billingType: 'one-time',
      discountable: true,
    };
    onChangeServices([...services, newService]);
  };

  const handleDelete = (id: string) => {
    onChangeServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#2c3260]" /> Professional Services & Advisory Line Items
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs font-bold text-[#2c3260] hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Professional Service
          </button>
          {onRemoveSection && (
            <button
              type="button"
              onClick={onRemoveSection}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 px-2.5 py-1.5 rounded-xl border border-red-200 transition flex items-center gap-1"
              title="Remove entire Professional Services Section"
            >
              <X className="w-3.5 h-3.5" /> Remove Section
            </button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2 text-center">
          No additional professional services added. Click above to add onboarding or custom consulting.
        </p>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              {/* Description */}
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleUpdate(service.id, 'description', e.target.value)}
                  placeholder="e.g. Onsite deployment & engineer training"
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Billing Type */}
              <div className="sm:col-span-2">
                <select
                  value={service.billingType}
                  onChange={(e) => handleUpdate(service.id, 'billingType', e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="one-time">One-time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              {/* Cost & Qty & Discount toggle */}
              <div className="sm:col-span-4 flex items-center gap-1.5">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 flex-1">
                  <span className="text-xs font-bold text-slate-400 mr-1">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={service.cost || ''}
                    onChange={(e) =>
                      handleUpdate(service.id, 'cost', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Cost"
                    className="w-full text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <input
                  type="number"
                  min="1"
                  value={service.qty}
                  onChange={(e) =>
                    handleUpdate(service.id, 'qty', parseInt(e.target.value, 10) || 1)
                  }
                  placeholder="Qty"
                  className="w-12 text-center text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(service.id, 'discountable', service.discountable === false ? true : false)
                  }
                  className={`text-[10px] font-bold px-1.5 py-1 rounded border transition shrink-0 ${
                    service.discountable !== false
                      ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                      : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                  }`}
                  title={
                    service.discountable !== false
                      ? 'Discount Eligible (Click to exempt)'
                      : 'Exempt from Discount'
                  }
                >
                  %
                </button>
              </div>

              {/* Red X Delete */}
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(service.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 flex items-center justify-center transition"
                  title="Delete Service"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

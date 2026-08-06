import React from 'react';
import { CustomServiceItem } from '../types';
import { Tooltip } from './Tooltip';
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
      description: 'Dedicated Account Management & Onboarding Support',
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
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-600" /> Professional Services & Consulting
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
            Add custom onboarding, implementation, or engineering support services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Add custom onboarding, training, or engineering deliverable" position="left">
            <button
              type="button"
              onClick={handleAdd}
              className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 hover:from-indigo-100 hover:to-pink-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" /> Add Professional Service
            </button>
          </Tooltip>
          {onRemoveSection && (
            <Tooltip content="Hide or remove Professional Services Section" position="left">
              <button
                type="button"
                onClick={onRemoveSection}
                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition flex items-center gap-1 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" /> Remove Section
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2 text-center">
          No professional services added. Click above to add onboarding or custom implementation.
        </p>
      ) : (
        <div className="space-y-2.5">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs hover:bg-slate-50 transition"
            >
              {/* Description */}
              <div className="sm:col-span-5">
                <Tooltip content="Description of professional service or consulting deliverable" position="top">
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => handleUpdate(service.id, 'description', e.target.value)}
                    placeholder="e.g. Onsite deployment & engineer training"
                    className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
                  />
                </Tooltip>
              </div>

              {/* Billing Type */}
              <div className="sm:col-span-2">
                <Tooltip content="Billing model: one-time fee or recurring service" position="top">
                  <select
                    value={service.billingType}
                    onChange={(e) => handleUpdate(service.id, 'billingType', e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-2 outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="one-time">One-time</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </Tooltip>
              </div>

              {/* Cost & Qty & Discount toggle */}
              <div className="sm:col-span-4 flex items-center gap-2">
                <Tooltip content="Unit cost for this professional service" position="top" className="flex-1">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-2 w-full shadow-2xs">
                    <span className="text-xs font-bold text-slate-500 mr-1">
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
                </Tooltip>
                <Tooltip content="Quantity of service units/days" position="top">
                  <input
                    type="number"
                    min="1"
                    value={service.qty}
                    onChange={(e) =>
                      handleUpdate(service.id, 'qty', parseInt(e.target.value, 10) || 1)
                    }
                    placeholder="Qty"
                    className="w-14 text-center text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg py-2 outline-none shadow-2xs"
                  />
                </Tooltip>
                <Tooltip
                  content={
                    service.discountable !== false
                      ? 'Discount Eligible (Click to exempt)'
                      : 'Exempt from Discount (Click to enable discount)'
                  }
                  position="top"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(service.id, 'discountable', service.discountable === false ? true : false)
                    }
                    className={`text-[10px] font-bold px-2 py-2 rounded-md border transition shrink-0 ${
                      service.discountable !== false
                        ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                        : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                    }`}
                  >
                    %
                  </button>
                </Tooltip>
              </div>

              {/* Delete Button */}
              <div className="sm:col-span-1 flex justify-end">
                <Tooltip content="Delete this service item" position="left">
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { PlanColumn, TierRowData } from '../types';
import { Cloud, Server, Plus, CheckCircle2, Layers, X } from 'lucide-react';

interface TierSectionProps {
  plans: PlanColumn[];
  onChangePlans: (plans: PlanColumn[]) => void;
  currencySymbol: string;
}

export const TierSection: React.FC<TierSectionProps> = ({
  plans,
  onChangePlans,
  currencySymbol,
}) => {
  const handleUpdateTier = (
    planId: string,
    tierId: string,
    field: keyof TierRowData,
    value: string | number | boolean
  ) => {
    const updated = plans.map((plan) => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        tiers: plan.tiers.map((tier) => {
          if (tier.id !== tierId) return tier;
          return { ...tier, [field]: value };
        }),
      };
    });
    onChangePlans(updated);
  };

  const handleAddTier = (planId: string) => {
    const updated = plans.map((plan) => {
      if (plan.id !== planId) return plan;
      const newTierIndex = plan.tiers.length + 1;
      const newTier: TierRowData = {
        id: `tier-${planId}-${Date.now()}`,
        prefix: plan.title.includes('On') ? 'OnPrem' : 'Hosted',
        label: `Tier ${newTierIndex}`,
        deviceCost: 3000,
        deviceQty: 0,
        browserCost: 1500,
        browserQty: 0,
        note: '',
      };
      return { ...plan, tiers: [...plan.tiers, newTier] };
    });
    onChangePlans(updated);
  };

  const handleDeleteTier = (planId: string, tierId: string) => {
    const updated = plans.map((plan) => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        tiers: plan.tiers.filter((t) => t.id !== tierId),
      };
    });
    onChangePlans(updated);
  };

  const handleDeletePlanColumn = (planId: string) => {
    if (plans.length <= 1) {
      alert('You must have at least one pricing plan column.');
      return;
    }
    onChangePlans(plans.filter((p) => p.id !== planId));
  };

  const handleAddCustomPlanColumn = () => {
    const newPlanId = `plan-custom-${Date.now()}`;
    const newPlan: PlanColumn = {
      id: newPlanId,
      title: `Custom Deployment ${plans.length + 1}`,
      badge: 'Dedicated',
      iconName: 'Server',
      tiers: [
        {
          id: `tier-${newPlanId}-1`,
          prefix: 'Custom',
          label: 'Tier 1',
          deviceCost: 3500,
          deviceQty: 0,
          browserCost: 1800,
          browserQty: 0,
          note: 'Custom environment configuration',
        },
      ],
    };
    onChangePlans([...plans, newPlan]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#52bfa3]" /> License Tiers & Deployment Plans
        </h3>
        <button
          type="button"
          onClick={handleAddCustomPlanColumn}
          className="text-xs font-bold text-[#685da7] hover:text-[#544990] flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Deployment Column
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-4"
          >
            {/* Plan Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-[#2c3260] rounded-xl">
                  {plan.iconName === 'Cloud' ? (
                    <Cloud className="w-4 h-4 text-[#52bfa3]" />
                  ) : (
                    <Server className="w-4 h-4 text-[#685da7]" />
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={plan.title}
                    onChange={(e) => {
                      const updated = plans.map((p) =>
                        p.id === plan.id ? { ...p, title: e.target.value } : p
                      );
                      onChangePlans(updated);
                    }}
                    className="font-bold text-slate-900 text-sm outline-none bg-transparent hover:bg-slate-50 focus:bg-white rounded px-1 -ml-1 border border-transparent focus:border-slate-300"
                  />
                  <span className="ml-1 inline-block text-[10px] font-bold uppercase tracking-wider text-[#52bfa3] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {plan.badge}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeletePlanColumn(plan.id)}
                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 flex items-center justify-center transition"
                title="Remove Deployment Column"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tiers List */}
            <div className="space-y-3">
              {plan.tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5 relative group"
                >
                  {/* Tier Meta Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#685da7] shrink-0" />
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) =>
                          handleUpdateTier(plan.id, tier.id, 'label', e.target.value)
                        }
                        className="font-bold text-xs text-slate-800 bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-teal-500 w-full"
                      />
                    </div>
                    {plan.tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(plan.id, tier.id)}
                        className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 flex items-center justify-center transition"
                        title="Delete Tier"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Device License Input Row */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7 flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1">
                      <span className="text-xs font-bold text-slate-500 mr-1">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={tier.deviceCost}
                        onChange={(e) =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'deviceCost',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full font-bold text-xs text-slate-800 outline-none"
                      />
                      <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-1">
                        /Device Licence(s)
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={tier.deviceQty || ''}
                        onChange={(e) =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'deviceQty',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="Qty (0)"
                        className="w-full text-center font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg py-1 px-1 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'deviceDiscountable',
                            tier.deviceDiscountable === false ? true : false
                          )
                        }
                        className={`text-[10px] font-bold px-1.5 py-1 rounded border transition shrink-0 ${
                          tier.deviceDiscountable !== false
                            ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                            : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                        }`}
                        title={
                          tier.deviceDiscountable !== false
                            ? 'Discount Enabled (Click to exempt)'
                            : 'Exempt from Discount (Click to enable discount)'
                        }
                      >
                        %
                      </button>
                    </div>
                  </div>

                  {/* Browser License Input Row */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7 flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1">
                      <span className="text-xs font-bold text-slate-500 mr-1">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={tier.browserCost}
                        onChange={(e) =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'browserCost',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full font-bold text-xs text-slate-800 outline-none"
                      />
                      <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-1">
                        /Browser Licence(s)
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={tier.browserQty || ''}
                        onChange={(e) =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'browserQty',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="Qty (0)"
                        className="w-full text-center font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg py-1 px-1 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTier(
                            plan.id,
                            tier.id,
                            'browserDiscountable',
                            tier.browserDiscountable === false ? true : false
                          )
                        }
                        className={`text-[10px] font-bold px-1.5 py-1 rounded border transition shrink-0 ${
                          tier.browserDiscountable !== false
                            ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                            : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                        }`}
                        title={
                          tier.browserDiscountable !== false
                            ? 'Discount Enabled (Click to exempt)'
                            : 'Exempt from Discount (Click to enable discount)'
                        }
                      >
                        %
                      </button>
                    </div>
                  </div>

                  {/* Specific Note Input */}
                  <input
                    type="text"
                    value={tier.note || ''}
                    onChange={(e) =>
                      handleUpdateTier(plan.id, tier.id, 'note', e.target.value)
                    }
                    placeholder="Add specific context or note..."
                    className="w-full text-[11px] text-slate-600 bg-transparent border-t border-dashed border-slate-200 pt-1.5 outline-none placeholder:text-slate-400"
                  />
                </div>
              ))}
            </div>

            {/* Add Custom Tier Button */}
            <button
              type="button"
              onClick={() => handleAddTier(plan.id)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-dashed border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Custom Tier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

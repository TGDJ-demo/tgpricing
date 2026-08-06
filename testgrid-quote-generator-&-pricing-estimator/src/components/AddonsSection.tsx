import React from 'react';
import { AddonItem } from '../types';
import { Puzzle, Plus, Minus, X } from 'lucide-react';

interface AddonsSectionProps {
  addons: AddonItem[];
  onChangeAddons: (addons: AddonItem[]) => void;
  currencySymbol: string;
  onRemoveSection?: () => void;
}

export const AddonsSection: React.FC<AddonsSectionProps> = ({
  addons,
  onChangeAddons,
  currencySymbol,
  onRemoveSection,
}) => {
  const handleToggleAddon = (id: string) => {
    const updated = addons.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    onChangeAddons(updated);
  };

  const handleUpdateAddon = (
    id: string,
    field: keyof AddonItem,
    value: string | number | boolean
  ) => {
    const updated = addons.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChangeAddons(updated);
  };

  const handleAddCustomAddon = () => {
    const newAddon: AddonItem = {
      id: `addon-custom-${Date.now()}`,
      label: `Custom Add-on Module ${addons.length + 1}`,
      iconName: 'Puzzle',
      cost: 1500,
      selected: true,
      category: 'Custom Feature',
      qty: 1,
      discountable: true,
    };
    onChangeAddons([...addons, newAddon]);
  };

  const handleDeleteAddon = (id: string) => {
    onChangeAddons(addons.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-[#685da7]" /> Premium Add-on Modules
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-500">
            Selected: {addons.filter((a) => a.selected).length} of {addons.length}
          </span>
          {onRemoveSection && (
            <button
              type="button"
              onClick={onRemoveSection}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 px-2.5 py-1 rounded-lg border border-red-200 transition flex items-center gap-1"
              title="Remove entire Add-ons Section"
            >
              <X className="w-3.5 h-3.5" /> Remove Section
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
              addon.selected
                ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Left: Action Toggle & Label */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => handleToggleAddon(addon.id)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition ${
                  addon.selected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {addon.selected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={addon.label}
                  onChange={(e) => handleUpdateAddon(addon.id, 'label', e.target.value)}
                  className="font-semibold text-xs text-slate-900 bg-transparent outline-none w-full border-b border-transparent hover:border-slate-300 focus:border-teal-500 truncate"
                />
                {addon.category && (
                  <span className="text-[10px] text-slate-400 block truncate">
                    {addon.category}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Cost Input & Discount Toggle & Delete X */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 max-w-[85px]">
                <span className="text-xs font-bold text-slate-400 mr-0.5">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={addon.cost || ''}
                  onChange={(e) =>
                    handleUpdateAddon(addon.id, 'cost', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full font-bold text-xs text-slate-900 text-right outline-none"
                />
              </div>

              {/* Discountable toggle */}
              <button
                type="button"
                onClick={() =>
                  handleUpdateAddon(addon.id, 'discountable', addon.discountable === false ? true : false)
                }
                className={`text-[10px] font-bold px-1.5 py-1 rounded border transition shrink-0 ${
                  addon.discountable !== false
                    ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                    : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                }`}
                title={
                  addon.discountable !== false
                    ? 'Discount Eligible (Click to exempt)'
                    : 'Exempt from Discount'
                }
              >
                %
              </button>

              {/* Red X Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteAddon(addon.id)}
                className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 flex items-center justify-center transition"
                title="Delete Add-on"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddCustomAddon}
        className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-dashed border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
      >
        <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Custom Add-on Module
      </button>
    </div>
  );
};

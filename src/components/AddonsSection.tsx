import React from 'react';
import { AddonItem } from '../types';
import { Tooltip } from './Tooltip';
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
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-pink-500" /> Premium Add-on Modules & Features
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
            Select additional capability packages to include in this proposal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            Selected: {addons.filter((a) => a.selected).length} of {addons.length}
          </span>
          {onRemoveSection && (
            <Tooltip content="Hide or remove the Add-ons Section from this proposal" position="left">
              <button
                type="button"
                onClick={onRemoveSection}
                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition flex items-center gap-1 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" /> Remove Section
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-2 shadow-2xs ${
              addon.selected
                ? 'bg-gradient-to-r from-purple-50/90 via-pink-50/50 to-teal-50/60 border-purple-300 ring-1 ring-purple-400/30'
                : 'bg-slate-50/80 border-slate-200 hover:border-purple-200'
            }`}
          >
            {/* Left: Action Toggle & Label */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Tooltip
                content={addon.selected ? 'Click to deselect add-on' : 'Click to select add-on'}
                position="top"
              >
                <button
                  type="button"
                  onClick={() => handleToggleAddon(addon.id)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition ${
                    addon.selected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {addon.selected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={addon.label}
                  onChange={(e) => handleUpdateAddon(addon.id, 'label', e.target.value)}
                  className="font-bold text-xs text-slate-900 bg-transparent outline-none w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 truncate"
                />
                {addon.category && (
                  <span className="text-[11px] text-slate-500 font-medium block truncate">
                    {addon.category}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Cost Input & Discount Toggle & Delete Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip content="Annual cost for this add-on module" position="top">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 max-w-[90px] shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 mr-0.5">
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
              </Tooltip>

              {/* Discountable toggle */}
              <Tooltip
                content={
                  addon.discountable !== false
                    ? 'Discount Eligible (Click to exempt)'
                    : 'Exempt from Discount (Click to enable discount)'
                }
                position="top"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateAddon(addon.id, 'discountable', addon.discountable === false ? true : false)
                  }
                  className={`text-[10px] font-bold px-2 py-1.5 rounded-md border transition shrink-0 ${
                    addon.discountable !== false
                      ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                      : 'bg-slate-100 text-slate-400 border-slate-300 line-through'
                  }`}
                >
                  %
                </button>
              </Tooltip>

              {/* Delete button */}
              <Tooltip content="Delete this add-on module" position="left">
                <button
                  type="button"
                  onClick={() => handleDeleteAddon(addon.id)}
                  className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition shadow-2xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <Tooltip content="Create a custom add-on feature module" position="top" className="w-full">
        <button
          type="button"
          onClick={handleAddCustomAddon}
          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-dashed border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600" /> Add Custom Add-on Module
        </button>
      </Tooltip>
    </div>
  );
};

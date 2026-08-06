import React, { useState } from 'react';
import { WatermarkSettings } from '../types';
import { X, Stamp, Eye, Check, RefreshCw, Upload, Image as ImageIcon, Type } from 'lucide-react';

interface WatermarkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WatermarkSettings;
  onChange: (newSettings: WatermarkSettings) => void;
}

const COLOR_PRESETS = [
  { label: 'TestGrid Navy', value: '#2c3260' },
  { label: 'Teal Accent', value: '#52bfa3' },
  { label: 'Purple Accent', value: '#685da7' },
  { label: 'Confidential Red', value: '#dc2626' },
  { label: 'Slate Gray', value: '#475569' },
];

const PRESET_WATERMARK_IMAGES = [
  {
    name: 'CONFIDENTIAL Stamp',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect x="10" y="10" width="280" height="100" rx="10" fill="none" stroke="%23dc2626" stroke-width="8" stroke-dasharray="16,8"/><text x="150" y="70" font-family="Arial,sans-serif" font-weight="900" font-size="32" fill="%23dc2626" text-anchor="middle">CONFIDENTIAL</text></svg>',
  },
  {
    name: 'APPROVED Badge',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect x="10" y="10" width="280" height="100" rx="10" fill="none" stroke="%2310b981" stroke-width="8"/><text x="150" y="70" font-family="Arial,sans-serif" font-weight="900" font-size="34" fill="%2310b981" text-anchor="middle">APPROVED</text></svg>',
  },
  {
    name: 'DRAFT Proposal',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect x="10" y="10" width="280" height="100" rx="10" fill="none" stroke="%2364748b" stroke-width="8"/><text x="150" y="70" font-family="Arial,sans-serif" font-weight="900" font-size="36" fill="%2364748b" text-anchor="middle">DRAFT</text></svg>',
  },
];

export const WatermarkConfigModal: React.FC<WatermarkConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>(settings.mode || 'text');

  if (!isOpen) return null;

  const handleReset = () => {
    onChange({
      enabled: true,
      mode: 'text',
      text: 'TESTGRID · CONFIDENTIAL ESTIMATE',
      subtext: 'PROPOSAL FOR REVIEW ONLY',
      opacity: 0.08,
      fontSize: 10,
      color: '#2c3260',
      angle: -20,
      repeat: true,
      imageUrl: '',
      imageWidth: 100,
    });
    setActiveTab('text');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange({
          ...settings,
          mode: 'image',
          imageUrl: result,
          enabled: true,
        });
        setActiveTab('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectMode = (mode: 'text' | 'image') => {
    setActiveTab(mode);
    onChange({ ...settings, mode });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Watermark & Branding Stamp</h3>
              <p className="text-xs text-slate-400">
                Configure text or custom image watermark overlay for PDF exports
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
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Stamp className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">
                Enable Proposal Watermark
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Type Switcher: Text vs Image */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectMode('text')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    activeTab === 'text'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-4 h-4 text-teal-600" /> Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMode('image')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    activeTab === 'image'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-[#685da7]" /> Image / Stamp Watermark
                </button>
              </div>

              {activeTab === 'text' ? (
                <>
                  {/* Primary Text */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Primary Watermark Text
                    </label>
                    <input
                      type="text"
                      value={settings.text}
                      onChange={(e) => onChange({ ...settings, text: e.target.value })}
                      placeholder="e.g. CONFIDENTIAL ESTIMATE"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Subtext */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Secondary Subtext
                    </label>
                    <input
                      type="text"
                      value={settings.subtext}
                      onChange={(e) => onChange({ ...settings, subtext: e.target.value })}
                      placeholder="e.g. PROPOSAL FOR REVIEW ONLY"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Color Preset */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Brand Color Preset
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => onChange({ ...settings, color: preset.value })}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                            settings.color === preset.value
                              ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: preset.value }}
                          >
                            {settings.color === preset.value && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <span className="text-[10px] font-medium text-slate-600 mt-1 truncate max-w-full">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Image Watermark Controls */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Upload Custom Stamp or Logo Watermark
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition">
                        <Upload className="w-4 h-4 text-teal-600" /> Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {settings.imageUrl && (
                        <button
                          type="button"
                          onClick={() => onChange({ ...settings, imageUrl: '' })}
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Or Pick Preset Stamps:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_WATERMARK_IMAGES.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...settings,
                                mode: 'image',
                                imageUrl: preset.url,
                              })
                            }
                            className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                              settings.imageUrl === preset.url
                                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-7 object-contain mb-1"
                            />
                            <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Width Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        <span>Stamp Width</span>
                        <span className="text-teal-600 font-mono">
                          {settings.imageWidth || 100} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        step="5"
                        value={settings.imageWidth || 100}
                        onChange={(e) =>
                          onChange({
                            ...settings,
                            imageWidth: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shared Sliders: Opacity & Rotation */}
              <div className="pt-2 border-t border-slate-200 space-y-4">
                {/* Opacity Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <span>Watermark Opacity</span>
                    <span className="text-teal-600 font-mono">
                      {Math.round((settings.opacity || 0.08) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.03"
                    max="0.30"
                    step="0.01"
                    value={settings.opacity || 0.08}
                    onChange={(e) =>
                      onChange({ ...settings, opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Ultra Subtle (3%)</span>
                    <span>Standard (8%)</span>
                    <span>High Contrast (30%)</span>
                  </div>
                </div>

                {/* Rotation Angle Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <span>Rotation Angle</span>
                    <span className="text-teal-600 font-mono">{settings.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="5"
                    value={settings.angle}
                    onChange={(e) =>
                      onChange({ ...settings, angle: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Mini Preview Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden h-28 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  {settings.mode === 'image' && settings.imageUrl ? (
                    <img
                      src={settings.imageUrl}
                      alt="Watermark preview"
                      style={{
                        opacity: (settings.opacity || 0.08) * 3,
                        transform: `rotate(${settings.angle}deg)`,
                        width: `${(settings.imageWidth || 100) * 1.2}px`,
                      }}
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <div
                      className="font-black uppercase tracking-widest text-center"
                      style={{
                        color: settings.color,
                        opacity: (settings.opacity || 0.08) * 2.5,
                        fontSize: '1.2rem',
                        transform: `rotate(${settings.angle}deg)`,
                      }}
                    >
                      <div>{settings.text || 'WATERMARK TEXT'}</div>
                      {settings.subtext && (
                        <div className="text-xs font-bold text-teal-600 mt-0.5">
                          {settings.subtext}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative z-10 text-xs font-semibold text-slate-400 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Live Watermark Preview
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-2xs transition"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

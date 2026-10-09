import React from 'react';
import { WatermarkSettings } from '../types';

interface WatermarkBackgroundProps {
  settings: WatermarkSettings;
}

export const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({ settings }) => {
  if (!settings || !settings.enabled) return null;

  const isImageMode = settings.mode === 'image' && settings.imageUrl;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center flex-col"
      aria-hidden="true"
    >
      <div className="sticky top-1/3 transform -translate-y-1/2 flex flex-col items-center justify-center my-auto">
        {isImageMode ? (
          <div
            className="transition-all duration-300 transform pointer-events-none flex flex-col items-center justify-center"
            style={{
              opacity: Math.min(0.3, Math.max(settings.opacity ?? 0.08, 0.02)),
              transform: `rotate(${settings.angle || -15}deg)`,
            }}
          >
            <img
              src={settings.imageUrl}
              alt="Watermark Overlay"
              style={{ width: `${(settings.imageWidth || 100) * 3}px` }}
              className="max-w-[80vw] max-h-[50vh] object-contain filter grayscale contrast-125"
            />
          </div>
        ) : (
          <div
            className="text-center font-black uppercase tracking-widest transition-all duration-300 transform pointer-events-none"
            style={{
              color: settings.color || '#0f172a',
              opacity: Math.min(0.3, Math.max(settings.opacity ?? 0.08, 0.02)),
              fontSize: `${settings.fontSize || 7}rem`,
              transform: `rotate(${settings.angle || -20}deg)`,
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            <div>{settings.text || 'TESTGRID ESTIMATE'}</div>
            {settings.subtext && (
              <div
                className="text-2xl sm:text-3xl font-bold tracking-widest mt-2"
                style={{ color: settings.color || '#0d9488' }}
              >
                {settings.subtext}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

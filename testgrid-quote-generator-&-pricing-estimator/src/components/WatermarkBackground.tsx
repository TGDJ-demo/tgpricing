import React from 'react';
import { WatermarkSettings } from '../types';

interface WatermarkBackgroundProps {
  settings: WatermarkSettings;
}

export const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({ settings }) => {
  if (!settings.enabled) return null;

  const isImageMode = settings.mode === 'image' && settings.imageUrl;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-30 overflow-hidden flex items-center justify-center flex-col mix-blend-multiply"
      aria-hidden="true"
    >
      {isImageMode ? (
        <div
          className="transition-all duration-300 transform pointer-events-none flex flex-col items-center justify-center"
          style={{
            opacity: Math.max(settings.opacity || 0.1, 0.08),
            transform: `rotate(${settings.angle || -15}deg)`,
          }}
        >
          <img
            src={settings.imageUrl}
            alt="Watermark Overlay"
            style={{ width: `${(settings.imageWidth || 100) * 3}px` }}
            className="max-w-[80vw] max-h-[60vh] object-contain filter grayscale contrast-125"
          />
        </div>
      ) : (
        <div
          className="text-center font-black uppercase tracking-widest transition-all duration-300 transform pointer-events-none"
          style={{
            color: settings.color || '#2c3260',
            opacity: Math.max(settings.opacity || 0.08, 0.06),
            fontSize: `${settings.fontSize || 8}rem`,
            transform: `rotate(${settings.angle || -20}deg)`,
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}
        >
          <div>{settings.text || 'TESTGRID ESTIMATE'}</div>
          {settings.subtext && (
            <div
              className="text-2xl sm:text-3xl font-bold tracking-widest mt-2"
              style={{ color: settings.color || '#52bfa3' }}
            >
              {settings.subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

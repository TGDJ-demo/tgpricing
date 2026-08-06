import React, { useState } from 'react';

interface TooltipProps {
  content?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 pointer-events-none ${positionClasses[position]} px-3 py-1.5 bg-slate-900 text-slate-100 text-[11px] font-semibold leading-relaxed rounded-xl shadow-2xl whitespace-normal min-w-[140px] max-w-xs text-center border border-slate-700/80 transition-opacity duration-150`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
              position === 'top'
                ? 'top-full -mt-1 left-1/2 -translate-x-1/2'
                : position === 'bottom'
                ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2'
                : position === 'left'
                ? 'left-full -ml-1 top-1/2 -translate-y-1/2'
                : 'right-full -mr-1 top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

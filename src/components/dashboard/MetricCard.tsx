import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  iconColorClass?: 'icon-blue' | 'icon-gold' | 'icon-green' | 'icon-purple' | 'icon-orange';
  valueColorClass?: string;
  onHelpClick?: () => void;
  isNumericValue?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconColorClass = 'icon-blue',
  valueColorClass = '',
  onHelpClick,
  isNumericValue = false,
}) => {
  return (
    <div className="card relative p-3.5 sm:p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* ── LEGACY ICON CIRCLE ── */}
      <div className={`icon-circle ${iconColorClass}`}>
        {icon}
      </div>

      {/* ── CARD CONTENT (NO TRUNCATION, FULL TEXT DISPLAY) ── */}
      <div className="flex-1 min-w-0 pr-6">
        {/* Label */}
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </div>

        {/* Value */}
        <div
          className={`
            font-['Outfit'] tracking-tight font-extrabold my-0.5 leading-snug break-words
            ${isNumericValue ? 'text-xl sm:text-2xl font-mono tabular-nums' : 'text-sm sm:text-base'}
            ${valueColorClass || 'text-slate-900 dark:text-slate-100'}
          `}
        >
          {value}
        </div>

        {/* Subtext */}
        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal break-words">
          {subtext}
        </div>
      </div>

      {/* Help Explainer Icon in Top Right */}
      {onHelpClick && (
        <button
          type="button"
          onClick={onHelpClick}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title={`Explain ${label}`}
          aria-label={`Explain ${label}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

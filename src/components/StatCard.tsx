import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  detail?: string;
  icon: LucideIcon;
  iconTone?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  subtitle,
  detail,
  icon: Icon,
  trend,
  trendUp,
  color = '#673B70',
}) => {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || detail || '';

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6DDEC] shadow-[0_4px_20px_rgba(103,59,112,0.06)] hover:shadow-[0_8px_30px_rgba(103,59,112,0.12)] transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#81758A] tracking-wider uppercase">{displayTitle}</span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <h3 className="text-2xl sm:text-3xl font-black text-[#34243A] tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trendUp ? 'bg-emerald-50 text-[#2E9467]' : 'bg-rose-50 text-[#D85B69]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {displaySubtitle && (
        <p className="text-xs text-[#81758A] mt-2 font-medium">{displaySubtitle}</p>
      )}
    </div>
  );
};

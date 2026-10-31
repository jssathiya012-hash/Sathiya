import React from 'react';
import { Layers } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-13 h-13 p-2.5',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`rounded-xl bg-gradient-to-br from-[#673B70] to-[#4B2455] text-white shadow-[0_4px_14px_rgba(103,59,112,0.35)] flex items-center justify-center ${iconSizes[size]}`}>
        <Layers className="w-full h-full text-[#E9DDF2]" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-[#34243A] ${titleSizes[size]}`}>
            Brightloop <span className="text-[#673B70]">Software</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5]">
            SaaS
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] font-medium text-[#81758A] -mt-0.5 tracking-wide">
            Unified Subscription Management System
          </p>
        )}
      </div>
    </div>
  );
};

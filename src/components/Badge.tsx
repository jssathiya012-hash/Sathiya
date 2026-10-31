import React from 'react';

export interface BadgeProps {
  status?: string;
  tone?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, tone, children, size = 'md' }) => {
  const textContent = status || (typeof children === 'string' ? children : Array.isArray(children) ? children.join(' ') : String(children || ''));
  const norm = (tone || textContent || '').toLowerCase();

  let styles = 'bg-[#F3EFFF] text-[#673B70] border-[#D8C2E5]';

  if (norm.includes('active') || norm.includes('successful') || norm.includes('paid') || norm.includes('success') || norm.includes('green')) {
    styles = 'bg-emerald-50 text-[#2E9467] border-emerald-200';
  } else if (norm.includes('expired') || norm.includes('failed') || norm.includes('cancelled') || norm.includes('suspended') || norm.includes('deactivated') || norm.includes('red')) {
    styles = 'bg-rose-50 text-[#D85B69] border-rose-200';
  } else if (norm.includes('pending') || norm.includes('paused') || norm.includes('draft') || norm.includes('amber')) {
    styles = 'bg-amber-50 text-[#D99A39] border-amber-200';
  } else if (norm.includes('monthly') || norm.includes('quarterly') || norm.includes('yearly')) {
    styles = 'bg-[#E9DDF2] text-[#4B2455] border-[#D8C2E5]';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full border ${padding} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || textContent}
    </span>
  );
};

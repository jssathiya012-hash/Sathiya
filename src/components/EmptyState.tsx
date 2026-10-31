import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DDEC] shadow-[0_4px_20px_rgba(103,59,112,0.04)] my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#F3EFFF] text-[#673B70] flex items-center justify-center mx-auto mb-4 border border-[#D8C2E5] shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-[#34243A]">{title}</h4>
      <p className="text-sm text-[#81758A] max-w-md mx-auto mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-[0_4px_14px_rgba(103,59,112,0.3)] transition-all hover:scale-[1.02]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

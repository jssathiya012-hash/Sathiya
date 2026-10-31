import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}) => {
  const visible = isOpen !== undefined ? isOpen : !!open;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-[#34243A]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${maxWidth} rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(103,59,112,0.25)] border border-[#E6DDEC] animate-in fade-in zoom-95 duration-200 z-10`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6DDEC]">
            <h3 className="text-lg font-black text-[#34243A] tracking-tight">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose, size = "max-w-md" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Absolute Full Screen Overlay */}
      <div
        className="fixed inset-0 bg-black/40 animate-fade-in transition-all"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className={`relative z-10 bg-card rounded-2xl w-full ${size} shadow-2xl transform transition-all scale-100 max-h-[90vh] flex flex-col border border-border animate-fade-in`}>
        <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
          <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const Input = ({ label, type = "text", required = true, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-foreground mb-1">{label} {!required && <span className="text-xs text-muted-foreground font-normal">(Optional)</span>}</label>
    <input
      type={type}
      className="w-full px-4 py-2 border border-border bg-transparent rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
      {...props}
      required={required}
    />
  </div>
);

export const Select = ({ label, children, required = true, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <select
      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-background"
      {...props}
      required={required}
    >
      {children}
    </select>
  </div>
);

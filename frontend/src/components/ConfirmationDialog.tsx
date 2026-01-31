"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full max-w-md transform overflow-hidden rounded-lg border-2 border-foreground bg-background p-6 shadow-hard transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className={`flex h-10 w-10 items-center justify-center rounded-full ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="h-5 w-5" />
             </div>
             <h3 className="text-lg font-bold leading-none tracking-tight">
                {title}
             </h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {description}
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-bold text-white shadow-hard-sm hover:translate-y-px hover:shadow-hard active:translate-y-0.5 rounded transition-all ${
                variant === "destructive" 
                  ? "bg-destructive hover:bg-destructive/90" 
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

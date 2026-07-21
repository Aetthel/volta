import { CheckCircle, X } from "lucide-react";
import type { ToastState } from "@/types/settings";

interface ToastProps {
  toast: ToastState;
  onDismiss?: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast.show) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-surface-container-lowest border border-outline-variant px-5 py-3.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
      <div className="w-8 h-8 rounded-lg bg-secondary-container/50 flex items-center justify-center shrink-0">
        <CheckCircle className="w-4.5 h-4.5 text-primary" />
      </div>
      <span className="flex-1 text-body-md font-medium text-on-surface">
        {toast.text}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-on-surface-variant/50 hover:text-primary hover:bg-surface-variant/80 transition-colors shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

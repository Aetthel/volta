import { CheckCircle } from "lucide-react";
import type { ToastState } from "@/types/settings";

interface ToastProps {
  toast: ToastState;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast.show) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container border border-outline-variant px-6 py-4 rounded-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
      <span className="font-label-lg text-label-lg font-semibold">
        {toast.text}
      </span>
    </div>
  );
}

"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Search, Command, X } from "lucide-react";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchInputVal: string;
  setSearchInputVal: (v: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  searchInputVal,
  setSearchInputVal,
}) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-28 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/40 bg-surface">
          <Search className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
          <input
            autoFocus
            type="text"
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/60 font-medium min-w-0"
            placeholder="Buscar clientes, servicios o citas..."
          />
          {searchInputVal && (
            <button
              onClick={() => setSearchInputVal("")}
              className="p-1 rounded-md text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-medium cursor-pointer"
            >
              Borrar
            </button>
          )}
          <kbd
            onClick={onClose}
            className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[11px] font-semibold font-mono text-on-surface-variant/70 bg-surface-container-high border border-outline-variant/60 rounded cursor-pointer hover:text-primary transition-colors"
          >
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant/70 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="p-6 py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
            <Command className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">
            Búsqueda rápida en Volta
          </p>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Escribe el nombre de un cliente, servicio, cita o comando rápido.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

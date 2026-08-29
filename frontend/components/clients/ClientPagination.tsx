"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientPaginationProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const ClientPagination: React.FC<ClientPaginationProps> = ({
  startItem,
  endItem,
  totalItems,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="w-full border-t border-outline-variant/30 py-3.5 px-6 flex items-center justify-between mt-auto">
      <span className="text-xs text-on-surface-variant">
        Mostrando <strong className="text-on-surface">{startItem}–{endItem}</strong> de{" "}
        <strong className="text-on-surface">{totalItems}</strong> clientes
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-semibold text-on-surface px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

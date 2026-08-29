"use client";

import React from "react";
import { Search, ListFilter, Columns, Download, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_COLUMNS, type ClientColumn } from "@/lib/hooks/useClientsList";

interface ClientFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  activityFilter: "all" | "inactive" | "new";
  setActivityFilter: (filter: "all" | "inactive" | "new") => void;
  visibleColumns: Set<ClientColumn>;
  toggleColumn: (col: ClientColumn) => void;
  onExportCSV: () => void;
  onNewClientClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onFilterResetPage: () => void;
}

export const ClientFiltersBar: React.FC<ClientFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  activityFilter,
  setActivityFilter,
  visibleColumns,
  toggleColumn,
  onExportCSV,
  onNewClientClick,
  onFilterResetPage,
}) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFilterResetPage();
            }}
            className="pl-9 bg-surface"
          />
        </div>

        {/* Status dropdown filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-surface">
              <ListFilter className="w-4 h-4 text-on-surface-variant" />
              <span>
                {statusFilter === "all"
                  ? "Estado LOPD"
                  : statusFilter === "Aceptado"
                    ? "Aceptado"
                    : statusFilter === "Pendiente"
                      ? "Pendiente"
                      : "Rechazado"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por Estado LOPD</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => {
                setStatusFilter("all");
                onFilterResetPage();
              }}
            >
              Todos los estados
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Aceptado"}
              onCheckedChange={() => {
                setStatusFilter("Aceptado");
                onFilterResetPage();
              }}
            >
              Consentimiento Aceptado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Pendiente"}
              onCheckedChange={() => {
                setStatusFilter("Pendiente");
                onFilterResetPage();
              }}
            >
              Consentimiento Pendiente
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Rechazado"}
              onCheckedChange={() => {
                setStatusFilter("Rechazado");
                onFilterResetPage();
              }}
            >
              Consentimiento Rechazado
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Activity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "inactive", label: "Sin visita +60d" },
              { key: "new", label: "Nuevos" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setActivityFilter(key);
                onFilterResetPage();
              }}
              className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                activityFilter === key
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "border-outline-variant/60 bg-surface text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Column selector toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-surface shrink-0">
              <Columns className="w-4 h-4 text-on-surface-variant" />
              <span className="hidden sm:inline">Columnas</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Personalizar Columnas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_COLUMNS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.has(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export CSV button */}
        <Button
          variant="outline"
          onClick={onExportCSV}
          className="flex items-center gap-2 bg-surface"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </Button>

        {/* Nuevo Cliente button */}
        <Button
          onClick={onNewClientClick}
          variant="default"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>
    </div>
  );
};

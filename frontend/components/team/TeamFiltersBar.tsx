"use client";

import React from "react";
import { Search, Plus, ListFilter, Columns } from "lucide-react";
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
import { ALL_COLUMNS, type TeamColumn } from "@/lib/hooks/useTeamList";

interface TeamFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  visibleColumns: Set<TeamColumn>;
  toggleColumn: (col: TeamColumn) => void;
  onInviteWorkerClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onFilterResetPage: () => void;
}

export const TeamFiltersBar: React.FC<TeamFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  visibleColumns,
  toggleColumn,
  onInviteWorkerClick,
  onFilterResetPage,
}) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, correo o rol..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFilterResetPage();
            }}
            className="pl-9 bg-surface"
          />
        </div>

        {/* Role dropdown filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-surface">
              <ListFilter className="w-4 h-4 text-on-surface-variant" />
              <span>
                {roleFilter === "all"
                  ? "Todos los roles"
                  : roleFilter === "JEFE"
                  ? "Jefes / Encargados"
                  : roleFilter === "EMPLEADO"
                  ? "Empleados (Staff)"
                  : "Administradores"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por Rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={roleFilter === "all"}
              onCheckedChange={() => {
                setRoleFilter("all");
                onFilterResetPage();
              }}
            >
              Todos los roles
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={roleFilter === "JEFE"}
              onCheckedChange={() => {
                setRoleFilter("JEFE");
                onFilterResetPage();
              }}
            >
              Jefes / Encargados
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={roleFilter === "EMPLEADO"}
              onCheckedChange={() => {
                setRoleFilter("EMPLEADO");
                onFilterResetPage();
              }}
            >
              Empleados (Staff)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={roleFilter === "ADMIN"}
              onCheckedChange={() => {
                setRoleFilter("ADMIN");
                onFilterResetPage();
              }}
            >
              Administradores Globales
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "JEFE", label: "Jefes" },
              { key: "EMPLEADO", label: "Empleados" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setRoleFilter(key);
                onFilterResetPage();
              }}
              className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === key
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

        {/* Invitar Trabajador button */}
        <Button
          onClick={onInviteWorkerClick}
          variant="default"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Invitar Trabajador</span>
        </Button>
      </div>
    </div>
  );
};

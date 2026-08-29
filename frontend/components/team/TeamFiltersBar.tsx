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
    <div className="bg-surface-container-low rounded-t-2xl p-4 border border-outline-variant/30">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFilterResetPage();
            }}
            className="pl-9 bg-surface text-sm h-9 rounded-xl border-outline-variant/60"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter Dropdown */}
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

          {/* Column Selector Toggle */}
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

          {/* Invitar Trabajador Button */}
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
    </div>
  );
};

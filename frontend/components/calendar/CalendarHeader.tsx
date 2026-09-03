"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Grid3x3,
  List,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import type { CalendarViewType } from "@/lib/hooks/useCalendarNavigation";

export interface ColorItem {
  name: string;
  value: string;
  bg: string;
  text: string;
  border?: string;
}

interface CalendarHeaderProps {
  formattedTitle: string;
  currentDate: Date;
  view: CalendarViewType;
  setView: (v: CalendarViewType) => void;
  navigateDate: (dir: "prev" | "next") => void;
  goToToday: () => void;
  // Filters
  colors: ColorItem[];
  availableTags: string[];
  categories: string[];
  selectedColors: string[];
  selectedTags: string[];
  selectedCategories: string[];
  hasActiveFilters: boolean;
  toggleColor: (c: string) => void;
  toggleTag: (t: string) => void;
  toggleCategory: (cat: string) => void;
  clearFilters: () => void;
  getColorClasses: (colorValue: string) => ColorItem;
  // Plan quota
  isBasicActive: boolean;
  isQuotaWarning: boolean;
  isQuotaExceeded: boolean;
  currentMonthApps: number;
  onOpenQuotaUpgrade: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  formattedTitle,
  currentDate,
  view,
  setView,
  navigateDate,
  goToToday,
  colors,
  availableTags,
  categories,
  selectedColors,
  selectedTags,
  selectedCategories,
  hasActiveFilters,
  toggleColor,
  toggleTag,
  toggleCategory,
  clearFilters,
  getColorClasses,
  isBasicActive,
  isQuotaWarning,
  isQuotaExceeded,
  currentMonthApps,
  onOpenQuotaUpgrade,
}) => {
  return (
    <div className="p-gutter max-w-container-max w-full mx-auto pt-6 pb-4 flex flex-col gap-4 bg-surface shrink-0">
      {/* Row 1: Title + Date Navigation & Header Profile/Notifications */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-headline-lg text-on-surface font-semibold capitalize tracking-tight">
            {view === "list" ? "Todas las Citas" : formattedTitle}
          </h1>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("prev")}
              className="h-8 w-8 rounded-lg bg-surface"
              aria-label="Fecha anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-surface"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("next")}
              className="h-8 w-8 rounded-lg bg-surface"
              aria-label="Fecha siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="shrink-0">
          <Header />
        </div>
      </div>

      {/* Row 2: View Switchers (Left) and Filters (Right) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* View Switchers & Quota */}
        <div className="flex items-center gap-2">
          {/* Mobile: Select dropdown */}
          <div className="sm:hidden w-full">
            <Select value={view} onValueChange={(value) => setView(value as CalendarViewType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Vista Mes
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Vista Semana
                  </div>
                </SelectItem>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Vista Día
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Vista Lista
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Button group */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-outline-variant bg-surface p-0.5">
            <Button
              variant={view === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="ml-1">Mes</span>
            </Button>
            <Button
              variant={view === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              <span className="ml-1">Semana</span>
            </Button>
            <Button
              variant={view === "day" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("day")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="ml-1">Día</span>
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <List className="h-3.5 w-3.5" />
              <span className="ml-1">Lista</span>
            </Button>
          </div>

          {/* Basic Plan Quota Button */}
          {isBasicActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenQuotaUpgrade}
              className={cn(
                "whitespace-nowrap shrink-0 bg-surface",
                isQuotaExceeded && "border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10",
                isQuotaWarning && "border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              )}
              title="Citas realizadas este mes. Pulsa para pasar a Plan Pro con citas ilimitadas."
            >
              <span>{currentMonthApps}/100 citas este mes</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Color Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap shrink-0 bg-surface">
                <Filter className="h-4 w-4" />
                Colores
                {selectedColors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedColors.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrar por Color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {colors.map((color) => (
                <DropdownMenuCheckboxItem
                  key={color.value}
                  checked={selectedColors.includes(color.value)}
                  onCheckedChange={() => toggleColor(color.value)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={
                        color.bg.startsWith("#")
                          ? { backgroundColor: color.bg, borderColor: color.border || "rgba(0,0,0,0.1)" }
                          : undefined
                      }
                      className={cn("h-3 w-3 rounded border", !color.bg.startsWith("#") && color.bg)}
                    />
                    {color.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tag Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap shrink-0 bg-surface">
                <Filter className="h-4 w-4" />
                Etiquetas
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrar por Etiqueta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap shrink-0 bg-surface">
                <Filter className="h-4 w-4" />
                Categorías
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrar por Categoría</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 whitespace-nowrap shrink-0">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-on-surface-variant">Filtros activos:</span>
          {selectedColors.map((colorValue) => {
            const color = getColorClasses(colorValue);
            return (
              <Badge key={colorValue} variant="secondary" className="gap-1">
                <div className={cn("h-2 w-2 rounded-full", color.bg)} />
                {color.name}
                <button
                  onClick={() => toggleColor(colorValue)}
                  className="ml-1 hover:text-on-surface cursor-pointer"
                  aria-label={`Eliminar filtro ${color.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:text-on-surface cursor-pointer"
                aria-label={`Eliminar filtro ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-1 hover:text-on-surface cursor-pointer"
                aria-label={`Eliminar filtro ${category}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

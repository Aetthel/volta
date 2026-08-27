"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useDraggableModal } from "@/lib/useDraggableModal"
import { Button as VoltaButton } from "@/components/ui/volta-ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Grid3x3,
  List,
  Filter,
  X,
  User,
  Briefcase,
  Palette,
  Tag,
  FileText,
  Trash2,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
})
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Header from "@/components/Header"

export interface Event {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  color: string
  category?: string
  attendees?: string[]
  tags?: string[]
  rawAppointment?: any
}

export interface EventManagerProps {
  events?: Event[]
  onEventCreate?: (event: Omit<Event, "id">) => void
  onEventUpdate?: (id: string, event: Partial<Event>) => void
  onEventDelete?: (id: string) => void
  categories?: string[]
  colors?: { name: string; value: string; bg: string; text: string }[]
  defaultView?: "month" | "week" | "day" | "list"
  className?: string
  availableTags?: string[]
  onOpenNewModal?: (prefilledDate?: Date) => void
}

const defaultColors = [
  { name: "Teal Volta", value: "TEAL", bg: "bg-[#377E7F]", text: "text-white" },
  { name: "Púrpura", value: "PURPLE", bg: "bg-purple-600", text: "text-white" },
  { name: "Rosa", value: "ROSE", bg: "bg-rose-500", text: "text-white" },
  { name: "Ámbar", value: "AMBER", bg: "bg-amber-500", text: "text-white" },
  { name: "Índigo", value: "INDIGO", bg: "bg-indigo-600", text: "text-white" },
  { name: "Esmeralda", value: "EMERALD", bg: "bg-emerald-500", text: "text-white" },
  { name: "Azul Cielo", value: "SKY", bg: "bg-sky-500", text: "text-white" },
]

export function EventManager({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  categories = [],
  colors = defaultColors,
  defaultView = "week",
  className,
  availableTags = ["Confirmada", "Pendiente", "Completada"],
  onOpenNewModal,
}: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day" | "list">(defaultView)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    color: colors[0].value,
    category: categories[0],
    tags: [],
  })

  const { position, handleMouseDown } = useDraggableModal({
    isOpen: isDialogOpen,
    modalWidth: 480,
    modalHeight: 580,
  })

  const { data: session } = useSession()
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC"
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE"
  const isBasicActive = subscriptionPlan === "BASIC" && subscriptionStatus !== "TRIALING"

  const [isQuotaUpgradeOpen, setIsQuotaUpgradeOpen] = useState(false)

  const currentMonthApps = useMemo(() => {
    const now = new Date()
    return events.filter((e) => {
      const d = e.startTime instanceof Date ? e.startTime : new Date(e.startTime)
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    }).length
  }, [events])

  const quotaPct = Math.min(100, Math.round((currentMonthApps / 100) * 100))
  const isQuotaWarning = currentMonthApps >= 80 && currentMonthApps < 100
  const isQuotaExceeded = currentMonthApps >= 100

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateForInput = (d?: Date | string) => {
    if (!d) return ""
    const dateObj = d instanceof Date ? d : new Date(d)
    if (isNaN(dateObj.getTime())) return ""
    const pad = (n: number) => String(n).padStart(2, "0")
    const year = dateObj.getFullYear()
    const month = pad(dateObj.getMonth() + 1)
    const day = pad(dateObj.getDate())
    const hours = pad(dateObj.getHours())
    const minutes = pad(dateObj.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Sync state if initialEvents changes from parent API updates
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Color filter
      if (selectedColors.length > 0 && !selectedColors.includes(event.color)) {
        return false
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = event.tags?.some((tag) => selectedTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) {
        return false
      }

      return true
    })
  }, [events, searchQuery, selectedColors, selectedTags, selectedCategories])

  const hasActiveFilters = selectedColors.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0

  const clearFilters = () => {
    setSelectedColors([])
    setSelectedTags([])
    setSelectedCategories([])
    setSearchQuery("")
  }

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0].value,
      category: newEvent.category,
      attendees: newEvent.attendees,
      tags: newEvent.tags || [],
    }

    setEvents((prev) => [...prev, event])
    onEventCreate?.(event)
    setIsDialogOpen(false)
    setIsCreating(false)
    setNewEvent({
      title: "",
      description: "",
      color: colors[0].value,
      category: categories[0],
      tags: [],
    })
  }, [newEvent, colors, categories, onEventCreate])

  const handleUpdateEvent = useCallback(() => {
    if (!selectedEvent) return

    setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)))
    onEventUpdate?.(selectedEvent.id, selectedEvent)
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }, [selectedEvent, onEventUpdate])

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
      onEventDelete?.(id)
      setIsDialogOpen(false)
      setSelectedEvent(null)
    },
    [onEventDelete],
  )

  const handleDragStart = useCallback((event: Event) => {
    setDraggedEvent(event)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null)
  }, [])

  const handleDrop = useCallback(
    (date: Date, hour?: number) => {
      if (!draggedEvent) return

      const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime()
      const newStartTime = new Date(date)
      if (hour !== undefined) {
        newStartTime.setHours(hour, 0, 0, 0)
      }
      const newEndTime = new Date(newStartTime.getTime() + duration)

      const updatedEvent = {
        ...draggedEvent,
        startTime: newStartTime,
        endTime: newEndTime,
      }

      setEvents((prev) => prev.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)))
      onEventUpdate?.(draggedEvent.id, updatedEvent)
      setDraggedEvent(null)
    },
    [draggedEvent, onEventUpdate],
  )

  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        if (view === "month") {
          newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
        } else if (view === "week") {
          newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
        } else if (view === "day") {
          newDate.setDate(prev.getDate() + (direction === "next" ? 1 : -1))
        }
        return newDate
      })
    },
    [view],
  )

  const getColorClasses = useCallback(
    (colorValue: string) => {
      const color = colors.find((c) => c.value === colorValue)
      return color || colors[0]
    },
    [colors],
  )

  const toggleTag = (tag: string, isCreating: boolean) => {
    if (isCreating) {
      setNewEvent((prev) => ({
        ...prev,
        tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
      }))
    } else {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
            }
          : null,
      )
    }
  }

  const handleSlotClick = useCallback(
    (slotDate: Date) => {
      if (onOpenNewModal) {
        onOpenNewModal(slotDate);
      } else {
        setNewEvent({
          title: "",
          description: "",
          startTime: slotDate,
          endTime: new Date(slotDate.getTime() + 30 * 60000),
          color: colors[0].value,
          category: categories[0],
          tags: [],
        });
        setIsCreating(true);
        setIsDialogOpen(true);
      }
    },
    [onOpenNewModal, colors, categories]
  );

  return (
    <div className={cn("flex-1 flex flex-col w-full h-full min-h-full", className)}>
      {/* Header & Controls bar with standard top and lateral page margins */}
      <div className="p-gutter max-w-container-max w-full mx-auto pt-6 pb-4 flex flex-col gap-4 bg-surface shrink-0">
        {/* Row 1: Title + Date Navigation & Header Profile/Notifications */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-headline-lg text-on-surface font-semibold capitalize tracking-tight">
              {view === "month" &&
                currentDate.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              {view === "week" &&
                `Semana del ${currentDate.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}`}
              {view === "day" &&
                currentDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              {view === "list" && "Todas las Citas"}
            </h1>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={() => navigateDate("prev")} className="h-8 w-8 rounded-lg bg-surface">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 rounded-lg text-xs font-semibold bg-surface">
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDate("next")} className="h-8 w-8 rounded-lg bg-surface">
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
              <Select value={view} onValueChange={(value: any) => setView(value)}>
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
                onClick={() => setIsQuotaUpgradeOpen(true)}
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
                    onCheckedChange={(checked) => {
                      setSelectedColors((prev) =>
                        checked ? [...prev, color.value] : prev.filter((c) => c !== color.value),
                      )
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded", color.bg)} />
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
                    onCheckedChange={(checked) => {
                      setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)))
                    }}
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
                    onCheckedChange={(checked) => {
                      setSelectedCategories((prev) =>
                        checked ? [...prev, category] : prev.filter((c) => c !== category),
                      )
                    }}
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
              const color = getColorClasses(colorValue)
              return (
                <Badge key={colorValue} variant="secondary" className="gap-1">
                  <div className={cn("h-2 w-2 rounded-full", color.bg)} />
                  {color.name}
                  <button
                    onClick={() => setSelectedColors((prev) => prev.filter((c) => c !== colorValue))}
                    className="ml-1 hover:text-on-surface"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                  className="ml-1 hover:text-on-surface"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1">
                {category}
                <button
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                  className="ml-1 hover:text-on-surface"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Views Container — Full Height & Edge-to-Edge */}
      <div className="flex-1 w-full overflow-auto bg-surface-container-lowest flex flex-col border-t border-outline-variant/30">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={(event) => {
              setSelectedEvent(event)
              setIsDialogOpen(true)
            }}
            onSlotClick={handleSlotClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            getColorClasses={getColorClasses}
          />
        )}

        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={(event) => {
              setSelectedEvent(event)
              setIsDialogOpen(true)
            }}
            onSlotClick={handleSlotClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            getColorClasses={getColorClasses}
          />
        )}

        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={(event) => {
              setSelectedEvent(event)
              setIsDialogOpen(true)
            }}
            onSlotClick={handleSlotClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            getColorClasses={getColorClasses}
          />
        )}

        {view === "list" && (
          <ListView
            events={filteredEvents}
            onEventClick={(event) => {
              setSelectedEvent(event)
              setIsDialogOpen(true)
            }}
            getColorClasses={getColorClasses}
          />
        )}
      </div>

      {/* Event Modal — Volta Draggable Modal */}
      {isDialogOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Backdrop — transparent without blur or darkening */}
          <div
            className="absolute inset-0 bg-transparent pointer-events-auto"
            onClick={() => {
              setIsDialogOpen(false)
              setIsCreating(false)
              setSelectedEvent(null)
            }}
          />

          {/* Modal Content Card */}
          <div
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: "480px",
              maxWidth: "calc(100vw - 32px)",
              transition: "none",
            }}
            className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col"
          >
            {/* Header */}
            <div
              onMouseDown={handleMouseDown}
              className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-on-surface tracking-tight">
                  {isCreating ? "Agendar Cita" : "Editar Cita"}
                </h2>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {isCreating
                    ? "Añade una nueva cita al calendario"
                    : "Modifica los datos del cliente, servicio u horario"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                  setIsCreating(false)
                  setSelectedEvent(null)
                }}
                className="p-1.5 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer -mr-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">
              {/* Título / Cliente */}
              <div>
                <label
                  htmlFor="modal-event-title"
                  className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>Cliente / Título <span className="text-error">*</span></span>
                </label>
                <input
                  id="modal-event-title"
                  type="text"
                  value={isCreating ? newEvent.title : selectedEvent?.title || ""}
                  onChange={(e) =>
                    isCreating
                      ? setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                      : setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  placeholder="Nombre del cliente y servicio"
                  className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
                />
              </div>

              {/* Hora Inicio & Fin (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="modal-event-startTime"
                    className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                    <span>Hora Inicio</span>
                  </label>
                  <input
                    id="modal-event-startTime"
                    type="datetime-local"
                    value={
                      isCreating
                        ? formatDateForInput(newEvent.startTime)
                        : formatDateForInput(selectedEvent?.startTime)
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      if (!isNaN(date.getTime())) {
                        isCreating
                          ? setNewEvent((prev) => ({ ...prev, startTime: date }))
                          : setSelectedEvent((prev) => (prev ? { ...prev, startTime: date } : null))
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-event-endTime"
                    className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                    <span>Hora Fin</span>
                  </label>
                  <input
                    id="modal-event-endTime"
                    type="datetime-local"
                    value={
                      isCreating
                        ? formatDateForInput(newEvent.endTime)
                        : formatDateForInput(selectedEvent?.endTime)
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      if (!isNaN(date.getTime())) {
                        isCreating
                          ? setNewEvent((prev) => ({ ...prev, endTime: date }))
                          : setSelectedEvent((prev) => (prev ? { ...prev, endTime: date } : null))
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Categoría y Color (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="modal-event-category"
                    className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-on-surface shrink-0" />
                    <span>Categoría / Servicio</span>
                  </label>
                  <select
                    id="modal-event-category"
                    value={isCreating ? newEvent.category : selectedEvent?.category || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      isCreating
                        ? setNewEvent((prev) => ({ ...prev, category: val }))
                        : setSelectedEvent((prev) => (prev ? { ...prev, category: val } : null))
                    }}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-event-color"
                    className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                  >
                    <Palette className="w-3.5 h-3.5 text-on-surface shrink-0" />
                    <span>Color</span>
                  </label>
                  <select
                    id="modal-event-color"
                    value={isCreating ? newEvent.color : selectedEvent?.color || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      isCreating
                        ? setNewEvent((prev) => ({ ...prev, color: val }))
                        : setSelectedEvent((prev) => (prev ? { ...prev, color: val } : null))
                    }}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
                  >
                    {colors.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción / Notas */}
              <div>
                <label
                  htmlFor="modal-event-description"
                  className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>Notas / Observaciones</span>
                </label>
                <textarea
                  id="modal-event-description"
                  rows={3}
                  value={isCreating ? newEvent.description : selectedEvent?.description || ""}
                  onChange={(e) =>
                    isCreating
                      ? setNewEvent((prev) => ({ ...prev, description: e.target.value }))
                      : setSelectedEvent((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  placeholder="Notas o detalles adicionales..."
                  className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
                />
              </div>

              {/* Etiquetas */}
              {availableTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-on-surface shrink-0" />
                    <span>Etiquetas</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => {
                      const isSelected = isCreating
                        ? newEvent.tags?.includes(tag)
                        : selectedEvent?.tags?.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag, isCreating)}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-surface-container-low/60 border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high"
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/20 flex items-center justify-between">
              {!isCreating && selectedEvent ? (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2.5">
                <VoltaButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setIsCreating(false)
                    setSelectedEvent(null)
                  }}
                  className="cursor-pointer font-medium"
                >
                  Cancelar
                </VoltaButton>
                <VoltaButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={isCreating ? handleCreateEvent : handleUpdateEvent}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  {isCreating ? "Crear Cita" : "Guardar Cambios"}
                </VoltaButton>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Upgrade Pro Modal for Quota */}
      <UpgradeProModal
        isOpen={isQuotaUpgradeOpen}
        onClose={() => setIsQuotaUpgradeOpen(false)}
        title="Citas Ilimitadas con Plan Pro"
        description={`Has utilizado ${currentMonthApps} de tus 100 citas del mes en el Plan Básico. Actualiza al Plan Pro (40€/mes) para disfrutar de citas ilimitadas sin restricciones de cupo.`}
      />
    </div>
  )
}

// EventCard component with hover effect
function EventCard({
  event,
  onEventClick,
  onDragStart,
  onDragEnd,
  getColorClasses,
  variant = "default",
}: {
  event: Event
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  getColorClasses: (color: string) => { bg: string; text: string }
  variant?: "default" | "compact" | "detailed"
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClasses = getColorClasses(event.color)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (variant === "compact") {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(event)}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation()
          onEventClick(event)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer event-card"
      >
        <div
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-300",
            colorClasses.bg,
            "text-white truncate animate-in fade-in slide-in-from-top-1",
            isHovered && "scale-105 shadow-lg z-10",
          )}
        >
          {event.title}
        </div>
        {isHovered && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
            <Card className="border border-outline-variant p-3 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                  <div className={cn("h-3 w-3 rounded-full flex-shrink-0", colorClasses.bg)} />
                </div>
                {event.description && <p className="text-xs text-on-surface-variant line-clamp-2">{event.description}</p>}
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.category && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {event.category}
                    </Badge>
                  )}
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] h-5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(event)}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation()
          onEventClick(event)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "cursor-pointer rounded-lg p-3 transition-all duration-300 event-card",
          colorClasses.bg,
          "text-white animate-in fade-in slide-in-from-left-2",
          isHovered && "scale-[1.03] shadow-2xl ring-2 ring-white/50",
        )}
      >
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="mt-1 text-sm opacity-90 line-clamp-2">{event.description}</div>}
        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        {isHovered && (
          <div className="mt-2 flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {event.category && (
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            )}
            {event.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(event)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation()
        onEventClick(event)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative event-card"
    >
      <div
        className={cn(
          "cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all duration-300",
          colorClasses.bg,
          "text-white animate-in fade-in slide-in-from-left-1",
          isHovered && "scale-105 shadow-lg z-10",
        )}
      >
        <div className="truncate">{event.title}</div>
      </div>
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card className="border border-outline-variant p-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold leading-tight">{event.title}</h4>
                <div className={cn("h-4 w-4 rounded-full flex-shrink-0", colorClasses.bg)} />
              </div>
              {event.description && <p className="text-sm text-on-surface-variant">{event.description}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.category && (
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  )}
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Month View Component
function MonthView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onSlotClick: (date: Date) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7)) // Start on Monday

  const days = []
  const currentDay = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay))
    currentDay.setDate(currentDay.getDate() + 1)
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className="w-full h-full flex flex-col min-w-[700px]">
      <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-low/50 sticky top-0 z-20">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="border-r border-outline-variant/30 p-2.5 text-center text-xs font-semibold text-on-surface-variant last:border-r-0 sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={cn(
                "min-h-24 border-b border-r border-outline-variant/30 p-1.5 transition-colors last:border-r-0 sm:min-h-28 sm:p-2 cursor-pointer",
                !isCurrentMonth && "bg-surface-container-low/30 opacity-60",
                "hover:bg-surface-container-low/60",
              )}
              onClick={() => {
                const clickDate = new Date(day);
                clickDate.setHours(9, 0, 0, 0);
                onSlotClick(clickDate);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(day)}
            >
              <div
                className={cn(
                  "mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs sm:text-sm font-semibold",
                  isToday ? "bg-primary text-on-primary" : "text-on-surface",
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    getColorClasses={getColorClasses}
                    variant="compact"
                  />
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-on-surface-variant font-medium sm:text-xs">+{dayEvents.length - 4} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Week View Component
function WeekView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onSlotClick: (date: Date) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const startOfWeek = new Date(currentDate)
  const dayOfWeek = (currentDate.getDay() + 6) % 7
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  // Hours 08:00 to 21:00 for salon business hours
  const hours = Array.from({ length: 14 }, (_, i) => i + 8)

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const eventHour = eventDate.getHours()
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventHour === hour
      )
    })
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="grid grid-cols-8 border-b border-outline-variant/30 bg-surface-container-low/50 min-w-[700px] sticky top-0 z-20">
        <div className="border-r border-outline-variant/30 p-2.5 text-center text-xs font-semibold text-on-surface-variant sm:text-sm">Hora</div>
        {weekDays.map((day) => {
          const isToday = day.toDateString() === new Date().toDateString()
          return (
            <div
              key={day.toISOString()}
              className="border-r border-outline-variant/30 p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm"
            >
              <div className={cn("hidden sm:block capitalize", isToday ? "text-primary font-bold" : "text-on-surface font-semibold")}>
                {day.toLocaleDateString("es-ES", { weekday: "short" })}
              </div>
              <div className="sm:hidden capitalize font-semibold">{day.toLocaleDateString("es-ES", { weekday: "narrow" })}</div>
              <div className={cn("text-[11px]", isToday ? "text-primary font-bold" : "text-on-surface-variant")}>
                {day.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-8 min-w-[700px]">
        {hours.map((hour) => (
          <div key={`row-${hour}`} className="contents">
            <div className="border-b border-r border-outline-variant/30 p-1.5 text-[11px] font-medium text-on-surface-variant/70 sm:p-2 sm:text-xs text-center">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDayAndHour(day, hour)
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-14 border-b border-r border-outline-variant/30 p-1 transition-colors hover:bg-surface-container-low/60 last:border-r-0 sm:min-h-16 cursor-pointer"
                  onClick={() => {
                    const slotDate = new Date(day);
                    slotDate.setHours(hour, 0, 0, 0);
                    onSlotClick(slotDate);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(day, hour)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEventClick={onEventClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        getColorClasses={getColorClasses}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Day View Component
function DayView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onSlotClick: (date: Date) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const eventHour = eventDate.getHours()
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventHour === hour
      )
    })
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="space-y-0 min-w-[500px]">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          return (
            <div
              key={hour}
              className="flex border-b border-outline-variant/30 last:border-b-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(currentDate, hour)}
            >
              <div className="w-16 flex-shrink-0 border-r border-outline-variant/30 p-2 text-xs font-semibold text-on-surface-variant sm:w-24 sm:p-3 sm:text-sm text-center">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div
                className="min-h-16 flex-1 p-1.5 transition-colors hover:bg-surface-container-low/60 sm:min-h-20 sm:p-2.5 cursor-pointer"
                onClick={() => {
                  const slotDate = new Date(currentDate);
                  slotDate.setHours(hour, 0, 0, 0);
                  onSlotClick(slotDate);
                }}
              >
                <div className="space-y-2">
                  {hourEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEventClick={onEventClick}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      getColorClasses={getColorClasses}
                      variant="detailed"
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// List View Component
function ListView({
  events,
  onEventClick,
  getColorClasses,
}: {
  events: Event[]
  onEventClick: (event: Event) => void
  getColorClasses: (color: string) => { bg: string; text: string }
}) {
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  const groupedEvents = sortedEvents.reduce(
    (acc, event) => {
      const dateKey = event.startTime.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    },
    {} as Record<string, Event[]>,
  )

  return (
    <div className="w-full h-full overflow-auto p-4 sm:p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-xs font-semibold text-on-surface-variant sm:text-sm capitalize">{date}</h3>
            <div className="space-y-2">
              {dateEvents.map((event) => {
                const colorClasses = getColorClasses(event.color)
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="group cursor-pointer rounded-lg border border-outline-variant bg-surface p-3 transition-all hover:shadow-md hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-300 sm:p-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn("mt-1 h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3", colorClasses.bg)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors sm:text-base truncate">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="mt-1 text-xs text-on-surface-variant sm:text-sm line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-on-surface-variant sm:gap-4 sm:text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {event.endTime.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] h-4 sm:text-xs sm:h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && (
          <div className="py-12 text-center text-sm text-on-surface-variant sm:text-base">No hay citas registradas</div>
        )}
      </div>
    </div>
  )
}

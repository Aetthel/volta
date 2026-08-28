"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ListFilter,
  Columns,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Header from "@/components/Header";
import UserAvatar from "@/components/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Empty } from "@/components/ui/volta-ui";
import type { WorkerToEdit } from "@/components/InviteWorkerModal";

const InviteWorkerModal = dynamicImport(() => import("@/components/InviteWorkerModal"), {
  ssr: false,
});
const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "JEFE" | "EMPLEADO" | string;
  businessId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TeamColumn = "miembro" | "rol" | "alta" | "estado" | "acciones";

const ALL_COLUMNS: { key: TeamColumn; label: string }[] = [
  { key: "miembro", label: "Miembro del Equipo" },
  { key: "rol", label: "Rol y Permisos" },
  { key: "alta", label: "Fecha de Alta" },
  { key: "estado", label: "Estado" },
  { key: "acciones", label: "Acciones" },
];

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Reciente";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Reciente";
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Administrador Global";
    case "JEFE":
      return "Jefe de Tienda / Encargado";
    case "EMPLEADO":
      return "Empleado / Profesional";
    default:
      return role;
  }
};

const getRoleBadgeClasses = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
    case "JEFE":
      return "bg-primary/10 text-primary border-primary/20";
    case "EMPLEADO":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    default:
      return "bg-surface-container-high text-on-surface-variant border-outline-variant/60";
  }
};

export default function EquipoPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";
  const currentUserId = session?.user?.id;

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalTriggerRect, setInviteModalTriggerRect] = useState<DOMRect | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerToEdit | null>(null);

  // Filters & Table Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<TeamColumn>>(
    new Set(["miembro", "rol", "alta", "estado", "acciones"])
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Feedback Toasts
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  // Data state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    fetch(`/api/backend/users?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          setMembers([]);
        }
      })
      .catch((err) => {
        console.error("Error loading team members:", err);
        setMembers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Equipo - ${session.user.name} - Volta`;
    }
  }, [session]);

  const toggleColumn = (column: TeamColumn) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        if (next.size > 1) next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  const handleSaveWorker = async (workerData: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: "JEFE" | "EMPLEADO";
  }) => {
    const isEdit = !!workerData.id;
    const res = await fetch(
      isEdit ? `/api/backend/users/${workerData.id}` : "/api/backend/users",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workerData.name,
          email: workerData.email,
          password: workerData.password,
          role: workerData.role,
          businessId,
        }),
      }
    );

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(payload?.error || "Error al procesar el trabajador.");
    }

    fetchMembers();
    setEditingWorker(null);
    setToastText(isEdit ? "Trabajador actualizado con éxito." : "Trabajador invitado correctamente.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteWorker = async (id: string, name: string) => {
    if (id === currentUserId) {
      alert("No puedes eliminar tu propia cuenta activa.");
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${name} del equipo?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/backend/users/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Error al eliminar trabajador.");
      }
      fetchMembers();
      setToastText(`Se ha eliminado a ${name} del equipo.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      alert(err?.message || "Error al eliminar trabajador.");
    }
  };

  // Filtered and Paginated Members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Role filter
      if (roleFilter !== "all" && member.role !== roleFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const queryNorm = normalizeString(searchQuery);
        const nameNorm = normalizeString(member.name || "");
        const emailNorm = normalizeString(member.email || "");
        const roleNorm = normalizeString(getRoleLabel(member.role));

        if (
          !nameNorm.includes(queryNorm) &&
          !emailNorm.includes(queryNorm) &&
          !roleNorm.includes(queryNorm)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [members, roleFilter, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />
      <BottomNav />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />

        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold tracking-tight">
                Equipo
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Administra los trabajadores, turnos y roles de acceso a tu negocio.
              </p>
            </div>
            <div className="shrink-0">
              <Header />
            </div>
          </div>

          {/* Action & Filter Toolbar (Card Style matching Clientes) */}
          <div className="bg-surface-container-low rounded-t-2xl p-4 border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, correo o rol..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
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
                        setCurrentPage(1);
                      }}
                    >
                      Todos los roles
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={roleFilter === "JEFE"}
                      onCheckedChange={() => {
                        setRoleFilter("JEFE");
                        setCurrentPage(1);
                      }}
                    >
                      Jefes / Encargados
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={roleFilter === "EMPLEADO"}
                      onCheckedChange={() => {
                        setRoleFilter("EMPLEADO");
                        setCurrentPage(1);
                      }}
                    >
                      Empleados (Staff)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={roleFilter === "ADMIN"}
                      onCheckedChange={() => {
                        setRoleFilter("ADMIN");
                        setCurrentPage(1);
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
                  onClick={(e) => {
                    setEditingWorker(null);
                    setInviteModalTriggerRect(e.currentTarget.getBoundingClientRect());
                    setIsInviteModalOpen(true);
                  }}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invitar Trabajador</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Table Container: Edge-to-Edge matching Clientes */}
          <div className="w-full flex-1 overflow-auto border-t border-outline-variant/30 flex flex-col justify-between">
            <div className="relative w-full overflow-x-auto flex-1 bg-surface-container-lowest">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-outline-variant/30">
                    {visibleColumns.has("miembro") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5 pl-6">
                        Miembro del Equipo
                      </TableHead>
                    )}
                    {visibleColumns.has("rol") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Rol y Permisos
                      </TableHead>
                    )}
                    {visibleColumns.has("alta") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Incorporación
                      </TableHead>
                    )}
                    {visibleColumns.has("estado") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Estado
                      </TableHead>
                    )}
                    {visibleColumns.has("acciones") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5 text-right pr-6">
                        Acciones
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <TableRow key={idx} className="animate-pulse">
                        <TableCell colSpan={visibleColumns.size} className="py-6 text-center text-on-surface-variant/60 text-xs">
                          Cargando miembros del equipo...
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.size} className="h-64 text-center">
                        <Empty
                          title="No se encontraron miembros"
                          description={
                            searchQuery
                              ? `No hay resultados para "${searchQuery}"`
                              : "Tu equipo no tiene trabajadores registrados todavía. ¡Invita a tu primer compañero!"
                          }
                          actionLabel="Invitar Trabajador"
                          onAction={() => {
                            setEditingWorker(null);
                            setIsInviteModalOpen(true);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/20"
                      >
                        {/* Miembro */}
                        {visibleColumns.has("miembro") && (
                          <TableCell className="py-3.5 pl-6">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={member.name} size="md" />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-on-surface truncate">
                                    {member.name}
                                  </span>
                                  {member.id === currentUserId && (
                                    <span className="text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded">
                                      Tú
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                                  <Mail className="w-3 h-3 shrink-0 opacity-60" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}

                        {/* Rol */}
                        {visibleColumns.has("rol") && (
                          <TableCell className="py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(
                                member.role
                              )}`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{getRoleLabel(member.role)}</span>
                            </span>
                          </TableCell>
                        )}

                        {/* Alta */}
                        {visibleColumns.has("alta") && (
                          <TableCell className="py-3.5 text-xs text-on-surface-variant">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 shrink-0 opacity-60" />
                              <span>{formatDate(member.createdAt)}</span>
                            </div>
                          </TableCell>
                        )}

                        {/* Estado */}
                        {visibleColumns.has("estado") && (
                          <TableCell className="py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Activo</span>
                            </span>
                          </TableCell>
                        )}

                        {/* Acciones */}
                        {visibleColumns.has("acciones") && (
                          <TableCell className="py-3.5 text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                  <span className="sr-only">Abrir menú de acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                  onClick={(e) => {
                                    setEditingWorker(member);
                                    setInviteModalTriggerRect(
                                      (e.target as HTMLElement).getBoundingClientRect()
                                    );
                                    setIsInviteModalOpen(true);
                                  }}
                                  className="cursor-pointer gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                                  <span>Editar datos</span>
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                  disabled={member.id === currentUserId}
                                  onClick={() => handleDeleteWorker(member.id, member.name)}
                                  className="cursor-pointer text-error focus:text-error gap-2 disabled:opacity-40"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-error" />
                                  <span>Eliminar miembro</span>
                                </DropdownMenuCheckboxItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls Footer matching Clientes */}
            <div className="bg-surface-container-low/60 border-t border-outline-variant/30 px-6 py-3 flex items-center justify-between">
              <div className="text-xs text-on-surface-variant font-medium">
                Mostrando{" "}
                <span className="font-semibold text-on-surface">
                  {filteredMembers.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-on-surface">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}
                </span>{" "}
                de <span className="font-semibold text-on-surface">{filteredMembers.length}</span> miembros
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </Button>
                <div className="text-xs font-semibold text-on-surface px-2">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <InviteWorkerModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setEditingWorker(null);
          setInviteModalTriggerRect(null);
        }}
        onSave={handleSaveWorker}
        workerToEdit={editingWorker}
        triggerRect={inviteModalTriggerRect}
      />

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={() => setIsAppointmentModalOpen(false)}
      />

      {/* Feedback Toast */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[120] bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastText}</span>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/components/ui/volta-ui";

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

export const ALL_COLUMNS: { key: TeamColumn; label: string }[] = [
  { key: "miembro", label: "Miembro del Equipo" },
  { key: "rol", label: "Rol y Permisos" },
  { key: "alta", label: "Fecha de Alta" },
  { key: "estado", label: "Estado" },
  { key: "acciones", label: "Acciones" },
];

export const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Reciente";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Reciente";
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getRoleLabel = (role: string) => {
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

export const getRoleBadgeClasses = (role: string) => {
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

export function useTeamList(businessId: string, currentUserId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<TeamColumn>>(
    new Set(["miembro", "rol", "alta", "estado", "acciones"])
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchMembers = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const res = await apiClient.team.getAll<TeamMember[]>(businessId);
      if (Array.isArray(res.data)) {
        setMembers(res.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Error loading team members:", err);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const toggleColumn = useCallback((column: TeamColumn) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        if (next.size > 1) next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  }, []);

  const handleSaveWorker = useCallback(
    async (workerData: {
      id?: string;
      name: string;
      email: string;
      password?: string;
      role: "JEFE" | "EMPLEADO";
    }) => {
      const isEdit = !!workerData.id;
      const res = isEdit
        ? await apiClient.team.update(workerData.id!, {
            name: workerData.name,
            email: workerData.email,
            password: workerData.password,
            role: workerData.role,
            businessId,
          })
        : await apiClient.team.invite({
            name: workerData.name,
            email: workerData.email,
            password: workerData.password,
            role: workerData.role,
            businessId,
          });

      if (res.error) {
        toast.error(res.error || "Error al procesar el trabajador.");
        throw new Error(res.error || "Error al procesar el trabajador.");
      }

      fetchMembers();
      toast.success(isEdit ? "Trabajador actualizado con éxito." : "Trabajador invitado correctamente.");
    },
    [businessId, fetchMembers]
  );

  const handleDeleteWorker = useCallback(
    async (id: string, name: string) => {
      if (id === currentUserId) {
        toast.error("No puedes eliminar tu propia cuenta activa.");
        return;
      }

      if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${name} del equipo?`)) {
        return;
      }

      const res = await apiClient.team.delete(id);
      if (res.error) {
        toast.error(res.error || "Error al eliminar trabajador.");
        return;
      }

      fetchMembers();
      toast.success(`Se ha eliminado a ${name} del equipo.`);
    },
    [currentUserId, fetchMembers]
  );

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (roleFilter !== "all" && member.role !== roleFilter) {
        return false;
      }

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

  const startItem = filteredMembers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length);

  return {
    members,
    isLoading,
    fetchMembers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    visibleColumns,
    toggleColumn,
    currentPage,
    setCurrentPage,
    totalPages,
    startItem,
    endItem,
    filteredMembers,
    paginatedMembers,
    handleSaveWorker,
    handleDeleteWorker,
  };
}

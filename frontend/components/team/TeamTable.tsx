"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Edit3, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Empty, Skeleton } from "@/components/ui/volta-ui";
import {
  formatDate,
  getRoleLabel,
  getRoleBadgeClasses,
  type TeamMember,
  type TeamColumn,
} from "@/lib/hooks/useTeamList";
import type { WorkerToEdit } from "@/components/InviteWorkerModal";

interface TeamTableProps {
  isLoading: boolean;
  members: TeamMember[];
  visibleColumns: Set<TeamColumn>;
  currentUserId?: string;
  onEditWorker: (worker: WorkerToEdit) => void;
  onDeleteWorker: (id: string, name: string) => void;
  onInviteWorkerClick: () => void;
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.03, 0.25),
      duration: 0.25,
      ease: "easeOut" as const,
    },
  }),
};

export const TeamTable: React.FC<TeamTableProps> = ({
  isLoading,
  members,
  visibleColumns,
  currentUserId,
  onEditWorker,
  onDeleteWorker,
  onInviteWorkerClick,
}) => {
  return (
    <div className="relative w-full overflow-x-auto flex-1">
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
                Fecha de Alta
              </TableHead>
            )}
            {visibleColumns.has("estado") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Estado
              </TableHead>
            )}
            {visibleColumns.has("acciones") && (
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5 pr-6">
                Acciones
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="animate-pulse border-b border-outline-variant/20">
                {visibleColumns.has("miembro") && (
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-24 h-3" />
                      </div>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.has("rol") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-28 h-6 rounded-full" />
                  </TableCell>
                )}
                {visibleColumns.has("alta") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-20 h-4" />
                  </TableCell>
                )}
                {visibleColumns.has("estado") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </TableCell>
                )}
                {visibleColumns.has("acciones") && (
                  <TableCell className="text-right py-4 pr-6">
                    <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : members.length > 0 ? (
            members.map((member, index) => {
              const isCurrentUser = member.id === currentUserId;

              return (
                <motion.tr
                  key={member.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/60 group/row"
                >
                  {/* Miembro Column */}
                  {visibleColumns.has("miembro") && (
                    <TableCell className="py-4 pl-6 font-medium">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={member.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-on-surface truncate">
                              {member.name}
                            </p>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {/* Rol Column */}
                  {visibleColumns.has("rol") && (
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(
                          member.role
                        )}`}
                      >
                        {getRoleLabel(member.role)}
                      </span>
                    </TableCell>
                  )}

                  {/* Alta Column */}
                  {visibleColumns.has("alta") && (
                    <TableCell className="whitespace-nowrap py-4">
                      <span className="text-sm text-on-surface-variant">
                        {formatDate(member.createdAt)}
                      </span>
                    </TableCell>
                  )}

                  {/* Estado Column */}
                  {visibleColumns.has("estado") && (
                    <TableCell className="py-4">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Activo</span>
                      </div>
                    </TableCell>
                  )}

                  {/* Acciones Column */}
                  {visibleColumns.has("acciones") && (
                    <TableCell className="text-right py-4 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onEditWorker({
                              id: member.id,
                              name: member.name,
                              email: member.email,
                              role: member.role as "JEFE" | "EMPLEADO",
                            })
                          }
                          className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                          title="Editar permisos del trabajador"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isCurrentUser}
                          onClick={() => onDeleteWorker(member.id, member.name)}
                          className={`h-8 w-8 ${
                            isCurrentUser
                              ? "opacity-30 cursor-not-allowed text-on-surface-variant"
                              : "text-on-surface-variant hover:text-error hover:bg-error/10"
                          }`}
                          title={
                            isCurrentUser
                              ? "No puedes eliminar tu propia cuenta"
                              : "Eliminar trabajador"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.size} className="h-44 text-center">
                <Empty
                  title="No se encontraron miembros en el equipo"
                  description="Invita a tus compañeros o profesionales de tu negocio para que accedan al panel."
                  icon={Users}
                  action={
                    <Button variant="default" onClick={onInviteWorkerClick}>
                      Invitar Trabajador
                    </Button>
                  }
                  className="border-none bg-transparent py-8"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users as UsersIcon,
  Trash2,
  Edit3,
  ShieldAlert,
  MessageCircle,
  CalendarPlus,
} from "lucide-react";
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
import { formatDateTimeParts } from "@/lib/utils";
import { formatPhoneForDisplay, type ClientItem, type ClientColumn } from "@/lib/hooks/useClientsList";

interface ClientsTableProps {
  isLoading: boolean;
  clients: ClientItem[];
  visibleColumns: Set<ClientColumn>;
  getClientAppointmentsCount: (id: string) => number;
  onSendWhatsAppConsent: (client: ClientItem) => void;
  onSendCustomMessage: (client: ClientItem) => void;
  onScheduleAppointment: (client: ClientItem) => void;
  onEditClient: (client: ClientItem) => void;
  onDeleteClient: (id: string, name: string) => void;
  onNewClientClick: () => void;
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

export const ClientsTable: React.FC<ClientsTableProps> = ({
  isLoading,
  clients,
  visibleColumns,
  getClientAppointmentsCount,
  onSendWhatsAppConsent,
  onSendCustomMessage,
  onScheduleAppointment,
  onEditClient,
  onDeleteClient,
  onNewClientClick,
}) => {
  return (
    <div className="relative w-full overflow-x-auto flex-1">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-outline-variant/30">
            {visibleColumns.has("cliente") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5 pl-6">
                Cliente
              </TableHead>
            )}
            {visibleColumns.has("contacto") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Contacto
              </TableHead>
            )}
            {visibleColumns.has("lopd") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Estado LOPD
              </TableHead>
            )}
            {visibleColumns.has("ultimaVisita") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Última Visita
              </TableHead>
            )}
            {visibleColumns.has("servicio") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Servicio Habitual
              </TableHead>
            )}
            {visibleColumns.has("citas") && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                Citas
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
            [...Array(6)].map((_, i) => (
              <TableRow key={i} className="animate-pulse border-b border-outline-variant/20">
                {visibleColumns.has("cliente") && (
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
                {visibleColumns.has("contacto") && (
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="w-28 h-4" />
                      <Skeleton className="w-36 h-3" />
                    </div>
                  </TableCell>
                )}
                {visibleColumns.has("lopd") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-24 h-6 rounded-full" />
                  </TableCell>
                )}
                {visibleColumns.has("ultimaVisita") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-24 h-4" />
                  </TableCell>
                )}
                {visibleColumns.has("servicio") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-28 h-6 rounded-full" />
                  </TableCell>
                )}
                {visibleColumns.has("citas") && (
                  <TableCell className="py-4">
                    <Skeleton className="w-12 h-4" />
                  </TableCell>
                )}
                {visibleColumns.has("acciones") && (
                  <TableCell className="text-right py-4 pr-6">
                    <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : clients.length > 0 ? (
            clients.map((client, index) => {
              const apptCount = getClientAppointmentsCount(client.id);
              const visit = formatDateTimeParts(client.lastVisit);

              return (
                <motion.tr
                  key={client.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/60 group/row"
                >
                  {/* Cliente Column */}
                  {visibleColumns.has("cliente") && (
                    <TableCell className="py-4 pl-6 font-medium">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={client.name}
                          surname={client.surname}
                          avatarUrl={client.avatarUrl}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-on-surface truncate">
                            {client.name} {client.surname || ""}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {client.email || "Sin correo"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {/* Contacto Column */}
                  {visibleColumns.has("contacto") && (
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-on-surface">
                          {formatPhoneForDisplay(client.phone)}
                        </span>
                        {client.email && (
                          <span className="text-xs text-on-surface-variant truncate max-w-[180px]">
                            {client.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* LOPD Column */}
                  {visibleColumns.has("lopd") && (
                    <TableCell className="py-4">
                      {client.lopdStatus === "Aceptado" ? (
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>Aceptado</span>
                        </div>
                      ) : client.lopdStatus === "Pendiente" ? (
                        <div
                          className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline select-none"
                          onClick={() => onSendWhatsAppConsent(client)}
                          title="Haz clic para enviar consentimiento por WhatsApp"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                          <span>Pendiente</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 select-none">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          <span>Rechazado</span>
                        </div>
                      )}
                    </TableCell>
                  )}

                  {/* Última Visita Column */}
                  {visibleColumns.has("ultimaVisita") && (
                    <TableCell className="whitespace-nowrap py-4">
                      {visit ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-on-surface">
                            {visit.date}
                          </span>
                          {visit.time && (
                            <span className="text-xs text-on-surface-variant tabular-nums">
                              {visit.time}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/60 font-medium">
                          Sin visitas aún
                        </span>
                      )}
                    </TableCell>
                  )}

                  {/* Servicio Habitual Column */}
                  {visibleColumns.has("servicio") && (
                    <TableCell className="py-4">
                      {client.frequentService ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high/60 text-on-surface-variant">
                          {client.frequentService}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50">—</span>
                      )}
                    </TableCell>
                  )}

                  {/* Citas Totales Column */}
                  {visibleColumns.has("citas") && (
                    <TableCell className="py-4">
                      <span className="inline-flex items-center justify-center min-w-6 h-6 px-2.5 rounded-full text-xs font-semibold bg-surface-container-high/60 text-on-surface">
                        {apptCount}
                      </span>
                    </TableCell>
                  )}

                  {/* Acciones Column */}
                  {visibleColumns.has("acciones") && (
                    <TableCell className="text-right py-4 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {client.lopdStatus === "Aceptado" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onSendCustomMessage(client)}
                            className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {client.lopdStatus === "Pendiente" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onSendWhatsAppConsent(client)}
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                            title="Enviar recordatorio LOPD por WhatsApp"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onScheduleAppointment(client)}
                          className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                          title="Agendar cita para este cliente"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditClient(client)}
                          className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                          title="Editar cliente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onDeleteClient(client.id, `${client.name} ${client.surname || ""}`)
                          }
                          className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error/10"
                          title="Eliminar cliente"
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
                  title="No se encontraron clientes"
                  description="Prueba a ajustar tu búsqueda o añade un nuevo cliente."
                  icon={UsersIcon}
                  action={
                    <Button variant="default" onClick={onNewClientClick}>
                      Añadir Cliente
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

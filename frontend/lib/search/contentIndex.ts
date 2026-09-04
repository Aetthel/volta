import type React from "react";
import { CalendarClock, Scissors, UserCheck, UserCog } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { scoreEntry, type HighlightRange } from "@/lib/search/fuzzy";

/**
 * Segunda fuente del buscador global: el contenido que ha creado el propio
 * negocio (clientes, servicios, equipo y citas), no solo las funcionalidades
 * del catálogo estático de `commandIndex`.
 *
 * Todo se filtra en el navegador con el mismo motor que las funcionalidades:
 * el backend no expone un endpoint de búsqueda y sus listados ya devuelven el
 * conjunto completo del negocio, que es el mismo que cargan Clientes y Agenda.
 */

export type ContentKind = "cliente" | "servicio" | "profesional" | "cita";

export const CONTENT_GROUP_LABELS: Record<ContentKind, string> = {
  cliente: "Clientes",
  servicio: "Servicios",
  profesional: "Equipo",
  cita: "Citas",
};

/** Orden en que se pintan los grupos de contenido. */
export const CONTENT_KIND_ORDER: ContentKind[] = ["cliente", "cita", "servicio", "profesional"];

const CONTENT_ICONS: Record<ContentKind, React.ElementType> = {
  cliente: UserCheck,
  servicio: Scissors,
  profesional: UserCog,
  cita: CalendarClock,
};

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  description: string;
  keywords: string[];
  href: string;
  icon: React.ElementType;
}

interface RawClient {
  id: string;
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  phone?: string | null;
  frequentService?: string | null;
}

interface RawService {
  id: string;
  name?: string | null;
  description?: string | null;
  duration?: number | null;
  price?: string | number | null;
  isActive?: boolean;
}

interface RawUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface RawAppointment {
  id: string;
  clientName?: string | null;
  clientPhone?: string | null;
  serviceName?: string | null;
  appointmentDate?: string | null;
  service?: { name?: string | null } | null;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  JEFE: "Jefe de negocio",
  EMPLEADO: "Profesional",
};

/** Citas que entran en el índice: desde hace un mes hasta dentro de un año. */
const APPOINTMENT_PAST_DAYS = 30;
const APPOINTMENT_FUTURE_DAYS = 365;
const MAX_APPOINTMENTS = 400;

const DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });

function formatPrice(price: RawService["price"]): string | null {
  const value = typeof price === "string" ? Number.parseFloat(price) : price;
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} €`;
}

function joinDetails(parts: (string | null | undefined)[]): string {
  return parts.filter((part): part is string => !!part && part.trim().length > 0).join(" · ");
}

function mapClients(clients: RawClient[]): ContentItem[] {
  return clients.map((client) => {
    const fullName = [client.name, client.surname]
      .filter((part): part is string => !!part && part.trim().length > 0)
      .join(" ");

    return {
      id: `cliente-${client.id}`,
      kind: "cliente" as const,
      title: fullName || "Cliente sin nombre",
      description: joinDetails([client.phone, client.email, client.frequentService]) || "Ficha de cliente",
      // El teléfono y el email entran como sinónimos: buscar por número o por
      // correo es tan habitual como buscar por nombre.
      keywords: [client.phone, client.email, client.frequentService].filter(
        (value): value is string => !!value
      ),
      href: `/clientes?buscar=${encodeURIComponent(fullName)}`,
      icon: CONTENT_ICONS.cliente,
    };
  });
}

function mapServices(services: RawService[], canManageCatalog: boolean): ContentItem[] {
  return services
    .filter((service) => service.isActive !== false)
    .map((service) => ({
      id: `servicio-${service.id}`,
      kind: "servicio" as const,
      title: service.name || "Servicio sin nombre",
      description:
        joinDetails([
          service.duration ? `${service.duration} min` : null,
          formatPrice(service.price),
          service.description,
        ]) || "Servicio del catálogo",
      keywords: [service.description].filter((value): value is string => !!value),
      // Un empleado no puede abrir el catálogo en Ajustes: para él el servicio
      // solo tiene sentido en la agenda.
      href: canManageCatalog ? "/ajustes?tab=gestion" : "/agenda",
      icon: CONTENT_ICONS.servicio,
    }));
}

function mapTeam(users: RawUser[]): ContentItem[] {
  return users.map((user) => ({
    id: `profesional-${user.id}`,
    kind: "profesional" as const,
    title: user.name || user.email || "Miembro del equipo",
    description: joinDetails([ROLE_LABELS[user.role || ""] || user.role, user.email]) || "Miembro del equipo",
    keywords: [user.email, user.role].filter((value): value is string => !!value),
    href: "/equipo",
    icon: CONTENT_ICONS.profesional,
  }));
}

function mapAppointments(appointments: RawAppointment[]): ContentItem[] {
  const now = Date.now();
  const from = now - APPOINTMENT_PAST_DAYS * 24 * 60 * 60 * 1000;
  const to = now + APPOINTMENT_FUTURE_DAYS * 24 * 60 * 60 * 1000;

  return appointments
    .map((appointment) => {
      const date = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
      return { appointment, date };
    })
    .filter(({ date }) => {
      if (!date || Number.isNaN(date.getTime())) return false;
      const time = date.getTime();
      return time >= from && time <= to;
    })
    // Las más cercanas a hoy primero: son las que se buscan.
    .sort((a, b) => Math.abs(a.date!.getTime() - now) - Math.abs(b.date!.getTime() - now))
    .slice(0, MAX_APPOINTMENTS)
    .map(({ appointment, date }) => {
      const serviceName = appointment.service?.name || appointment.serviceName || null;
      const clientName = appointment.clientName || "Cliente";
      const isoDay = `${date!.getFullYear()}-${String(date!.getMonth() + 1).padStart(2, "0")}-${String(
        date!.getDate()
      ).padStart(2, "0")}`;

      return {
        id: `cita-${appointment.id}`,
        kind: "cita" as const,
        title: `Cita de ${clientName}`,
        description: joinDetails([
          DATE_FORMATTER.format(date!),
          TIME_FORMATTER.format(date!),
          serviceName,
        ]),
        keywords: [serviceName, appointment.clientPhone].filter(
          (value): value is string => !!value
        ),
        href: `/agenda?fecha=${isoDay}`,
        icon: CONTENT_ICONS.cita,
      };
    });
}

export interface FetchContentOptions {
  businessId: string;
  canManageCatalog: boolean;
}

/**
 * Descarga y normaliza el contenido del negocio.
 *
 * Cada listado se resuelve por separado: si uno falla (permisos, red) el
 * buscador sigue ofreciendo el resto en lugar de quedarse vacío.
 */
export async function fetchContentItems({
  businessId,
  canManageCatalog,
}: FetchContentOptions): Promise<ContentItem[]> {
  const [clients, services, team, appointments] = await Promise.all([
    apiClient.clients.getAll<RawClient[]>(businessId).catch(() => null),
    apiClient.services.getAll<RawService[]>(businessId).catch(() => null),
    apiClient.team.getAll<RawUser[]>(businessId).catch(() => null),
    apiClient.appointments.getAll<RawAppointment[]>(businessId).catch(() => null),
  ]);

  const items: ContentItem[] = [];

  if (Array.isArray(clients?.data)) items.push(...mapClients(clients.data));
  if (Array.isArray(services?.data)) items.push(...mapServices(services.data, canManageCatalog));
  if (Array.isArray(team?.data)) items.push(...mapTeam(team.data));
  if (Array.isArray(appointments?.data)) items.push(...mapAppointments(appointments.data));

  return items;
}

export interface ContentResult {
  item: ContentItem;
  score: number;
  titleRanges: HighlightRange[];
}

export interface ContentResultGroup {
  kind: ContentKind;
  label: string;
  results: ContentResult[];
}

/** Tope por tipo: el contenido no debe enterrar a las funcionalidades. */
const MAX_PER_KIND = 5;

export function searchContent(items: ContentItem[], query: string): ContentResult[] {
  if (!query.trim()) return [];

  const results: ContentResult[] = [];

  for (const item of items) {
    const match = scoreEntry(query, {
      title: item.title,
      keywords: item.keywords,
      description: item.description,
      group: CONTENT_GROUP_LABELS[item.kind],
    });

    if (match) results.push({ item, score: match.score, titleRanges: match.titleRanges });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function groupContentResults(results: ContentResult[]): ContentResultGroup[] {
  const byKind = new Map<ContentKind, ContentResult[]>();

  for (const result of results) {
    const bucket = byKind.get(result.item.kind);
    if (bucket) {
      if (bucket.length < MAX_PER_KIND) bucket.push(result);
    } else {
      byKind.set(result.item.kind, [result]);
    }
  }

  return CONTENT_KIND_ORDER.filter((kind) => byKind.has(kind)).map((kind) => ({
    kind,
    label: CONTENT_GROUP_LABELS[kind],
    results: byKind.get(kind)!,
  }));
}

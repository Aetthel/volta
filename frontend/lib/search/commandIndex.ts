import type React from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CalendarPlus,
  CreditCard,
  FileText,
  Globe,
  Inbox,
  Key,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  QrCode,
  Receipt,
  Scissors,
  Settings,
  ShieldCheck,
  Store,
  Type,
  User,
  UserPlus,
  Users,
  Clock,
  Download,
} from "lucide-react";
import type { UserRole } from "@/lib/permissions";
import { scoreEntry, type HighlightRange } from "@/lib/search/fuzzy";

/**
 * Catálogo de todo lo que Volta sabe hacer, pensado para el buscador global.
 *
 * Cada pantalla, pestaña de ajustes y opción relevante tiene su propia entrada
 * para que el usuario pueda llegar a ella sin conocer el camino por el menú.
 * Las `keywords` son la parte importante: recogen el vocabulario real (regional,
 * coloquial y en inglés) con el que la gente busca cada cosa.
 */

/** Acciones que no son una simple navegación. */
export type CommandActionId = "sign-out";

export type CommandGroupId =
  | "navegacion"
  | "agenda"
  | "clientes"
  | "equipo"
  | "negocio"
  | "mensajeria"
  | "cuenta"
  | "facturacion"
  | "apariencia"
  | "proximamente";

export const COMMAND_GROUP_LABELS: Record<CommandGroupId, string> = {
  navegacion: "Ir a",
  agenda: "Agenda y citas",
  clientes: "Clientes",
  equipo: "Equipo",
  negocio: "Negocio y reservas",
  mensajeria: "Mensajes y WhatsApp",
  cuenta: "Cuenta y seguridad",
  facturacion: "Plan y facturación",
  apariencia: "Apariencia",
  proximamente: "En preparación",
};

/** Orden en que se pintan los grupos cuando hay resultados de varios. */
const GROUP_ORDER: CommandGroupId[] = [
  "navegacion",
  "agenda",
  "clientes",
  "equipo",
  "negocio",
  "mensajeria",
  "cuenta",
  "facturacion",
  "apariencia",
  "proximamente",
];

export interface CommandEntry {
  id: string;
  title: string;
  description: string;
  group: CommandGroupId;
  icon: React.ElementType;
  /** Destino de navegación. `:businessId` se sustituye al construir el índice. */
  href?: string;
  /** Acción a ejecutar en lugar de navegar. */
  action?: CommandActionId;
  /** Abre el destino en una pestaña nueva (enlace público de reservas). */
  external?: boolean;
  keywords: string[];
  /** Roles que ven la entrada. Si se omite, la ven todos. */
  roles?: UserRole[];
  /** Todavía no existe: aparece para que el término se encuentre, sin destino. */
  comingSoon?: boolean;
  /** Se muestra en la lista inicial, antes de escribir nada. */
  featured?: boolean;
}

const ALL_ROLES: UserRole[] = ["ADMIN", "JEFE", "EMPLEADO"];
const STAFF: UserRole[] = ["JEFE", "EMPLEADO"];
const OWNER: UserRole[] = ["JEFE"];
const OWNER_ADMIN: UserRole[] = ["ADMIN", "JEFE"];

const COMMAND_ENTRIES: CommandEntry[] = [
  // ─────────────────────────────── Navegación ───────────────────────────────
  {
    id: "nav-inicio",
    title: "Inicio",
    description: "Panel de resumen con las citas del día, ingresos y ocupación.",
    group: "navegacion",
    icon: LayoutDashboard,
    href: "/inicio",
    roles: STAFF,
    featured: true,
    keywords: [
      "dashboard", "panel", "resumen", "home", "principal", "metricas",
      "kpi", "citas hoy", "ocupacion", "ingresos estimados", "nuevos clientes",
    ],
  },
  {
    id: "nav-agenda",
    title: "Agenda",
    description: "Calendario de citas por día y semana, con filtros por profesional.",
    group: "navegacion",
    icon: Calendar,
    href: "/agenda",
    roles: STAFF,
    featured: true,
    keywords: [
      "calendario", "citas", "reservas", "horario", "planning", "cuadrante",
      "dia", "semana", "turnos", "booking", "calendar", "appointments",
    ],
  },
  {
    id: "nav-clientes",
    title: "Clientes",
    description: "Fichas de clientes, historial de citas, consentimientos y exportación.",
    group: "navegacion",
    icon: Users,
    href: "/clientes",
    roles: STAFF,
    featured: true,
    keywords: [
      "clientas", "clientela", "contactos", "fichas", "base de datos",
      "customers", "crm", "agenda de contactos", "telefonos",
    ],
  },
  {
    id: "nav-equipo",
    title: "Equipo",
    description: "Profesionales del negocio, sus datos, roles y disponibilidad.",
    group: "navegacion",
    icon: Users,
    href: "/equipo",
    roles: STAFF,
    keywords: [
      "trabajadores", "empleados", "personal", "staff", "profesionales",
      "peluqueros", "barberos", "esteticistas", "plantilla", "team", "usuarios",
    ],
  },
  {
    id: "nav-inbox",
    title: "Inbox",
    description: "Alertas y avisos del negocio: nuevas reservas, cancelaciones y recordatorios.",
    group: "navegacion",
    icon: Inbox,
    href: "/inbox",
    featured: true,
    keywords: [
      "alertas", "notificaciones", "avisos", "bandeja", "mensajes",
      "novedades", "campana", "notifications", "sin leer", "pendientes",
    ],
  },
  {
    id: "nav-ajustes",
    title: "Ajustes",
    description: "Preferencias de la cuenta, del negocio y de la aplicación.",
    group: "navegacion",
    icon: Settings,
    href: "/ajustes",
    keywords: [
      "configuracion", "preferencias", "opciones", "settings", "config",
      "administrar", "parametros", "ajuste",
    ],
  },
  {
    id: "nav-sedes",
    title: "Locales",
    description: "Gestión de las sedes del negocio y sus datos.",
    group: "navegacion",
    icon: Store,
    href: "/sedes",
    roles: ["ADMIN"],
    keywords: [
      "sedes", "sucursales", "tiendas", "centros", "establecimientos",
      "locations", "multilocal", "multi sede",
    ],
  },
  {
    id: "nav-admin",
    title: "Control Global",
    description: "Panel de administración con la visión global de todos los negocios.",
    group: "navegacion",
    icon: BarChart3,
    href: "/admin",
    roles: ["ADMIN"],
    keywords: [
      "admin", "administracion", "superadmin", "global", "backoffice",
      "control", "negocios", "cuentas",
    ],
  },

  // ───────────────────────────── Agenda y citas ─────────────────────────────
  {
    id: "action-nueva-cita",
    title: "Nueva cita",
    description: "Crea una reserva para un cliente eligiendo servicio, profesional y hora.",
    group: "agenda",
    icon: CalendarPlus,
    href: "/agenda?accion=nueva-cita",
    roles: STAFF,
    featured: true,
    keywords: [
      "crear cita", "anadir cita", "agendar", "reservar", "apuntar",
      "nueva reserva", "dar hora", "coger hora", "book", "new appointment",
      "cita nueva", "meter cita",
    ],
  },
  {
    id: "agenda-vista-dia",
    title: "Vista de día",
    description: "Consulta la agenda hora a hora de una jornada concreta.",
    group: "agenda",
    icon: Clock,
    href: "/agenda",
    roles: STAFF,
    keywords: ["diaria", "hoy", "jornada", "franjas", "horas", "day view"],
  },
  {
    id: "agenda-vista-semana",
    title: "Vista de semana",
    description: "Consulta la agenda completa de la semana con todos los profesionales.",
    group: "agenda",
    icon: Calendar,
    href: "/agenda",
    roles: STAFF,
    keywords: ["semanal", "semana", "week view", "cuadrante semanal"],
  },

  // ──────────────────────────────── Clientes ────────────────────────────────
  {
    id: "action-nuevo-cliente",
    title: "Nuevo cliente",
    description: "Da de alta una ficha de cliente con teléfono, email y notas.",
    group: "clientes",
    icon: UserPlus,
    href: "/clientes?accion=nuevo-cliente",
    roles: STAFF,
    featured: true,
    keywords: [
      "crear cliente", "anadir cliente", "alta cliente", "registrar cliente",
      "nueva clienta", "add client", "new customer", "dar de alta",
    ],
  },
  {
    id: "clientes-exportar",
    title: "Exportar clientes a CSV",
    description: "Descarga la lista de clientes en un archivo CSV para Excel.",
    group: "clientes",
    icon: Download,
    href: "/clientes",
    roles: OWNER,
    keywords: [
      "exportar", "csv", "excel", "descargar clientes", "backup",
      "copia", "export", "listado", "hoja de calculo",
    ],
  },
  {
    id: "clientes-lopd",
    title: "Consentimiento LOPD / RGPD",
    description: "Envía por WhatsApp la solicitud de consentimiento de datos y consulta su estado.",
    group: "clientes",
    icon: ShieldCheck,
    href: "/clientes",
    roles: STAFF,
    keywords: [
      "lopd", "rgpd", "gdpr", "proteccion de datos", "consentimiento",
      "privacidad", "firma", "legal", "aviso legal", "datos personales",
    ],
  },
  {
    id: "clientes-historial",
    title: "Historial de un cliente",
    description: "Citas anteriores, gasto acumulado y actividad de cada ficha.",
    group: "clientes",
    icon: FileText,
    href: "/clientes",
    roles: STAFF,
    keywords: [
      "historial", "visitas", "ultima cita", "frecuencia", "inactivos",
      "activos", "seguimiento", "fidelidad",
    ],
  },

  // ───────────────────────────────── Equipo ─────────────────────────────────
  {
    id: "equipo-alta",
    title: "Añadir profesional al equipo",
    description: "Da de alta a un trabajador y asígnale rol y servicios.",
    group: "equipo",
    icon: UserPlus,
    href: "/equipo",
    roles: OWNER,
    keywords: [
      "invitar", "alta trabajador", "nuevo empleado", "contratar",
      "anadir usuario", "dar acceso", "roles", "permisos", "jefe", "empleado",
    ],
  },

  // ────────────────────────── Negocio y reservas ────────────────────────────
  {
    id: "negocio-general",
    title: "Gestión del Negocio",
    description: "Datos del establecimiento, horarios, reservas online y catálogo de servicios.",
    group: "negocio",
    icon: Store,
    href: "/ajustes?tab=gestion",
    roles: OWNER,
    keywords: [
      "negocio", "empresa", "establecimiento", "local", "datos del negocio",
      "nombre comercial", "direccion", "telefono del negocio", "logo", "portada",
    ],
  },
  {
    id: "negocio-horarios",
    title: "Horarios de apertura",
    description: "Define hora de apertura y cierre para cada día de la semana.",
    group: "negocio",
    icon: Clock,
    href: "/ajustes?tab=gestion",
    roles: OWNER,
    keywords: [
      "horario", "apertura", "cierre", "abrir", "cerrar", "festivos",
      "dias libres", "descanso", "jornada", "opening hours", "vacaciones",
    ],
  },
  {
    id: "negocio-servicios",
    title: "Catálogo de servicios y precios",
    description: "Servicios que ofreces, con su precio y duración estimada.",
    group: "negocio",
    icon: Scissors,
    href: "/ajustes?tab=gestion",
    roles: OWNER,
    featured: true,
    keywords: [
      "servicios", "catalogo", "precios", "tarifas", "duracion", "tratamientos",
      "corte", "tinte", "manicura", "prestaciones", "services", "pvp",
      "lista de precios", "anadir servicio",
    ],
  },
  {
    id: "negocio-reservas-online",
    title: "Enlace de reservas online",
    description: "Enlace público y código para que tus clientes reserven solos.",
    group: "negocio",
    icon: Link2,
    href: "/ajustes?tab=gestion",
    roles: OWNER,
    keywords: [
      "reserva online", "link", "url publica", "compartir", "codigo",
      "web de reservas", "autoreserva", "qr reservas", "booking online",
    ],
  },
  {
    id: "negocio-pagina-publica",
    title: "Abrir mi página de reservas",
    description: "Ve la página pública tal y como la ven tus clientes.",
    group: "negocio",
    icon: Globe,
    href: "/booking/:businessId",
    external: true,
    roles: OWNER,
    keywords: [
      "pagina publica", "vista cliente", "previsualizar", "ver como cliente",
      "landing", "microsite", "preview",
    ],
  },

  // ───────────────────────── Mensajes y WhatsApp ────────────────────────────
  {
    id: "mensajeria-general",
    title: "Mensajes y WhatsApp",
    description: "Configuración de la mensajería automática del negocio.",
    group: "mensajeria",
    icon: MessageSquare,
    href: "/ajustes?tab=mensajeria",
    roles: STAFF,
    featured: true,
    keywords: [
      "whatsapp", "wasap", "wsp", "wa", "mensajeria", "mensajes",
      "sms", "chat", "comunicacion", "notificaciones a clientes",
    ],
  },
  {
    id: "mensajeria-qr",
    title: "Conectar WhatsApp (QR)",
    description: "Vincula tu número escaneando el código QR desde el móvil.",
    group: "mensajeria",
    icon: QrCode,
    href: "/ajustes?tab=mensajeria",
    roles: STAFF,
    keywords: [
      "qr", "vincular", "conectar whatsapp", "escanear", "emparejar",
      "sesion whatsapp", "desconectado", "reconectar", "numero",
    ],
  },
  {
    id: "mensajeria-recordatorios",
    title: "Recordatorios automáticos",
    description: "Aviso automático al cliente 24 h antes de su cita.",
    group: "mensajeria",
    icon: Bell,
    href: "/ajustes?tab=mensajeria",
    roles: STAFF,
    keywords: [
      "recordatorio", "aviso", "24h", "automatico", "reminder",
      "confirmacion de cita", "no shows", "ausencias", "avisar",
    ],
  },
  {
    id: "mensajeria-plantillas",
    title: "Plantillas de mensajes",
    description: "Textos de bienvenida, confirmación y recordatorio que se envían al cliente.",
    group: "mensajeria",
    icon: FileText,
    href: "/ajustes?tab=mensajeria",
    roles: STAFF,
    keywords: [
      "plantilla", "template", "texto", "mensaje predefinido", "bienvenida",
      "confirmacion", "personalizar mensaje", "variables", "editar mensaje",
    ],
  },

  // ─────────────────────────── Cuenta y seguridad ───────────────────────────
  {
    id: "cuenta-perfil",
    title: "Perfil y Seguridad",
    description: "Tus datos personales, foto, contraseña y verificación en dos pasos.",
    group: "cuenta",
    icon: User,
    href: "/ajustes?tab=perfil",
    keywords: [
      "perfil", "cuenta", "mis datos", "usuario", "profile", "seguridad",
    ],
  },
  {
    id: "cuenta-email",
    title: "Nombre y correo electrónico",
    description: "Cambia el nombre visible y la dirección de correo de tu cuenta.",
    group: "cuenta",
    icon: Mail,
    href: "/ajustes?tab=perfil",
    keywords: [
      "email", "correo", "mail", "cambiar nombre", "renombrar",
      "direccion de correo", "verificar correo",
    ],
  },
  {
    id: "cuenta-password",
    title: "Cambiar contraseña",
    description: "Actualiza la contraseña de acceso a tu cuenta.",
    group: "cuenta",
    icon: Key,
    href: "/ajustes?tab=perfil",
    keywords: [
      "contrasena", "password", "clave", "cambiar clave", "restablecer",
      "recuperar", "acceso", "credenciales", "olvide",
    ],
  },
  {
    id: "cuenta-2fa",
    title: "Verificación en dos pasos (2FA)",
    description: "Añade un segundo factor de autenticación al iniciar sesión.",
    group: "cuenta",
    icon: ShieldCheck,
    href: "/ajustes?tab=perfil",
    keywords: [
      "2fa", "dos pasos", "doble factor", "mfa", "autenticacion",
      "codigo de verificacion", "seguridad", "totp", "authenticator",
    ],
  },
  {
    id: "action-cerrar-sesion",
    title: "Cerrar sesión",
    description: "Sal de tu cuenta en este dispositivo.",
    group: "cuenta",
    icon: LogOut,
    action: "sign-out",
    keywords: ["logout", "salir", "desconectar", "sign out", "cerrar"],
  },

  // ───────────────────────── Plan y facturación ─────────────────────────────
  {
    id: "facturacion-general",
    title: "Facturación y Suscripción",
    description: "Plan activo, ciclo de cobro, método de pago y facturas.",
    group: "facturacion",
    icon: CreditCard,
    href: "/ajustes?tab=facturacion",
    roles: OWNER_ADMIN,
    keywords: [
      "facturacion", "suscripcion", "pago", "cobro", "billing",
      "cuota", "mensualidad", "renovacion", "cancelar suscripcion",
    ],
  },
  {
    id: "facturacion-plan",
    title: "Cambiar de plan",
    description: "Compara el Plan Básico y el Plan Pro y cambia de plan.",
    group: "facturacion",
    icon: BarChart3,
    href: "/ajustes?tab=facturacion",
    roles: OWNER_ADMIN,
    keywords: [
      "plan", "pro", "basico", "upgrade", "mejorar plan", "precio",
      "tarifa", "subir de plan", "prueba", "trial", "limites",
    ],
  },
  {
    id: "facturacion-metodo-pago",
    title: "Método de pago",
    description: "Tarjeta vinculada a la suscripción y sus datos de cobro.",
    group: "facturacion",
    icon: CreditCard,
    href: "/ajustes?tab=facturacion",
    roles: OWNER_ADMIN,
    keywords: [
      "tarjeta", "metodo de pago", "visa", "cobro", "domiciliacion",
      "cambiar tarjeta", "datos de pago",
    ],
  },
  {
    id: "facturacion-facturas",
    title: "Descargar facturas",
    description: "Historial de facturas de la suscripción en PDF.",
    group: "facturacion",
    icon: Receipt,
    href: "/ajustes?tab=facturacion",
    roles: OWNER_ADMIN,
    keywords: [
      "facturas", "invoice", "pdf", "recibo", "justificante",
      "historial de pagos", "descargar factura", "contabilidad",
    ],
  },

  // ─────────────────────────────── Apariencia ───────────────────────────────
  {
    id: "apariencia-general",
    title: "Personalización",
    description: "Colores de marca, tamaño de letra y curvatura de los bordes.",
    group: "apariencia",
    icon: Palette,
    href: "/ajustes?tab=personalizacion",
    roles: OWNER,
    keywords: [
      "personalizacion", "aspecto", "tema", "theme", "estilo", "apariencia",
      "diseno", "interfaz", "marca", "branding",
    ],
  },
  {
    id: "apariencia-color",
    title: "Color corporativo",
    description: "Elige la paleta de color con la que se pinta toda la aplicación.",
    group: "apariencia",
    icon: Palette,
    href: "/ajustes?tab=personalizacion",
    roles: OWNER,
    keywords: [
      "color", "paleta", "colores", "verde", "azul", "morado",
      "cambiar color", "corporativo", "tema oscuro", "modo oscuro",
    ],
  },
  {
    id: "apariencia-tipografia",
    title: "Tamaño de letra",
    description: "Escala tipográfica de la interfaz, de compacta a ampliada.",
    group: "apariencia",
    icon: Type,
    href: "/ajustes?tab=personalizacion",
    roles: OWNER,
    keywords: [
      "letra", "fuente", "tipografia", "tamano", "texto grande",
      "accesibilidad", "font", "legibilidad", "zoom",
    ],
  },
  {
    id: "apariencia-bordes",
    title: "Curvatura de bordes",
    description: "Redondeo de tarjetas, botones y campos de la interfaz.",
    group: "apariencia",
    icon: Palette,
    href: "/ajustes?tab=personalizacion",
    roles: OWNER,
    keywords: [
      "bordes", "esquinas", "redondeo", "radius", "curvatura",
      "cuadrado", "redondo",
    ],
  },

  // ────────────────────────────── En preparación ────────────────────────────
  {
    id: "soon-analitica",
    title: "Analítica",
    description: "Informes de facturación, ocupación y rendimiento del equipo.",
    group: "proximamente",
    icon: Activity,
    comingSoon: true,
    roles: STAFF,
    keywords: [
      "analitica", "estadisticas", "metricas", "informes", "analytics",
      "graficas", "rendimiento", "facturacion mensual", "datos",
    ],
  },
  {
    id: "soon-reportes",
    title: "Reportes",
    description: "Descarga de informes periódicos del negocio.",
    group: "proximamente",
    icon: FileText,
    comingSoon: true,
    roles: STAFF,
    keywords: [
      "reportes", "reports", "informe", "cierre de caja", "resumen mensual",
      "exportar informe",
    ],
  },
];

export interface BuildIndexOptions {
  role?: string | null;
  businessId?: string | null;
  subscriptionStatus?: string | null;
}

/**
 * Devuelve las entradas visibles para el usuario actual, con los destinos
 * dinámicos ya resueltos.
 */
export function buildCommandIndex({
  role,
  businessId,
  subscriptionStatus,
}: BuildIndexOptions): CommandEntry[] {
  const currentRole = (role?.toUpperCase() as UserRole) || "EMPLEADO";
  const isDemoSandbox = subscriptionStatus === "DEMO_SANDBOX";

  return COMMAND_ENTRIES.filter((entry) => (entry.roles ?? ALL_ROLES).includes(currentRole))
    .filter((entry) => {
      // Sin negocio asociado no hay página pública que abrir.
      if (entry.href?.includes(":businessId")) return !!businessId;
      // En la demo efímera Ajustes está bloqueado entero: ofrecer sus opciones
      // solo llevaría al muro de "regístrate".
      if (isDemoSandbox && entry.href?.startsWith("/ajustes")) return false;
      return true;
    })
    .map((entry) =>
      entry.href?.includes(":businessId")
        ? { ...entry, href: entry.href.replace(":businessId", businessId!) }
        : entry
    );
}

export interface CommandResult {
  entry: CommandEntry;
  score: number;
  titleRanges: HighlightRange[];
}

export interface CommandResultGroup {
  id: CommandGroupId;
  label: string;
  results: CommandResult[];
}

const MAX_RESULTS = 24;

/** Filtra el índice con la consulta y ordena por relevancia. */
export function searchCommands(entries: CommandEntry[], query: string): CommandResult[] {
  if (!query.trim()) return [];

  const results: CommandResult[] = [];

  for (const entry of entries) {
    const match = scoreEntry(query, {
      title: entry.title,
      keywords: entry.keywords,
      description: entry.description,
      group: COMMAND_GROUP_LABELS[entry.group],
    });

    if (!match) continue;

    // Lo que aún no existe nunca debe adelantar a algo que sí se puede abrir.
    const score = entry.comingSoon ? match.score - 45 : match.score;
    results.push({ entry, score, titleRanges: match.titleRanges });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

/** Agrupa los resultados por sección respetando el orden del catálogo. */
export function groupResults(results: CommandResult[]): CommandResultGroup[] {
  const byGroup = new Map<CommandGroupId, CommandResult[]>();

  for (const result of results) {
    const bucket = byGroup.get(result.entry.group);
    if (bucket) bucket.push(result);
    else byGroup.set(result.entry.group, [result]);
  }

  return GROUP_ORDER.filter((id) => byGroup.has(id)).map((id) => ({
    id,
    label: COMMAND_GROUP_LABELS[id],
    results: byGroup.get(id)!,
  }));
}

/** Sugerencias que se muestran con el buscador vacío. */
export function getFeaturedEntries(entries: CommandEntry[]): CommandEntry[] {
  return entries.filter((entry) => entry.featured);
}

export function findEntryById(entries: CommandEntry[], id: string): CommandEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

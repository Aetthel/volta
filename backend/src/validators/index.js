import { z } from "zod";

// Users Validation Schemas
export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "JEFE", "EMPLEADO"], { errorMap: () => ({ message: "Rol no válido" }) }),
  businessId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de email no válido").optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .nullable(),
  role: z.enum(["ADMIN", "JEFE", "EMPLEADO"]).optional(),
  businessId: z.string().optional().nullable(),
});

// Clients Validation Schemas
export const createClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  surname: z.string().optional().nullable(),
  email: z
    .string()
    .email("Formato de email no válido")
    .optional()
    .nullable()
    .or(z.string().length(0)),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  businessId: z.string().min(1, "El ID de negocio es requerido"),
});

export const updateClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  surname: z.string().optional().nullable(),
  email: z
    .string()
    .email("Formato de email no válido")
    .optional()
    .nullable()
    .or(z.string().length(0)),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido")
    .optional(),
  lastVisit: z.string().optional().nullable(),
  frequentService: z.string().optional().nullable(),
});

// Appointments Validation Schemas
export const appointmentSchema = z.object({
  clientName: z.string().optional().nullable().or(z.literal("")),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido")
    .optional()
    .nullable()
    .or(z.literal("")),
  appointmentDate: z.string().datetime("Formato de fecha no válido (debe ser ISO 8601 UTC)"),
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  service: z.string().optional().nullable(),
});

export const updateAppointmentSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido")
    .optional(),
  appointmentDate: z
    .string()
    .datetime("Formato de fecha no válido (debe ser ISO 8601 UTC)")
    .optional(),
  status: z.enum(["PENDING", "SENT", "ERROR"]).optional(),
  serviceName: z.string().optional().nullable(),
});

// Services Validation Schemas
export const createServiceSchema = z.object({
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  name: z.string().min(2, "El nombre de servicio debe tener al menos 2 caracteres"),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, "La duración debe ser al menos de 1 minuto"),
  price: z.number().min(0, "El precio debe ser un número positivo"),
  type: z.enum(["INDIVIDUAL", "GROUP"]).optional(),
  capacity: z.number().int().min(1).optional(),
  color: z.string().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, "El nombre de servicio debe tener al menos 2 caracteres").optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, "La duración debe ser al menos de 1 minuto").optional(),
  price: z.number().min(0, "El precio debe ser un número positivo").optional(),
  type: z.enum(["INDIVIDUAL", "GROUP"]).optional(),
  capacity: z.number().int().min(1).optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Business Validation Schemas
export const updateBusinessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de email no válido").optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido")
    .optional(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  themeColor: z.string().optional(),
  fontSizeLevel: z.string().optional(),
  borderRadiusLevel: z.string().optional(),
});

export const updateHoursSchema = z.array(
  z.object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora no válido (debe ser HH:MM)"),
    closeTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora no válido (debe ser HH:MM)"),
    isClosed: z.boolean(),
  })
);

/**
 * Excepciones a los festivos. La clave se valida contra el catálogo en el
 * controlador: aquí solo se comprueba la forma.
 */
export const updateHolidaysSchema = z.array(
  z.object({
    holidayKey: z.string().min(1, "La clave del festivo es requerida"),
    isObserved: z.boolean(),
  })
);

// WhatsApp Template Validation Schema
export const templateSchema = z.object({
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  welcomeMessage: z
    .string()
    .max(1000, "El mensaje de bienvenida no puede superar los 1000 caracteres")
    .optional()
    .nullable(),
  reminderMessage: z
    .string()
    .max(1000, "El mensaje de recordatorio no puede superar los 1000 caracteres")
    .optional()
    .nullable(),
});

// Admin Business Creation Schema
export const createBusinessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email no válido"),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  address: z.string().optional().nullable(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
});

// Alerts Validation Schemas
export const createAlertSchema = z.object({
  type: z.enum(["EMERGENTE", "AVISO", "NOTIFICACION"], {
    errorMap: () => ({ message: "Tipo de alerta no válido" }),
  }),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  targetUserId: z.string().optional(),
  targetBusinessId: z.string().optional(),
  targetRole: z.enum(["ADMIN", "JEFE", "EMPLEADO"]).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  businessName: z.string().min(2, "El nombre del negocio debe tener al menos 2 caracteres"),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  businessType: z.string().optional().nullable(),
});

const phoneField = z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido");

// El portal envía la hora que el cliente ha visto en pantalla ("2026-08-28T10:00:00"),
// que es hora local del negocio: es lo que compara `validateBusinessHours`. Exigir
// el sufijo `Z` de `z.datetime()` rechazaba todas las reservas del portal.
const localOrOffsetDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
    "Formato de fecha no válido (ISO 8601)"
  );

// `clientName` y `clientPhone` ya no se declaran: la identidad del que reserva
// sale del token de sesión verificado, nunca del cuerpo de la petición.
export const publicBookingSchema = z.object({
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  serviceId: z.string().min(1, "El ID de servicio es requerido"),
  clientEmail: z
    .string()
    .email("Formato de email no válido")
    .optional()
    .nullable()
    .or(z.string().length(0)),
  appointmentDate: localOrOffsetDateTime,
});

export const bookingIdentityStartSchema = z.object({
  phone: phoneField,
  fullName: z
    .string()
    .max(120, "El nombre es demasiado largo")
    .optional()
    .nullable()
    .or(z.string().length(0)),
});

export const bookingIdentityVerifySchema = z.object({
  phone: phoneField,
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});

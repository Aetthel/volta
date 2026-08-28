# Diseño Técnico: Arquitectura de Permisos y Tarifas (Básico 30€ vs Pro 40€)

## 1. Arquitectura y Modelo de Dominio

### A. Definición de Planes (`SubscriptionPlan`)
```typescript
export type PlanTier = "BASIC" | "PRO" | "ENTERPRISE";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number; // 30.00 | 40.00
  extraWorkerMonthlyPrice: number; // 5.00
  includedWorkers: number; // BASIC: 1, PRO: 2
  maxLocations: number; // BASIC: 1, PRO: Infinity
  monthlyBookingQuota: number; // BASIC: 100, PRO: Infinity
  features: {
    whatsappTwoWayBot: boolean;
    onlinePaymentsAndDeposits: boolean;
    advancedClientManagement: boolean;
    businessAnalytics: boolean;
    priorityChatSupport: boolean;
  };
}
```

### B. Matriz de Permisos por Rol (`UserRole`) y Plan (`SubscriptionPlan`)

| Acción / Recurso | `ADMIN` | `JEFE` (Plan Básico) | `JEFE` (Plan Pro) | `EMPLEADO` (Ambos planes) |
| :--- | :--- | :--- | :--- | :--- |
| **Ver Agenda & Calendario** | ✅ Total | ✅ Sede única | ✅ Multi-sede | ✅ Citas asignadas / generales |
| **Crear / Modificar Citas** | ✅ | ✅ (Hasta 100 online/mes) | ✅ Ilimitadas | ✅ |
| **Añadir Trabajadores** | ✅ | ⚠️ 1 incluido (+5€ extra) | ⚠️ 2 incluidos (+5€ extra) | ❌ |
| **Crear Sedes / Salas** | ✅ | ❌ Máx. 1 sede | ✅ Ilimitadas | ❌ |
| **Conectar WhatsApp Bot** | ✅ | ❌ Requiere Pro | ✅ Habilitado | ❌ |
| **Configurar Señas / Pagos** | ✅ | ❌ Requiere Pro | ✅ Habilitado | ❌ |
| **Ver Analítica e Ingresos** | ✅ | ❌ Resumen básico | ✅ Gráficos completos | ❌ |
| **Gestionar Facturación / Plan** | ✅ | ✅ | ✅ | ❌ |
| **Ajustes del Negocio** | ✅ | ✅ | ✅ | ❌ Solo perfil propio |

---

## 2. Implementación en Backend

### A. Middleware de Validación de Límites (`subscriptionMiddleware.js`)
```javascript
export const checkSubscriptionLimits = (action) => {
  return async (req, res, next) => {
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
      include: { _count: { select: { users: true, appointments: true } } }
    });

    if (business.subscriptionStatus === "EXPIRED") {
      return res.status(403).json({ error: "Suscripción expirada", requiresUpgrade: true });
    }

    if (business.subscriptionPlan === "BASIC") {
      if (action === "WHATSAPP_CONNECT") {
        return res.status(403).json({
          error: "El bot interactivo de WhatsApp requiere el Plan Pro (40€/mes).",
          requiresUpgrade: true
        });
      }
      if (action === "CREATE_LOCATION") {
        return res.status(403).json({
          error: "El Plan Básico permite 1 única sede. Actualiza a Pro para multisede.",
          requiresUpgrade: true
        });
      }
      if (action === "ONLINE_PAYMENTS") {
        return res.status(403).json({
          error: "El cobro de señas y pagos online requiere el Plan Pro.",
          requiresUpgrade: true
        });
      }
      if (action === "INVITE_WORKER") {
        // Validación de trabajadores (1 incluido, slots adicionales)
        const currentWorkers = business._count.users;
        // Si excede los slots contratados:
        // res.status(403).json({ error: "Límite de trabajadores alcanzado. Añade slots por +5€/mes." })
      }
      if (action === "PUBLIC_BOOKING") {
        const monthlyCount = await getMonthlyBookingCount(business.id);
        if (monthlyCount >= 100) {
          return res.status(403).json({
            error: "Límite de 100 reservas online alcanzado este mes en Plan Básico.",
            requiresUpgrade: true
          });
        }
      }
    }
    return next();
  };
};
```

### B. Servicio de Suscripción (`subscriptionService.js`)
- Configuración de precios base:
  - Básico: 30,00 €
  - Pro: 40,00 €
  - Trabajador adicional: 5,00 € / trabajador / mes
- Cálculo de checkout en Lemon Squeezy con soporte para cantidad de items / add-ons de trabajadores.

---

## 3. Implementación en Frontend

### A. Módulo Central de Permisos (`frontend/lib/permissions.ts`)
Funciones de utilidad puras y tipadas consumibles en componentes React, sidebars, modales y botones:
- `getPlanConfig(plan: PlanTier): PlanConfig`
- `hasFeatureAccess(plan: PlanTier, feature: keyof PlanConfig['features']): boolean`
- `canUserPerform(role: UserRole, plan: PlanTier, action: AppAction): boolean`

### B. Componente `SubscriptionCheckoutModal.tsx`
- **Paso 1**: Selección interactiva de Básico (30€) vs Pro (40€).
- **Selector de Trabajadores**:
  - Básico: 1 incluido. Contador para añadir trabajadores (+5€ c/u).
  - Pro: 2 incluidos. Contador para añadir trabajadores (+5€ c/u).
- **Cálculo dinámico de total**: `Base + (ExtraWorkers * 5) - DescuentoCupon`.
- **Desglose de IVA y Checkout con Lemon Squeezy**.

### C. Gating Visual y Banners
- Banners de bloqueo contextual en Ajustes (`BillingSection`, `WhatsAppSection`, `SedesSection`).
- Modal de actualización rápida (`UpgradeProModal`) al hacer clic en features restringidas.

export type PlanTier = "BASIC" | "PRO" | "ENTERPRISE";
export type UserRole = "ADMIN" | "JEFE" | "EMPLEADO";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "DEMO_SANDBOX";

export type PlanFeature =
  | "whatsappTwoWayBot"
  | "onlinePaymentsAndDeposits"
  | "advancedClientManagement"
  | "businessAnalytics"
  | "priorityChatSupport"
  | "multiLocation"
  | "multiCalendar";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  extraWorkerMonthlyPrice: number;
  includedWorkers: number;
  maxLocations: number;
  monthlyBookingQuota: number;
  features: Record<PlanFeature, boolean>;
}

export const PLAN_CONFIGS: Record<"BASIC" | "PRO", PlanConfig> = {
  BASIC: {
    id: "BASIC",
    name: "Básico",
    tagline: "Para empezar sin complicaciones",
    priceMonthly: 30.0,
    extraWorkerMonthlyPrice: 5.0,
    includedWorkers: 1,
    maxLocations: 1,
    monthlyBookingQuota: 100,
    features: {
      whatsappTwoWayBot: false,
      onlinePaymentsAndDeposits: false,
      advancedClientManagement: false,
      businessAnalytics: false,
      priorityChatSupport: false,
      multiLocation: false,
      multiCalendar: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    tagline: "Para negocios que quieren crecer",
    priceMonthly: 40.0,
    extraWorkerMonthlyPrice: 5.0,
    includedWorkers: 2,
    maxLocations: Infinity,
    monthlyBookingQuota: Infinity,
    features: {
      whatsappTwoWayBot: true,
      onlinePaymentsAndDeposits: true,
      advancedClientManagement: true,
      businessAnalytics: true,
      priorityChatSupport: true,
      multiLocation: true,
      multiCalendar: true,
    },
  },
};

/**
 * Returns configuration object for a specific plan tier
 */
export function getPlanConfig(plan?: string | null): PlanConfig {
  if (!plan) return PLAN_CONFIGS.PRO;
  const upper = plan.toUpperCase();
  if (upper === "BASIC") return PLAN_CONFIGS.BASIC;
  return PLAN_CONFIGS.PRO;
}

/**
 * Validates if the business plan/status permits access to a specific feature
 */
export function hasFeatureAccess(
  plan?: string | null,
  status?: string | null,
  feature?: PlanFeature
): boolean {
  if (!feature) return true;

  // Trialing, Enterprise or Pro accounts have full feature access
  const isTrial = status === "TRIALING";
  if (isTrial) return true;

  const currentPlan = (plan || "PRO").toUpperCase();
  if (currentPlan === "ENTERPRISE" || currentPlan === "PRO") return true;

  const config = getPlanConfig(currentPlan);
  return !!config.features[feature];
}

export type UserAction =
  | "MANAGE_BILLING"
  | "MANAGE_WORKERS"
  | "MANAGE_SERVICES"
  | "MANAGE_BUSINESS_SETTINGS"
  | "VIEW_ALL_CALENDARS"
  | "EXPORT_DATA"
  | "DELETE_BUSINESS";

/**
 * Checks if a specific role is authorized to perform an action
 */
export function canUserPerform(role?: string | null, action?: UserAction): boolean {
  if (!role || !action) return false;
  const r = role.toUpperCase();

  if (r === "ADMIN") return true;

  if (r === "JEFE") {
    switch (action) {
      case "MANAGE_BILLING":
      case "MANAGE_WORKERS":
      case "MANAGE_SERVICES":
      case "MANAGE_BUSINESS_SETTINGS":
      case "VIEW_ALL_CALENDARS":
      case "EXPORT_DATA":
        return true;
      case "DELETE_BUSINESS":
        return false;
      default:
        return true;
    }
  }

  if (r === "EMPLEADO") {
    switch (action) {
      case "MANAGE_BILLING":
      case "MANAGE_WORKERS":
      case "MANAGE_SERVICES":
      case "MANAGE_BUSINESS_SETTINGS":
      case "DELETE_BUSINESS":
        return false;
      case "VIEW_ALL_CALENDARS":
      case "EXPORT_DATA":
        return false;
      default:
        return true;
    }
  }

  return false;
}

/**
 * Computes checkout total breakdown considering base price, included workers, extra workers and discounts
 */
export function calculatePlanPrice(
  plan: "BASIC" | "PRO",
  totalWorkers: number = 1,
  discountPercent: number = 0
) {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.PRO;
  const basePrice = config.priceMonthly;
  const included = config.includedWorkers;
  const extraWorkers = Math.max(0, totalWorkers - included);
  const extraWorkersCost = extraWorkers * config.extraWorkerMonthlyPrice;
  const subtotal = basePrice + extraWorkersCost;
  const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  return {
    basePrice,
    includedWorkers: included,
    extraWorkers,
    extraWorkersCost,
    subtotal,
    discountAmount,
    total,
  };
}

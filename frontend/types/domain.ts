export interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  businessType?: string | null;
  subscriptionPlan: "BASIC" | "PRO" | "ENTERPRISE";
  subscriptionStatus: "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "DEMO_SANDBOX";
  trialExpiresAt?: string | null;
  sandboxExpiresAt?: string | null;
  gracePeriodExpiresAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  themeColor?: string;
  fontSizeLevel?: string;
  borderRadiusLevel?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;
}

export interface Invoice {
  id: string;
  businessId: string;
  lemonSqueezyId?: string | null;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  invoiceUrl?: string | null;
  billingReason?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "JEFE" | "EMPLEADO";
  businessId?: string | null;
}

export interface Client {
  id: string;
  name: string;
  surname?: string | null;
  email?: string | null;
  phone: string;
  lopdStatus?: string;
  frequentService?: string | null;
  lastVisit?: string | null;
  businessId: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  duration: number; // in minutes
  price: number;
  type?: "INDIVIDUAL" | "GROUP";
  capacity?: number;
  color?: string;
  isActive: boolean;
  businessId: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId?: string | null;
  serviceName?: string | null;
  appointmentDate: string | Date;
  status: "PENDING" | "SENT" | "ERROR";
  duration?: number;
}

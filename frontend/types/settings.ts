export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  ownerName?: string;
  workerPhoto?: string;
  themeColor?: string;
  fontSizeLevel?: string;
  borderRadiusLevel?: string;
  businessType?: string | null;
  enablePublicBooking?: boolean;
}

export interface UserForm {
  name: string;
  email: string;
  password: string;
}

export interface WorkerFormData {
  name: string;
  email: string;
  password: string;
  role: "JEFE" | "EMPLEADO";
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  type?: "INDIVIDUAL" | "GROUP";
  capacity?: number;
  color?: string;
}

export interface MessageTemplates {
  welcomeMessage: string;
  reminderMessage: string;
}

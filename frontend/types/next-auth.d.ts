import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      businessId?: string | null;
      subscriptionStatus?: string;
      trialExpiresAt?: string | null;
      sandboxExpiresAt?: string | null;
      businessType?: string | null;
      subscriptionPlan?: string;
      themeColor?: string;
      fontSizeLevel?: string;
      borderRadiusLevel?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    businessId?: string | null;
    subscriptionStatus?: string;
    trialExpiresAt?: string | null;
    sandboxExpiresAt?: string | null;
    businessType?: string | null;
    subscriptionPlan?: string;
    themeColor?: string;
    fontSizeLevel?: string;
    borderRadiusLevel?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    businessId?: string | null;
    subscriptionStatus?: string;
    trialExpiresAt?: string | null;
    sandboxExpiresAt?: string | null;
    businessType?: string | null;
    subscriptionPlan?: string;
    themeColor?: string;
    fontSizeLevel?: string;
    borderRadiusLevel?: string;
  }
}

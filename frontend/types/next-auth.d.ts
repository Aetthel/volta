import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      businessId?: string | null;
      themeColor?: string;
      fontSizeLevel?: string;
      borderRadiusLevel?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    businessId?: string | null;
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
    themeColor?: string;
    fontSizeLevel?: string;
    borderRadiusLevel?: string;
  }
}

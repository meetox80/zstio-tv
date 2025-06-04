import "next-auth";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      permissions?: number;
    } & DefaultSession["user"];
  }

  interface User {
    permissions?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    permissions?: number;
  }
}

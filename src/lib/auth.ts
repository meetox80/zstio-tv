import CredentialsProvider from "next-auth/providers/credentials";
import { GetUserByName, GetUserById } from "./db";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Permission } from "@/types/permissions";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const User = await GetUserByName(credentials.username);
        if (!User) return null;

        const PasswordMatch = await bcrypt.compare(
          credentials.password,
          User.password!,
        );
        if (!PasswordMatch) return null;

        let UserPermissions = User.permissions;
        if (User.name === "admin") {
          UserPermissions = 0x7fffffff; // All permissions
        }

        if (UserPermissions === 0) {
          UserPermissions = (1 << 0) | (1 << 1); // DASHBOARD_ACCESS | SLIDES_VIEW
        }

        return {
          id: User.id.toString(),
          name: User.name,
          permissions: UserPermissions,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: newSessionDataFromUpdate }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.permissions = user.permissions;
      }

      if (token.id) {
        const UserFromDb = await GetUserById(token.id as string);
        if (UserFromDb) {
          token.name = UserFromDb.name;
          token.permissions =
            UserFromDb.name === "admin"
              ? Permission.ADMINISTRATOR
              : UserFromDb.permissions;
        } else {
          return {};
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.permissions = token.permissions as number;
      }
      return session;
    },
  },
};

export async function RequireAuth() {
  const Session = await getServerSession(authOptions);

  if (!Session || !Session.user) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    authenticated: true,
    session: Session,
  };
}

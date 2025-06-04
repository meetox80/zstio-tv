import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const Handler = NextAuth(authOptions);

export { Handler as GET, Handler as POST };

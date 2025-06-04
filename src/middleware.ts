import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(Request: NextRequest) {
  const _Response = NextResponse.next();

  _Response.headers.set("X-Content-Type-Options", "nosniff");
  _Response.headers.set("X-Frame-Options", "DENY");
  _Response.headers.set("X-XSS-Protection", "1; mode=block");
  _Response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  _Response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return _Response;
}

export const config = {
  matcher: ["/api/:path*"],
};

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApi = pathname.startsWith("/api");

  if (isApiAuth) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/projects", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isApi) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron).*)"],
};

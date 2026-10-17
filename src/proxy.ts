import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const protectedRoutes = ["/dashboard", "/workspace", "/history", "/settings"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      const secret = getAuthSecret();
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      if (payload.sub && payload.email) {
        isAuthenticated = true;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("AUTH_SECRET")) {
        throw err;
      }
      isAuthenticated = false;
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is trying to access protected route and is not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated user visits login or register, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};

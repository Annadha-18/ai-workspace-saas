import { type NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, isProtectedPath } from "@/lib/auth/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (isProtectedPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const guestOnlyPaths = [
    AUTH_ROUTES.login,
    AUTH_ROUTES.signup,
    AUTH_ROUTES.forgotPassword,
  ] as const;

  if (
    guestOnlyPaths.some((path) => pathname === path) &&
    user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

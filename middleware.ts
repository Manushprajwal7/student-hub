import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = new Set([
  "/",
  "/login",
  "/register",
  "/auth/callback",
  "/resources",
  "/issues",
  "/events",
  "/announcements",
  "/jobs",
  "/study-groups",
  "/scholarships",
  "/search",
]);

// Define routes that require authentication
const protectedRoutes = new Set([
  "/resources/new",
  "/issues/new",
  "/events/new",
  "/announcements/new",
  "/jobs/new",
  "/study-groups/new",
  "/scholarships/new",
  "/profile",
  "/settings",
]);

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Get the pathname of the request
    const path = req.nextUrl.pathname;

    // Check if the route requires authentication
    const isProtectedRoute =
      protectedRoutes.has(path) ||
      protectedRoutes.has(path.replace(/\/+$/, "")) || // Handle trailing slashes
      /^\/(?:resources|issues|events|announcements|jobs|study-groups|scholarships)\/[^/]+(?:\/edit)?$/.test(
        path
      );

    // If the route is protected and there's no session, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For login/register pages, redirect to home if already authenticated
    if (session && (path === "/login" || path === "/register")) {
      // Get the redirectedFrom parameter or default to home
      const redirectedFrom =
        req.nextUrl.searchParams.get("redirectedFrom") || "/";
      // Make sure we're not redirecting to login/register again
      const redirectTo =
        redirectedFrom === "/login" || redirectedFrom === "/register"
          ? "/"
          : redirectedFrom;
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // Return the response with the refreshed session
    return res;
  } catch (e) {
    // If there's an error, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

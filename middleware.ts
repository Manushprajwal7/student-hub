import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
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
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname of the request
  const pathname = req.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/auth/")
  );

  // Check if this is a protected route
  const isProtectedRoute =
    pathname.includes("/new") ||
    pathname.includes("/edit") ||
    pathname === "/profile" ||
    pathname === "/settings";

  // Allow access to public routes regardless of authentication
  if (isPublicRoute && !isProtectedRoute) {
    return res;
  }

  // If the route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Update matcher to exclude static files and api routes
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

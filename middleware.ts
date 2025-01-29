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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.has(path) || path.startsWith("/auth/");

  // Allow access to public routes or if we're in development
  if (isPublicRoute || process.env.NODE_ENV === "development") {
    return res;
  }

  // Check if we're trying to access a protected route without a session
  if (!session) {
    // Save the original pathname to redirect back after login
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Update matcher configuration
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

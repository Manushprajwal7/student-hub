import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/resources/new",
  "/issues/new",
  "/events/new",
  "/announcements/new",
  "/jobs/new",
  "/study-groups/new",
  "/scholarships/new",
  "/profile",
  "/settings",
];

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if exists
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    const pathname = req.nextUrl.pathname;

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      if (!session) {
        // Redirect to login if there's no session
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("redirectedFrom", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Verify token expiration
      const tokenExpiration = session.expires_at;
      const now = Math.floor(Date.now() / 1000);

      if (tokenExpiration && tokenExpiration < now) {
        // Token is expired, try to refresh
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession) {
          // If refresh fails, redirect to login
          const redirectUrl = new URL("/login", req.url);
          redirectUrl.searchParams.set("redirectedFrom", pathname);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    return res;
  } catch (error) {
    // If there's an error, redirect to login
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

// Update matcher to only run middleware on protected routes
export const config = {
  matcher: [
    "/resources/new",
    "/issues/new",
    "/events/new",
    "/announcements/new",
    "/jobs/new",
    "/study-groups/new",
    "/scholarships/new",
    "/profile",
    "/settings",
    "/login",
  ],
};

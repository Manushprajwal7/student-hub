import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const isAuthPage = req.nextUrl.pathname === "/login";

    // Redirect to home if accessing login page while authenticated
    if (isAuthPage && session) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow access to login page and auth callback
    if (isAuthPage || req.nextUrl.pathname.startsWith("/auth/")) {
      return res;
    }

    // Redirect to login if accessing protected route without session
    if (!session) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error("Error in middleware:", error);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

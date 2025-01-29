import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // Make this route dynamic

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Authentication failed`
        );
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      `${new URL(request.url).origin}/login?error=Authentication failed`
    );
  }
}

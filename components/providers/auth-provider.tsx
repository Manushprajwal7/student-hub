"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? JSON.parse(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  : [];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    session: null as Session | null,
    isLoading: true,
    isAdmin: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isAdmin = session?.user?.email
        ? ADMIN_EMAILS.includes(session.user.email)
        : false;

      setState((current) => ({
        ...current,
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAdmin,
      }));
    });

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAdmin = session?.user?.email
        ? ADMIN_EMAILS.includes(session.user.email)
        : false;

      setState((current) => ({
        ...current,
        session,
        user: session?.user ?? null,
        isAdmin,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    ...state,

    signUp: async (email: string, password: string, fullName: string) => {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          // Create or update profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              user_id: authData.user.id,
              full_name: fullName,
              avatar_url: null,
              updated_at: new Date().toISOString(),
            });

          if (profileError) throw profileError;
        }

        router.push("/login?message=Check your email to confirm your account");
      } catch (error) {
        console.error("Sign-up Error:", error);
        throw error;
      }
    },

    signIn: async (email: string, password: string) => {
      try {
        // Attempt to sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);

        // Get redirect URL from query parameters or default to "/"
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get("redirectedFrom") || "/";

        // Ensure we have a fresh session before redirecting
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        if (session) {
          router.push(redirectTo);
        }
      } catch (err) {
        console.error("Sign-in Error:", err);
        throw err;
      }
    },

    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push("/login");
      } catch (error) {
        console.error("Sign-out Error:", error);
        throw error;
      }
    },
  };

  // Show a loading screen on protected routes while checking authentication state
  if (
    state.isLoading &&
    !pathname?.startsWith("/login") &&
    !pathname?.startsWith("/register")
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";

// Get admin emails from environment variable
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
  const supabase = createClientComponentClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initial session fetch
        let {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Check token expiration
          const tokenExpiration = session.expires_at;
          const now = Math.floor(Date.now() / 1000);

          if (tokenExpiration && tokenExpiration < now) {
            // Token is expired, try to refresh
            const {
              data: { session: newSession },
              error: refreshError,
            } = await supabase.auth.refreshSession();

            if (refreshError || !newSession) {
              // If refresh fails, sign out
              await supabase.auth.signOut();
              setState({
                user: null,
                session: null,
                isLoading: false,
                isAdmin: false,
              });
              return;
            }

            // Use refreshed session
            session = newSession;
          }
        }

        const isAdmin = session?.user?.email
          ? ADMIN_EMAILS.includes(session.user.email)
          : false;
        setState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isAdmin,
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isAdmin = session?.user?.email
        ? ADMIN_EMAILS.includes(session.user.email)
        : false;
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAdmin,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    ...state,
    signUp: async (email: string, password: string, fullName: string) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create or update profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: authData.user.id,
          full_name: fullName,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;
      }

      router.push("/login?message=Check your email to confirm your account");
    },
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Get the redirect URL from query parameters or use default
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirectedFrom") || "/";

        if (data.session) {
          // Force a router refresh to update the session state
          router.refresh();
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        setState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
        });

        router.refresh();
        router.push("/login");
      } catch (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

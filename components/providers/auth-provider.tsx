"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { AdminConfig } from "@/types/admin"

// Get admin emails from environment variable
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS ? JSON.parse(process.env.NEXT_PUBLIC_ADMIN_EMAILS) : []

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    session: null as Session | null,
    isLoading: true,
    isAdmin: false,
  })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false

      setState((current) => ({
        ...current,
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAdmin,
      }))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false

      setState((current) => ({
        ...current,
        session,
        user: session?.user ?? null,
        isAdmin,
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    ...state,
    signUp: async (email: string, password: string, fullName: string) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create or update profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: authData.user.id,
          full_name: fullName,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })

        if (profileError) throw profileError
      }

      router.push("/login?message=Check your email to confirm your account")
    },
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Get the redirect URL from query parameters or use default
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get("redirectedFrom") || "/"
      router.push(redirectTo)
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
    },
  }

  // Show loading state only on protected routes
  if (state.isLoading && !pathname?.startsWith("/login") && !pathname?.startsWith("/register")) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


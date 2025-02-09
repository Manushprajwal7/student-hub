import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Debug helper
export const debugAuth = async (email: string, password: string) => {
  console.log("Attempting auth with:", { email });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("Auth response:", { data, error });
    return { data, error };
  } catch (err) {
    console.error("Auth error:", err);
    throw err;
  }
};

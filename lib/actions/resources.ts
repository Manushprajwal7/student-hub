import { supabase } from "@/lib/supabase"
import type { Resource, ResourceWithUser } from "@/types/resources"

export async function getResources() {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data as ResourceWithUser[]
  } catch (error) {
    console.error("Error fetching resources:", error)
    throw error
  }
}

export async function createResource(data: Resource, userId: string) {
  try {
    const { error } = await supabase.from("resources").insert({
      ...data,
      user_id: userId,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error creating resource:", error)
    throw error
  }
}


import { supabase } from "@/lib/supabase"

export interface SearchResult {
  id: string
  title: string
  type: "resource" | "event" | "issue" | "announcement" | "job" | "scholarship" | "study-group"
  created_at: string
  url: string
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  try {
    const searchPromises = [
      // Search resources
      supabase
        .from("resources")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "resource" as const,
              created_at: item.created_at,
              url: `/resources/${item.id}`,
            })) || [],
        ),

      // Search events
      supabase
        .from("events")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "event" as const,
              created_at: item.created_at,
              url: `/events/${item.id}`,
            })) || [],
        ),

      // Search issues
      supabase
        .from("issues")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "issue" as const,
              created_at: item.created_at,
              url: `/issues/${item.id}`,
            })) || [],
        ),

      // Search announcements
      supabase
        .from("announcements")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "announcement" as const,
              created_at: item.created_at,
              url: `/announcements/${item.id}`,
            })) || [],
        ),

      // Search jobs
      supabase
        .from("jobs")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "job" as const,
              created_at: item.created_at,
              url: `/jobs/${item.id}`,
            })) || [],
        ),

      // Search scholarships
      supabase
        .from("scholarships")
        .select("id, title, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.title,
              type: "scholarship" as const,
              created_at: item.created_at,
              url: `/scholarships/${item.id}`,
            })) || [],
        ),

      // Search study groups
      supabase
        .from("study_groups")
        .select("id, name, created_at")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3)
        .then(
          ({ data }) =>
            data?.map((item) => ({
              id: item.id,
              title: item.name,
              type: "study-group" as const,
              created_at: item.created_at,
              url: `/study-groups/${item.id}`,
            })) || [],
        ),
    ]

    const results = await Promise.all(searchPromises)
    return results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (error) {
    console.error("Error searching content:", error)
    return []
  }
}


"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { ResourceCard } from "@/components/resources/resource-card"
import { IssueCard } from "@/components/issues/issue-card"
import { EventCard } from "@/components/events/event-card"
import { JobCard } from "@/components/jobs/job-card"
import { StudyGroupCard } from "@/components/study-groups/study-group-card"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { supabase } from "@/lib/supabase"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const search = async () => {
      if (!query) return

      setIsLoading(true)
      try {
        const promises = [
          // Search issues
          supabase
            .from("issues")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "issue" })) || []),

          // Search events
          supabase
            .from("events")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "event" })) || []),

          // Search announcements
          supabase
            .from("announcements")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "announcement" })) || []),

          // Search resources
          supabase
            .from("resources")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "resource" })) || []),

          // Search jobs
          supabase
            .from("jobs")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "job" })) || []),

          // Search study groups
          supabase
            .from("study_groups")
            .select("*, user:profiles(full_name, avatar_url)")
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .then(({ data }) => data?.map((item) => ({ ...item, type: "study_group" })) || []),
        ]

        const results = await Promise.all(promises)
        setResults(results.flat())
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [query])

  const renderResult = (result: any) => {
    const commonProps = {
      key: result.id,
    }

    switch (result.type) {
      case "issue":
        return <IssueCard issue={result} {...commonProps} />
      case "event":
        return <EventCard event={result} {...commonProps} />
      case "announcement":
        return <AnnouncementCard announcement={result} {...commonProps} />
      case "resource":
        return <ResourceCard resource={result} {...commonProps} />
      case "job":
        return <JobCard job={result} {...commonProps} />
      case "study_group":
        return <StudyGroupCard group={result} {...commonProps} />
      default:
        return null
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Search Results for "{query}"</h1>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No results found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{results.map(renderResult)}</div>
        )}
      </div>
    </PageTransition>
  )
}


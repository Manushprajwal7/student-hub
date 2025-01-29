"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { EventCard } from "@/components/events/event-card"
import { CreateEventDialog } from "@/components/events/create-event-dialog" // Updated import location if necessary
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import type { EventType, EventWithUser } from "@/types/events"

const eventTypes: EventType[] = ["Cultural Event", "Technical", "Out Reach Activity", "Rally Event", "Awareness Event"]

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<EventType | "All">("All")
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // First, get the events
      let query = supabase.from("events").select("*").order("date", { ascending: true })

      if (selectedType !== "All") {
        query = query.eq("type", selectedType)
      }

      const { data: eventsData, error: eventsError } = await query

      if (eventsError) throw eventsError

      // If we have events, get the user data for each one
      if (eventsData && eventsData.length > 0) {
        const userIds = [...new Set(eventsData.map((e) => e.user_id))]

        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds)

        if (usersError) throw usersError

        // Create a map of user data
        const userMap = (usersData || []).reduce(
          (acc, user) => {
            acc[user.user_id] = user
            return acc
          },
          {} as Record<string, any>,
        )

        // Combine event data with user data
        const transformedData = eventsData.map((event) => ({
          ...event,
          user: userMap[event.user_id] || {
            full_name: "Anonymous",
            avatar_url: null,
          },
        }))

        setEvents(transformedData)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    loadEvents()
  }, [selectedType])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Events</h1>
          <CreateEventDialog onSuccess={loadEvents} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={selectedType === "All" ? "secondary" : "outline"} onClick={() => setSelectedType("All")}>
            All
          </Button>
          {eventTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "secondary" : "outline"}
              onClick={() => setSelectedType(type)}
              className={cn(
                type === "Cultural Event" && "text-purple-500",
                type === "Technical" && "text-blue-500",
                type === "Out Reach Activity" && "text-green-500",
                type === "Rally Event" && "text-orange-500",
                type === "Awareness Event" && "text-red-500",
              )}
            >
              {type}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={currentUserId} onRegister={loadEvents} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


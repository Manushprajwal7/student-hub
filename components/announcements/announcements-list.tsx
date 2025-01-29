"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AnnouncementsListProps {
  announcements: any[]
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)

  const filteredAnnouncements = selectedPriority
    ? announcements.filter((announcement) => announcement.priority === selectedPriority)
    : announcements

  const priorities = ["Low", "Medium", "High", "Urgent"]

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Badge
          variant={selectedPriority === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedPriority(null)}
        >
          All
        </Badge>
        {priorities.map((priority) => (
          <Badge
            key={priority}
            variant={selectedPriority === priority ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedPriority(priority)}
          >
            {priority}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(announcement.created_at)}</p>
                </div>
                <Badge>{announcement.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{announcement.content}</p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={announcement.profiles?.avatar_url} />
                  <AvatarFallback>{announcement.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {announcement.profiles?.full_name || "Unknown User"}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


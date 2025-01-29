"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CreateAnnouncementDialog({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Button asChild>
      <Link href="/announcements/new">
        <Plus className="mr-2 h-4 w-4" />
        New Announcement
      </Link>
    </Button>
  )
}


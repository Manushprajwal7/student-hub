"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PostJobDialog({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Button asChild>
      <Link href="/jobs/new">
        <Plus className="mr-2 h-4 w-4" />
        Post Job
      </Link>
    </Button>
  )
}


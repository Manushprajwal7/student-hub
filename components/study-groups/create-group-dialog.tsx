"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CreateGroupDialog({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Button asChild>
      <Link href="/study-groups/new">
        <Plus className="mr-2 h-4 w-4" />
        Create Group
      </Link>
    </Button>
  )
}


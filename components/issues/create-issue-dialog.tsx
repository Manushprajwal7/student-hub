"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

export function CreateIssueDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button asChild className="bg-[#0066FF]">
          <Link href="/issues/new">
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Link>
        </Button>
      </DialogTrigger>
    </Dialog>
  )
}


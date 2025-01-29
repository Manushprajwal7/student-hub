"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  // Dialog,
  // DialogContent,
  // DialogDescription,
  // DialogHeader,
  // DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import type { EventType } from "@/types/events"

const eventTypes: EventType[] = ["Cultural Event", "Technical", "Out Reach Activity", "Rally Event", "Awareness Event"]

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  location: z.string().min(1, "Location is required"),
  registration_link: z.string().url("Please enter a valid registration link"),
  type: z.enum(["Cultural Event", "Technical", "Out Reach Activity", "Rally Event", "Awareness Event"]),
})

type FormValues = z.infer<typeof formSchema>

interface CreateEventDialogProps {
  onSuccess: () => void
}

export function CreateEventDialog({ onSuccess }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      registration_link: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setOpen(false)
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to create events.",
        })
        router.push("/login")
        return
      }

      const { error: eventError } = await supabase.from("events").insert({
        title: data.title,
        description: data.description,
        date: data.date.toISOString(),
        location: data.location,
        registration_link: data.registration_link,
        type: data.type,
        user_id: session.user.id,
      })

      if (eventError) throw eventError

      toast({
        title: "Success",
        description: "Event created successfully!",
      })
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
      })
    }
  }

  return (
    <Button onClick={() => router.push("/events/new")}>
      <Plus className="mr-2 h-4 w-4" />
      Create Event
    </Button>
  )
}


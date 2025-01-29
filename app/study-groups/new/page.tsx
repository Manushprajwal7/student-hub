"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Subject } from "@/types/study-groups"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"

const subjects: Subject[] = [
  "Computer Science",
  "Electronics",
  "Bio Technology",
  "Mechanical",
  "Mechanotronics",
  "Civil",
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.enum(["Computer Science", "Electronics", "Bio Technology", "Mechanical", "Mechanotronics", "Civil"], {
    required_error: "Please select a subject",
  }),
  day: z.string().min(1, "Day is required"),
  location: z.string().min(1, "Location is required"),
  whatsapp_link: z.string().url("Please enter a valid WhatsApp group link"),
})

type FormValues = z.infer<typeof formSchema>

export default function NewStudyGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "Computer Science",
      day: "",
      location: "",
      whatsapp_link: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to create study groups.",
        })
        router.push("/login")
        return
      }

      const { error } = await supabase.from("study_groups").insert({
        ...data,
        user_id: session.user.id,
        members: [session.user.id],
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Study group created successfully!",
      })
      router.push("/study-groups")
    } catch (error) {
      console.error("Error creating study group:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create study group. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Create New Study Group"
          description="Start a new study group to collaborate with your peers."
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter group description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Day & Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Every Tuesday at 4 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Library Room 204" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Group Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WhatsApp group link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Group
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  )
}


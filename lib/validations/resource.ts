import * as z from "zod"

export const ResourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Please enter a valid URL"),
  category: z.enum(["Academic", "Career", "Technology", "Health", "Sports", "Arts", "Other"], {
    required_error: "Please select a category",
  }),
})

export type ResourceFormValues = z.infer<typeof ResourceFormSchema>


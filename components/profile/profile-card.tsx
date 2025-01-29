"use client"

import { useEffect, useState } from "react"
import { CameraIcon, Loader2, PencilIcon } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/profile"
import { EditProfileForm } from "./edit-profile-form"

export function ProfileCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user?.id) return

        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
        })
        return
      }

      if (!user?.id) throw new Error("No user found")

      setIsUploading(true)
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`

      // First, try to delete any existing avatar
      try {
        const { data: existingFiles } = await supabase.storage.from("avatars").list(`${user.id}`)

        if (existingFiles?.length) {
          await Promise.all(
            existingFiles.map((file) => supabase.storage.from("avatars").remove([`${user.id}/${file.name}`])),
          )
        }
      } catch (error) {
        console.error("Error deleting existing avatar:", error)
      }

      // Upload new avatar
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/${fileName}`, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/${fileName}`)

      if (!publicUrlData.publicUrl) throw new Error("Failed to get public URL")

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Update local state
      setProfile((prev) => ({
        ...prev!,
        avatar_url: publicUrlData.publicUrl,
      }))

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
      })
    } finally {
      setIsUploading(false)
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleProfileUpdate = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user?.id).single()

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh profile data.",
      })
      return
    }

    setProfile(data)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "ST"

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile?.avatar_url || "/placeholder.svg"}
                  alt={profile?.full_name || user?.email || "User"}
                />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  aria-label="Upload profile picture"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full cursor-pointer"
                    disabled={isUploading}
                    aria-label="Change profile picture"
                    type="button"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CameraIcon className="h-4 w-4" />}
                    <span className="sr-only">Change profile picture</span>
                  </Button>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{profile?.full_name || "Add your name"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{profile?.full_name || "Not set"}</p>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowEditForm(true)}>
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit name</span>
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Member since</label>
              <p className="text-sm text-muted-foreground">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditProfileForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={handleProfileUpdate}
        defaultValues={{
          full_name: profile?.full_name || "",
        }}
      />
    </>
  )
}


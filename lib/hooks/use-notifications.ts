import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"

export interface Notification {
  id: string
  title: string
  content: string
  type: string
  read: boolean
  created_at: string
  related_id?: string
  related_type?: string
  action_url?: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        // Get unread count
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("read", false)

        setUnreadCount(count || 0)

        // Get recent notifications
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (data) {
          setNotifications(data)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            setUnreadCount((prev) => prev + 1)
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n)))
            // Refresh unread count
            const { count } = await supabase
              .from("notifications")
              .select("*", { count: "exact" })
              .eq("user_id", user.id)
              .eq("read", false)
            setUnreadCount(count || 0)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error marking notification as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    if (!user) return

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}


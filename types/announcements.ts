export type AnnouncementPriority = 'High' | 'Medium' | 'Low'

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: AnnouncementPriority
  created_at: string
  user_id: string
}

export interface AnnouncementWithUser extends Announcement {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


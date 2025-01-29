export type Subject = 'Computer Science' | 'Electronics' | 'Bio Technology' | 'Mechanical' | 'Mechanotronics' | 'Civil'

export interface StudyGroup {
  id: string
  name: string
  description: string
  subject: Subject
  day: string
  location: string
  whatsapp_link: string
  created_at: string
  user_id: string
  members: string[]
}

export interface StudyGroupWithUser extends StudyGroup {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


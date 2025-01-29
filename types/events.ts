export type EventType = 'Cultural Event' | 'Technical' | 'Out Reach Activity' | 'Rally Event' | 'Awareness Event'

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  registration_link: string
  type: EventType
  created_at: string
  user_id: string
  registrations: string[]
}

export interface EventWithUser extends Event {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


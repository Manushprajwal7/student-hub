export type ScholarshipCategory = 'Male' | 'Female' | 'State Level' | 'National Level'

export interface Scholarship {
  id: string
  title: string
  description: string
  eligibility: string
  deadline: string
  category: ScholarshipCategory
  tags: string[]
  provider: string
  application_link: string
  created_at: string
  user_id: string
  reports: string[]
}

export interface ScholarshipWithUser extends Scholarship {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


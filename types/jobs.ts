export type JobType = 'Full Time' | 'Part Time' | 'Internship'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'KRW'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary: number
  currency: Currency
  application_link: string
  type: JobType
  deadline: string
  created_at: string
  user_id: string
}

export interface JobWithUser extends Job {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


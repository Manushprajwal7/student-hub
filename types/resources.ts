export type Department = 'CSE' | 'ISE' | 'AIML' | 'BT' | 'EEE' | 'ECE' | 'MT' | 'ME'
export type Semester = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th'
export type ResourceType = 'Notes' | 'Textbooks' | 'Practice Tests' | 'Study Guides'

export interface Resource {
  id: string
  title: string
  description: string | null
  url: string
  department: Department
  semester: Semester
  type: ResourceType
  tags: string[] | null
  user_id: string
  created_at: string
}

export interface ResourceWithUser extends Resource {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}


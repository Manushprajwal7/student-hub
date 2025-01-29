export type Department = 'CSE' | 'ISE' | 'AIML' | 'ECE' | 'EEE' | 'BT' | 'MT' | 'ME'
export type Semester = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th'
export type ResourceType = 'Notes' | 'Textbooks' | 'Practice Tests' | 'Study Guides'

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  department: Department
  semester: Semester
  subject: string
  created_at: string
  user_id: string
  user_email?: string
}

export type ResourceFormData = {
  title: string
  description: string
  url: string
  department: Department
  semester: Semester
  type: ResourceType
  tags: string
}


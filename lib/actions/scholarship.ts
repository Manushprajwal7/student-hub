import { supabase } from '@/lib/supabase'

export interface Scholarship {
  id: string
  title: string
  description: string
  amount: number
  deadline: string
  requirements: string
  created_at: string
  user_id: string
}

export async function getScholarships() {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch scholarships')
  }

  return data as Scholarship[]
}

export async function getUserScholarships(userId: string) {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch user scholarships')
  }

  return data as Scholarship[]
}

export async function deleteScholarship(id: string) {
  const { error } = await supabase
    .from('scholarships')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete scholarship')
  }
}


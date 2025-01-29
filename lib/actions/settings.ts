'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export async function updateSettings(userId: string, settings: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString(),
        ...settings
      })
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}


'use client'

import { useEffect, useState } from 'react'
import { PageTransition } from '@/components/page-transition'
import { ProfileCard } from '@/components/profile/profile-card'
import { ProfileStats } from '@/components/profile/profile-stats'
import { SharedContent } from '@/components/profile/shared-content'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getUserId()
  }, [])

  return (
    <PageTransition>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileCard />
          <ProfileStats />
        </div>
        {userId && (
          <SharedContent userId={userId} />
        )}
      </div>
    </PageTransition>
  )
}


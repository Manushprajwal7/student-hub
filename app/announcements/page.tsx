'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageTransition } from '@/components/page-transition'
import { AnnouncementCard } from '@/components/announcements/announcement-card'
import { CreateAnnouncementDialog } from '@/components/announcements/create-announcement-dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { AnnouncementPriority, AnnouncementWithUser } from '@/types/announcements'

const priorities: AnnouncementPriority[] = ['High', 'Medium', 'Low']

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPriority, setSelectedPriority] = useState<AnnouncementPriority | 'All'>('All')
  const [error, setError] = useState<string | null>(null)

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First get the announcements
      let query = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedPriority !== 'All') {
        query = query.eq('priority', selectedPriority)
      }

      const { data: announcementsData, error: announcementsError } = await query

      if (announcementsError) throw announcementsError

      // If we have announcements, get the user data
      if (announcementsData && announcementsData.length > 0) {
        const userIds = [...new Set(announcementsData.map(a => a.user_id))]
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds)

        if (usersError) throw usersError

        // Create a map of user data
        const userMap = (usersData || []).reduce((acc, user) => {
          acc[user.user_id] = user
          return acc
        }, {} as Record<string, any>)

        // Combine announcement data with user data
        const transformedData = announcementsData.map(announcement => ({
          ...announcement,
          user: userMap[announcement.user_id] || {
            full_name: 'Anonymous',
            avatar_url: null
          }
        }))

        setAnnouncements(transformedData)
      } else {
        setAnnouncements([])
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
      setError('Failed to load announcements. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [selectedPriority])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <CreateAnnouncementDialog onSuccess={loadAnnouncements} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedPriority === 'All' ? 'secondary' : 'outline'}
            onClick={() => setSelectedPriority('All')}
          >
            All
          </Button>
          {priorities.map((priority) => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? 'secondary' : 'outline'}
              onClick={() => setSelectedPriority(priority)}
            >
              {priority}
            </Button>
          ))}
        </div>

        {error ? (
          <div className="flex items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No announcements found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


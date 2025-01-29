'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Calendar, LifeBuoy, Megaphone, Users2, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'
import { supabase } from '@/lib/supabase'

interface Stats {
  issues: number
  events: number
  announcements: number
  resources: number
  jobs: number
  studyGroups: number
}

export function ProfileStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    issues: 0,
    events: 0,
    announcements: 0,
    resources: 0,
    jobs: 0,
    studyGroups: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        const [
          { count: issuesCount },
          { count: eventsCount },
          { count: announcementsCount },
          { count: resourcesCount },
          { count: jobsCount },
          { count: studyGroupsCount },
        ] = await Promise.all([
          supabase
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('announcements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('resources')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('study_groups')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ])

        setStats({
          issues: issuesCount || 0,
          events: eventsCount || 0,
          announcements: announcementsCount || 0,
          resources: resourcesCount || 0,
          jobs: jobsCount || 0,
          studyGroups: studyGroupsCount || 0,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [user])

  const statItems = [
    {
      id: 'issues',
      label: 'Issues Raised',
      value: stats.issues,
      icon: LifeBuoy,
    },
    {
      id: 'events',
      label: 'Events Created',
      value: stats.events,
      icon: Calendar,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      value: stats.announcements,
      icon: Megaphone,
    },
    {
      id: 'resources',
      label: 'Resources Shared',
      value: stats.resources,
      icon: BookOpen,
    },
    {
      id: 'jobs',
      label: 'Jobs Listed',
      value: stats.jobs,
      icon: GraduationCap,
    },
    {
      id: 'study-groups',
      label: 'Study Groups',
      value: stats.studyGroups,
      icon: Users2,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {statItems.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4"
            >
              <stat.icon className="h-6 w-6 text-muted-foreground" />
              <h4 className="text-xl font-semibold">{stat.value}</h4>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


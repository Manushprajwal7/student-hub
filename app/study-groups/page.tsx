'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageTransition } from '@/components/page-transition'
import { StudyGroupCard } from '@/components/study-groups/study-group-card'
import { CreateGroupDialog } from '@/components/study-groups/create-group-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Subject, StudyGroupWithUser } from '@/types/study-groups'

const subjects: Subject[] = [
  'Computer Science',
  'Electronics',
  'Bio Technology',
  'Mechanical',
  'Mechanotronics',
  'Civil',
]

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroupWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      // First, get the groups
      let query = supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedSubject !== 'All') {
        query = query.eq('subject', selectedSubject)
      }

      const { data: groupsData, error: groupsError } = await query

      if (groupsError) throw groupsError

      // If we have groups, get the user data for each one
      if (groupsData && groupsData.length > 0) {
        const userIds = [...new Set(groupsData.map(g => g.user_id))]
        
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

        // Combine group data with user data
        const transformedData = groupsData.map(group => ({
          ...group,
          user: userMap[group.user_id] || {
            full_name: 'Anonymous',
            avatar_url: null
          }
        }))

        setGroups(transformedData)
      } else {
        setGroups([])
      }
    } catch (error) {
      console.error('Error loading study groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    loadGroups()
  }, [selectedSubject])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <CreateGroupDialog onSuccess={loadGroups} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedSubject === 'All' ? 'secondary' : 'outline'}
            onClick={() => setSelectedSubject('All')}
          >
            All
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? 'secondary' : 'outline'}
              onClick={() => setSelectedSubject(subject)}
              className={cn(
                subject === 'Computer Science' && 'text-blue-500',
                subject === 'Electronics' && 'text-green-500',
                subject === 'Bio Technology' && 'text-purple-500',
                subject === 'Mechanical' && 'text-orange-500',
                subject === 'Mechanotronics' && 'text-red-500',
                subject === 'Civil' && 'text-yellow-500'
              )}
            >
              {subject}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No study groups found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <StudyGroupCard
                key={group.id}
                group={group}
                currentUserId={currentUserId}
                onJoinLeave={loadGroups}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


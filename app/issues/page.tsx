'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageTransition } from '@/components/page-transition'
import { IssueCard } from '@/components/issues/issue-card'
import { CreateIssueDialog } from '@/components/issues/create-issue-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { IssueCategory, IssueWithUser } from '@/types/issues'

const categories: IssueCategory[] = [
  'Teaching',
  'Women Rights',
  'Ragging',
  'Cultural Events',
  'Campus',
  'Sports',
  'Fest',
  'Infrastructure',
  'Academics',
  'Student Services',
  'Extracurricular Activities',
]

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  const loadIssues = async () => {
    try {
      setIsLoading(true)
      // First, get the issues
      let query = supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }

      const { data: issuesData, error: issuesError } = await query

      if (issuesError) throw issuesError

      // If we have issues, get the user data for each one
      if (issuesData && issuesData.length > 0) {
        const userIds = [...new Set(issuesData.map(i => i.user_id))]
        
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

        // Combine issue data with user data
        const transformedData = issuesData.map(issue => ({
          ...issue,
          user: userMap[issue.user_id] || {
            full_name: 'Anonymous',
            avatar_url: null
          }
        }))

        setIssues(transformedData)
      } else {
        setIssues([])
      }
    } catch (error) {
      console.error('Error loading issues:', error)
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
    loadIssues()
  }, [selectedCategory])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Community Issues</h1>
          <CreateIssueDialog onSuccess={loadIssues} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'All' ? 'secondary' : 'outline'}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'secondary' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                category === 'Teaching' && 'text-blue-500',
                category === 'Women Rights' && 'text-purple-500',
                category === 'Ragging' && 'text-red-500',
                category === 'Cultural Events' && 'text-pink-500',
                category === 'Campus' && 'text-green-500',
                category === 'Sports' && 'text-orange-500',
                category === 'Fest' && 'text-yellow-500',
                category === 'Infrastructure' && 'text-gray-500',
                category === 'Academics' && 'text-indigo-500',
                category === 'Student Services' && 'text-teal-500',
                category === 'Extracurricular Activities' && 'text-cyan-500'
              )}
            >
              {category}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : issues.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No issues found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                currentUserId={currentUserId}
                onVote={loadIssues}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


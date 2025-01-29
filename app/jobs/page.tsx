'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { PageTransition } from '@/components/page-transition'
import { JobCard } from '@/components/jobs/job-card'
import { PostJobDialog } from '@/components/jobs/post-job-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { JobType, JobWithUser } from '@/types/jobs'

const jobTypes: JobType[] = ['Full Time', 'Part Time', 'Internship']

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<JobType | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      // First, get the jobs
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedType !== 'All') {
        query = query.eq('type', selectedType)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
      }

      const { data: jobsData, error: jobsError } = await query

      if (jobsError) throw jobsError

      // If we have jobs, get the user data for each one
      if (jobsData && jobsData.length > 0) {
        const userIds = [...new Set(jobsData.map(j => j.user_id))]
        
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

        // Combine job data with user data
        const transformedData = jobsData.map(job => ({
          ...job,
          user: userMap[job.user_id] || {
            full_name: 'Anonymous',
            avatar_url: null
          }
        }))

        setJobs(transformedData)
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [selectedType, searchQuery])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Jobs</h1>
          <PostJobDialog onSuccess={loadJobs} />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedType === 'All' ? 'secondary' : 'outline'}
              onClick={() => setSelectedType('All')}
            >
              All
            </Button>
            {jobTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'secondary' : 'outline'}
                onClick={() => setSelectedType(type)}
                className={cn(
                  type === 'Full Time' && 'text-blue-500',
                  type === 'Part Time' && 'text-green-500',
                  type === 'Internship' && 'text-orange-500'
                )}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No jobs found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


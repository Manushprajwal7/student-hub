'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResourceCard } from '@/components/resources/resource-card'
import { PageHeader } from '@/components/page-header'
import { PageTransition } from '@/components/page-transition'
import { supabase } from '@/lib/supabase'
import type { Department, ResourceType, ResourceWithUser, Semester } from '@/types/resources'

const resourceTypes: ResourceType[] = ['Notes', 'Textbooks', 'Practice Tests', 'Study Guides']
const departments: Department[] = ['CSE', 'ISE', 'AIML', 'BT', 'EEE', 'ECE', 'MT', 'ME']
const semesters: Semester[] = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all')
  const [selectedSemester, setSelectedSemester] = useState<Semester | 'all'>('all')

  const loadResources = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First get the resources
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType)
      }
      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment)
      }
      if (selectedSemester !== 'all') {
        query = query.eq('semester', selectedSemester)
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data: resourcesData, error: resourcesError } = await query

      if (resourcesError) throw resourcesError

      // If we have resources, get the user data
      if (resourcesData && resourcesData.length > 0) {
        const userIds = [...new Set(resourcesData.map(r => r.user_id))]
        
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

        // Combine resource data with user data
        const transformedData = resourcesData.map(resource => ({
          ...resource,
          user: userMap[resource.user_id] || {
            full_name: 'Anonymous',
            avatar_url: null
          }
        }))

        setResources(transformedData)
      } else {
        setResources([])
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      setError('Failed to load resources. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [selectedType, selectedDepartment, selectedSemester, search])

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Resources"
          description="Browse and share educational resources with your peers."
          action={
            <Button asChild>
              <Link href="/resources/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ResourceType | 'all')}>
              <SelectTrigger className="md:max-w-xs">
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {resourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}
            >
              <SelectTrigger className="md:max-w-xs">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value as Semester | 'all')}>
              <SelectTrigger className="md:max-w-xs">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="flex items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[200px] rounded-lg border bg-muted/50 p-4" />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border bg-muted/50 p-8 text-center">
              <p className="text-lg font-medium">No resources found</p>
              <p className="text-sm text-muted-foreground">
                {search || selectedType !== 'all' || selectedDepartment !== 'all' || selectedSemester !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Be the first to share a resource!'}
              </p>
              <Button asChild>
                <Link href="/resources/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}


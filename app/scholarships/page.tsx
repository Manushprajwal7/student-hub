'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import { PageTransition } from '@/components/page-transition'
import { ScholarshipCard } from '@/components/scholarships/scholarship-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { ScholarshipCategory, ScholarshipWithUser } from '@/types/scholarships'

const categories: ScholarshipCategory[] = [
  'Male',
  'Female',
  'State Level',
  'National Level',
]

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<ScholarshipWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ScholarshipCategory | 'All'>('All')

  const loadScholarships = async () => {
    try {
      setIsLoading(true)
      let query = supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }

      const { data: scholarshipsData, error: scholarshipsError } = await query

      if (scholarshipsError) throw scholarshipsError

      // If we have scholarships, get the user data
      if (scholarshipsData && scholarshipsData.length > 0) {
        const userIds = [...new Set(scholarshipsData.map(s => s.user_id))]
        
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

        // Combine scholarship data with user data
        const transformedData = scholarshipsData.map(scholarship => ({
          ...scholarship,
          user: userMap[scholarship.user_id] || null
        }))

        setScholarships(transformedData)
      } else {
        setScholarships([])
      }
    } catch (error) {
      console.error('Error loading scholarships:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadScholarships()
  }, [selectedCategory])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">Scholarships</h1>
          <Button asChild className="bg-[#28A745] hover:bg-[#218838]">
            <Link href="/scholarships/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Scholarship
            </Link>
          </Button>
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
                category === 'Male' && 'text-blue-500',
                category === 'Female' && 'text-pink-500',
                category === 'State Level' && 'text-green-500',
                category === 'National Level' && 'text-purple-500'
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
        ) : scholarships.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No scholarships found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}


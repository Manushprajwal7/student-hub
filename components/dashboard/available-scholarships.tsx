'use client'

import { useQuery } from '@tanstack/react-query'
import { School } from 'lucide-react'

import { getScholarships, type Scholarship } from '@/lib/actions/scholarship'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export function AvailableScholarships() {
  const { data: scholarships, isLoading } = useQuery<Scholarship[]>({
    queryKey: ['scholarships'],
    queryFn: getScholarships,
  })

  const activeScholarships = scholarships?.filter(
    (scholarship) => new Date(scholarship.deadline) > new Date()
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Available Scholarships
        </CardTitle>
        <School className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {isLoading ? (
              // Show loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))
            ) : activeScholarships && activeScholarships.length > 0 ? (
              activeScholarships.slice(0, 5).map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {scholarship.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    ${typeof scholarship.amount === 'number' 
                      ? scholarship.amount.toLocaleString()
                      : '0'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No active scholarships available.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


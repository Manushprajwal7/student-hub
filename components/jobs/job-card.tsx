'use client'

import { format } from 'date-fns'
import { Building2, Calendar, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { JobWithUser } from '@/types/jobs'

interface JobCardProps {
  job: JobWithUser
}

const jobTypeBadgeColors = {
  'Full Time': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
  'Part Time': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300',
  'Internship': 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300',
}

export function JobCard({ job }: JobCardProps) {
  const initials = job.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{job.title}</CardTitle>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
          <Badge className={jobTypeBadgeColors[job.type]}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {job.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-medium">Salary</p>
              <p className="text-sm text-muted-foreground">
                {formatSalary(job.salary, job.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Posted</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(job.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Apply by</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(job.deadline), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={job.user?.avatar_url || undefined}
              alt={job.user?.full_name || 'Anonymous'}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Posted by {job.user?.full_name || 'Anonymous'}
          </span>
        </div>
        <Button asChild>
          <a
            href={job.application_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}


'use client'

import { format } from 'date-fns'
import { Calendar, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ScholarshipWithUser } from '@/types/scholarships'

interface ScholarshipCardProps {
  scholarship: ScholarshipWithUser
}

const categoryColors = {
  'Male': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
  'Female': 'bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-300',
  'State Level': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300',
  'National Level': 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300',
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const initials = scholarship.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{scholarship.title}</CardTitle>
            <div className="mt-2">
              <Badge className={categoryColors[scholarship.category]}>
                {scholarship.category}
              </Badge>
            </div>
          </div>
          {scholarship.tags && scholarship.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {scholarship.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Provider</h4>
            <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
          </div>
          <div>
            <h4 className="font-medium">Eligibility</h4>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {scholarship.eligibility}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Closes on {format(new Date(scholarship.deadline), 'PP')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={scholarship.user?.avatar_url || undefined}
              alt={scholarship.user?.full_name || 'Anonymous'}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Posted by {scholarship.user?.full_name || 'Anonymous'}
          </span>
        </div>
        <Button asChild>
          <a
            href={scholarship.application_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}


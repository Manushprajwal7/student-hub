'use client'

import { format } from 'date-fns'
import type { AnnouncementWithUser } from '@/types/announcements'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AnnouncementCardProps {
  announcement: AnnouncementWithUser
}

const priorityColors = {
  High: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  Medium: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  Low: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const initials = announcement.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  return (
    <Card className={`${priorityColors[announcement.priority]} border-2`}>
      <CardHeader>
        <CardTitle>{announcement.title}</CardTitle>
        <CardDescription>
          {format(new Date(announcement.date), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{announcement.content}</p>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={announcement.user?.avatar_url || undefined}
              alt={announcement.user?.full_name || 'Anonymous'}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {announcement.user?.full_name || 'Anonymous'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}


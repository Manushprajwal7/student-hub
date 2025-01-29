'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Loader2, MapPin, Users } from 'lucide-react'
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
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { EventWithUser } from '@/types/events'

interface EventCardProps {
  event: EventWithUser
  currentUserId?: string
  onRegister: () => void
}

const eventTypeBadgeColors = {
  'Cultural Event': 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300',
  'Technical': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
  'Out Reach Activity': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300',
  'Rally Event': 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300',
  'Awareness Event': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300',
}

export function EventCard({ event, currentUserId, onRegister }: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const initials = event.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  const isRegistered = currentUserId ? event.registrations.includes(currentUserId) : false

  const handleRegister = async () => {
    if (!currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to register for events.',
      })
      return
    }

    try {
      setIsLoading(true)
      const updatedRegistrations = isRegistered
        ? event.registrations.filter(id => id !== currentUserId)
        : [...event.registrations, currentUserId]

      const { error } = await supabase
        .from('events')
        .update({ registrations: updatedRegistrations })
        .eq('id', event.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: isRegistered ? 'Unregistered from event.' : 'Registered for event!',
      })
      onRegister()
    } catch (error) {
      console.error('Error updating event registration:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update registration. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <div className="mt-2">
              <Badge className={eventTypeBadgeColors[event.type]}>
                {event.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.registrations.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {event.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={event.user?.avatar_url || undefined}
              alt={event.user?.full_name || 'Anonymous'}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Created by {event.user?.full_name || 'Anonymous'}
          </span>
        </div>
        <Button
          variant={isRegistered ? "outline" : "default"}
          disabled={isLoading}
          onClick={handleRegister}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRegistered ? (
            'Unregister'
          ) : (
            'Register'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}


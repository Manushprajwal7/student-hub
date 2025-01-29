'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
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
import type { StudyGroupWithUser } from '@/types/study-groups'

interface StudyGroupCardProps {
  group: StudyGroupWithUser
  currentUserId?: string
  onJoinLeave: () => void
}

const subjectBadgeColors = {
  'Computer Science': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
  'Electronics': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300',
  'Bio Technology': 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300',
  'Mechanical': 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300',
  'Mechanotronics': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300',
  'Civil': 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300',
}

export function StudyGroupCard({ group, currentUserId, onJoinLeave }: StudyGroupCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const initials = group.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  const isMember = currentUserId ? group.members.includes(currentUserId) : false

  const handleJoinLeave = async () => {
    if (!currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to join study groups.',
      })
      return
    }

    try {
      setIsLoading(true)
      const updatedMembers = isMember
        ? group.members.filter(id => id !== currentUserId)
        : [...group.members, currentUserId]

      const { error } = await supabase
        .from('study_groups')
        .update({ members: updatedMembers })
        .eq('id', group.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: isMember ? 'Left the study group.' : 'Joined the study group!',
      })
      onJoinLeave()
    } catch (error) {
      console.error('Error updating group membership:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update group membership. Please try again.',
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
            <CardTitle className="line-clamp-1">{group.name}</CardTitle>
            <div className="mt-2">
              <Badge className={subjectBadgeColors[group.subject]}>
                {group.subject}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {group.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{group.day}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{group.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={group.user?.avatar_url || undefined}
              alt={group.user?.full_name || 'Anonymous'}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Created by {group.user?.full_name || 'Anonymous'}
          </span>
        </div>
        <Button
          variant={isMember ? "outline" : "default"}
          disabled={isLoading}
          onClick={handleJoinLeave}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isMember ? (
            'Leave Group'
          ) : (
            'Join Group'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}


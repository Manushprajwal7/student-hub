'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { IssueWithUser } from '@/types/issues'

interface IssueCardProps {
  issue: IssueWithUser
  currentUserId?: string
  onVote: () => void
}

const categoryColors = {
  'Teaching': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
  'Women Rights': 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300',
  'Ragging': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300',
  'Cultural Events': 'bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-300',
  'Campus': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300',
  'Sports': 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300',
  'Fest': 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300',
  'Infrastructure': 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-300',
  'Academics': 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300',
  'Student Services': 'bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300',
  'Extracurricular Activities': 'bg-cyan-100 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-300',
}

export function IssueCard({ issue, currentUserId, onVote }: IssueCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()
  const initials = issue.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  const hasUpvoted = currentUserId ? issue.upvotes.includes(currentUserId) : false
  const hasDownvoted = currentUserId ? issue.downvotes.includes(currentUserId) : false

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to vote on issues.',
      })
      return
    }

    try {
      setIsVoting(true)
      let updatedUpvotes = [...issue.upvotes]
      let updatedDownvotes = [...issue.downvotes]

      if (voteType === 'up') {
        if (hasUpvoted) {
          updatedUpvotes = updatedUpvotes.filter(id => id !== currentUserId)
        } else {
          updatedUpvotes.push(currentUserId)
          updatedDownvotes = updatedDownvotes.filter(id => id !== currentUserId)
        }
      } else {
        if (hasDownvoted) {
          updatedDownvotes = updatedDownvotes.filter(id => id !== currentUserId)
        } else {
          updatedDownvotes.push(currentUserId)
          updatedUpvotes = updatedUpvotes.filter(id => id !== currentUserId)
        }
      }

      const { error } = await supabase
        .from('issues')
        .update({
          upvotes: updatedUpvotes,
          downvotes: updatedDownvotes,
        })
        .eq('id', issue.id)

      if (error) throw error

      onVote()
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to register vote. Please try again.',
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className={cn(
      issue.resolved && "border-green-500 bg-green-50 dark:bg-green-900/10",
      issue.reports?.length > 0 && !issue.resolved && "border-red-500 bg-red-50 dark:bg-red-900/10"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-2">
              <Link href={`/issues/${issue.id}`} className="hover:underline">
                {issue.title}
              </Link>
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className={categoryColors[issue.category]}>
                {issue.category}
              </Badge>
              {issue.resolved && (
                <Badge variant="success">Resolved</Badge>
              )}
              {issue.reports?.length > 0 && !issue.resolved && (
                <Badge variant="destructive">Reported</Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={issue.user?.avatar_url || undefined}
                  alt={issue.user?.full_name || 'Anonymous'}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>{issue.user?.full_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(issue.created_at))} ago</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {issue.description}
        </p>
        {issue.tags && issue.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {issue.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={hasUpvoted ? 'text-green-600' : ''}
            onClick={() => handleVote('up')}
            disabled={isVoting}
          >
            <ArrowBigUp className="h-5 w-5" />
          </Button>
          <span className="min-w-[2ch] text-center font-medium">
            {issue.upvotes.length - issue.downvotes.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={hasDownvoted ? 'text-red-600' : ''}
            onClick={() => handleVote('down')}
            disabled={isVoting}
          >
            <ArrowBigDown className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/issues/${issue.id}`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Discuss
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


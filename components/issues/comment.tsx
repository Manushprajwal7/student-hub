'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Loader2, Reply } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { CommentWithUser } from '@/types/issues'

interface CommentProps {
  comment: CommentWithUser
  currentUserId?: string
  onReply: (parentId: string, content: string) => Promise<void>
  onLike: () => void
  level?: number
  maxDepth?: number
  replies?: CommentWithUser[]
  onLoadReplies?: (parentId: string) => Promise<void>
}

export function Comment({
  comment,
  currentUserId,
  onReply,
  onLike,
  level = 0,
  maxDepth = 3,
  replies = [],
  onLoadReplies
}: CommentProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const { toast } = useToast()

  const initials = comment.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  const hasLiked = currentUserId ? comment.likes.includes(currentUserId) : false

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to like comments.',
      })
      return
    }

    try {
      setIsLiking(true)
      const updatedLikes = hasLiked
        ? comment.likes.filter(id => id !== currentUserId)
        : [...comment.likes, currentUserId]

      const { error } = await supabase
        .from('comments')
        .update({ likes: updatedLikes })
        .eq('id', comment.id)

      if (error) throw error

      onLike()
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to like comment. Please try again.',
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleReply = async () => {
    if (!currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to reply to comments.',
      })
      return
    }

    if (!replyContent.trim()) return

    try {
      setIsReplying(true)
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
      setShowReplies(true)
    } catch (error) {
      console.error('Error replying to comment:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
      })
    } finally {
      setIsReplying(false)
    }
  }

  const handleLoadReplies = async () => {
    if (onLoadReplies) {
      try {
        await onLoadReplies(comment.id)
        setShowReplies(true)
      } catch (error) {
        console.error('Error loading replies:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load replies. Please try again.',
        })
      }
    }
  }

  return (
    <div 
      className={cn(
        "space-y-4",
        level > 0 && "ml-6 border-l pl-6"
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.user?.avatar_url || undefined}
            alt={comment.user?.full_name || 'Anonymous'}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {comment.user?.full_name || 'Anonymous'}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 px-2", hasLiked && "text-red-500")}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
              <span>{comment.likes.length}</span>
            </Button>
            {level < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-2"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            )}
          </div>
          {showReplyForm && (
            <div className="mt-4 space-y-4">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isReplying || !replyContent.trim()}
                >
                  {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {replies && replies.length > 0 && (
        <div className="space-y-4">
          {!showReplies ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadReplies}
            >
              Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </Button>
          ) : (
            replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onLike={onLike}
                level={level + 1}
                maxDepth={maxDepth}
                replies={reply.replies}
                onLoadReplies={onLoadReplies}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}


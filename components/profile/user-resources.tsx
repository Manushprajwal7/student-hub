'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { ResourceCard } from '@/components/resources/resource-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import type { ResourceWithUser } from '@/types/resources'

interface UserResourcesProps {
  userId: string
}

export function UserResources({ userId }: UserResourcesProps) {
  const [resources, setResources] = useState<ResourceWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteResource, setDeleteResource] = useState<string | null>(null)
  const { toast } = useToast()

  const loadUserResources = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error loading user resources:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your shared resources.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useState(() => {
    loadUserResources()
  }, [userId])

  const handleDelete = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (error) throw error

      setResources((current) =>
        current.filter((resource) => resource.id !== resourceId)
      )

      toast({
        title: 'Success',
        description: 'Resource deleted successfully.',
      })
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete resource.',
      })
    } finally {
      setDeleteResource(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Shared Resources</CardTitle>
          <CardDescription>
            Manage the resources you've shared with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                You haven't shared any resources yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="relative group">
                  <ResourceCard resource={resource} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteResource(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete resource</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteResource}
        onOpenChange={() => setDeleteResource(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              shared resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteResource && handleDelete(deleteResource)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


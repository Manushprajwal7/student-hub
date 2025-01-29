import Link from 'next/link'
import { FileText } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Resource } from '@/lib/types/resources'

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  // Ensure URL is valid and external
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getResourceUrl = (url: string) => {
    if (!url) return '#'
    return isValidUrl(url) ? url : `https://${url}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="font-semibold">{resource.title}</span>
        </CardTitle>
        <CardDescription>
          {resource.department} • {resource.semester}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{resource.description}</p>
          <div className="flex flex-wrap gap-2">
            {resource.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Type: {resource.type}
            </div>
            <Button asChild>
              <a
                href={getResourceUrl(resource.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Resource
              </a>
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Shared on {new Date(resource.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


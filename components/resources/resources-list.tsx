"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface ResourcesListProps {
  resources: any[]
}

export function ResourcesList({ resources }: ResourcesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(resources.map((resource) => resource.category)))
  const filteredResources = selectedCategory
    ? resources.filter((resource) => resource.category === selectedCategory)
    : resources

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(resource.created_at)}</p>
                </div>
                <Badge>{resource.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{resource.description}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={resource.profiles?.avatar_url} />
                  <AvatarFallback>{resource.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{resource.profiles?.full_name || "Unknown User"}</span>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={resource.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


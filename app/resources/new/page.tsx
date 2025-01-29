'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { ResourceForm } from '@/components/resources/resource-form'
import { PageHeader } from '@/components/page-header'
import { PageTransition } from '@/components/page-transition'
import { createResource } from '@/lib/actions/resources'
import type { ResourceFormData } from '@/lib/types/resources'

export default function NewResourcePage() {
  const { user } = useAuth()

  const handleSubmit = async (data: ResourceFormData) => {
    if (!user) throw new Error('You must be logged in to create a resource')
    await createResource(data, user.id)
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Add Resource"
          description="Share educational resources with your peers."
        />
        <ResourceForm onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  )
}


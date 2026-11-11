import { notFound } from 'next/navigation'
import { ResourceEditView } from '@/components/admin/resource-views'
import { isResourceKey } from '@/lib/admin/resources'
import { requireAdmin } from '@/lib/auth/session'

type Props = { params: Promise<{ resource: string; id: string }> }

export const metadata = { title: 'Edit' }

export default async function ResourceEditPage({ params }: Props) {
  await requireAdmin()
  const { resource, id } = await params
  if (!isResourceKey(resource)) notFound()
  return <ResourceEditView resource={resource} id={id} />
}

import { notFound } from 'next/navigation'
import { ResourceListView } from '@/components/admin/resource-views'
import { RESOURCES, isResourceKey } from '@/lib/admin/resources'
import { requireAdmin } from '@/lib/auth/session'

type Props = { params: Promise<{ resource: string }> }

export async function generateMetadata({ params }: Props) {
  const { resource } = await params
  return { title: isResourceKey(resource) ? RESOURCES[resource].plural : 'Admin' }
}

export default async function ResourcePage({ params }: Props) {
  await requireAdmin()
  const { resource } = await params
  if (!isResourceKey(resource)) notFound()
  return <ResourceListView resource={resource} />
}

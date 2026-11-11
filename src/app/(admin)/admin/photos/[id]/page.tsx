import { ResourceEditView } from '@/components/admin/resource-views'
import { requireAdmin } from '@/lib/auth/session'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit photo' }

/** `photos` has its own list page (uploads), so its edit route is declared here. */
export default async function PhotoEditPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  return <ResourceEditView resource="photos" id={id} />
}

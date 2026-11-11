import { PhotoManager } from '@/components/admin/photo-manager'
import { SortableList } from '@/components/admin/sortable-list'
import { getListItems, getSelectOptions } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/auth/session'

export const metadata = { title: 'Photos' }

export default async function PhotosAdminPage() {
  await requireAdmin()
  const [items, options] = await Promise.all([getListItems('photos'), getSelectOptions()])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Photos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'photo' : 'photos'}. Drag to reorder, toggle visibility, star the ones
          shown on the home page, or open a photo to edit its details and per-language texts.
        </p>
      </header>

      <PhotoManager albums={options.albums ?? []} />

      <SortableList
        resource="photos"
        singular="Photo"
        items={items}
        hasStatus
        hasFeatured
        canDuplicate={false}
      />
    </div>
  )
}

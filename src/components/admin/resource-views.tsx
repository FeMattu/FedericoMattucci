import { Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResourceForm } from '@/components/admin/resource-form'
import { SortableList } from '@/components/admin/sortable-list'
import { Button } from '@/components/ui/button'
import { RESOURCES, type ResourceKey } from '@/lib/admin/resources'
import { getFormData, getListItems } from '@/lib/admin/queries'

/** Generic list page: drag to reorder, publish toggle, duplicate, delete. */
export async function ResourceListView({ resource }: { resource: ResourceKey }) {
  const def = RESOURCES[resource]
  const items = await getListItems(resource)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{def.plural}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}. Drag to reorder: the public site follows this order.
          </p>
        </div>
        {!def.createFromUpload && (
          <Button asChild>
            <Link href={`/admin/${resource}/new`}>
              <Plus className="size-4" aria-hidden />
              New {def.singular.toLowerCase()}
            </Link>
          </Button>
        )}
      </header>

      {resource === 'skills' && (
        <p className="text-sm">
          <Link href="/admin/skill-categories" className="text-primary hover:underline">
            Manage skill categories
          </Link>
        </p>
      )}
      {resource === 'skill-categories' && (
        <p className="text-sm">
          <Link href="/admin/skills" className="text-primary hover:underline">
            Back to skills
          </Link>
        </p>
      )}

      <SortableList
        resource={resource}
        singular={def.singular}
        items={items}
        hasStatus={def.hasStatus}
        hasFeatured={!!def.hasFeatured}
        canDuplicate={resource !== 'photos'}
      />
    </div>
  )
}

/** Generic edit/create page. `id === 'new'` renders a blank form. */
export async function ResourceEditView({ resource, id }: { resource: ResourceKey; id: string }) {
  const def = RESOURCES[resource]
  if (id === 'new' && def.createFromUpload) notFound()
  const data = await getFormData(resource, id === 'new' ? null : id)
  if (!data) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link href={`/admin/${resource}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {def.plural}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {id === 'new' ? `New ${def.singular.toLowerCase()}` : `Edit ${def.singular.toLowerCase()}`}
        </h1>
      </header>

      {resource === 'photos' && data.previews.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- signed CDN preview inside the admin
        <img src={data.previews.photo} alt="" className="max-h-80 w-full rounded-lg border object-contain bg-muted" />
      )}

      <ResourceForm
        def={data.def}
        id={id === 'new' ? null : id}
        initial={data.initial}
        locales={data.locales}
        options={data.options}
        previews={data.previews}
      />
    </div>
  )
}

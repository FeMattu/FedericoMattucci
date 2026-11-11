'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteItem, duplicateItem, reorderItems, setItemFeatured, setItemStatus } from '@/actions/admin'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { errorMessage } from '@/lib/admin/messages'
import { moveItem } from '@/lib/ordering'

export type ListItem = {
  id: string
  title: string
  subtitle?: string
  status?: 'DRAFT' | 'PUBLISHED'
  featured?: boolean
  /** Signed image URL for rows that have a picture (photos). */
  thumbUrl?: string
}

type Props = {
  resource: string
  singular: string
  items: ListItem[]
  hasStatus: boolean
  hasFeatured: boolean
  canDuplicate: boolean
}

function Row({ item, ...props }: { item: ListItem } & Omit<Props, 'items'>) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const run = async (action: Promise<{ ok: boolean; error?: string }>, success?: string) => {
    const result = await action
    if (!result.ok) toast.error(errorMessage(result.error ?? 'failed'))
    else {
      if (success) toast.success(success)
      router.refresh()
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${isDragging ? 'z-10 shadow-lg' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Reorder ${item.title}. Press space, then use the arrow keys.`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      {item.thumbUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- small signed CDN thumbnail
        <img src={item.thumbUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-md object-cover" />
      )}

      <div className="min-w-0 flex-1">
        <Link href={`/admin/${props.resource}/${item.id}`} className="block truncate font-medium hover:underline">
          {item.title}
        </Link>
        {item.subtitle && <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>}
      </div>

      {props.hasStatus && (
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={item.status === 'PUBLISHED'}
            onCheckedChange={(on) =>
              run(setItemStatus(props.resource, item.id, on ? 'PUBLISHED' : 'DRAFT'), on ? 'Published' : 'Unpublished')
            }
            aria-label={`Published: ${item.title}`}
          />
          {item.status === 'PUBLISHED' ? <span>Published</span> : <Badge variant="secondary">Draft</Badge>}
        </label>
      )}

      {props.hasFeatured && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={item.featured ? `Remove ${item.title} from featured` : `Feature ${item.title}`}
          aria-pressed={!!item.featured}
          onClick={() => run(setItemFeatured(props.resource, item.id, !item.featured))}
        >
          <Star className={item.featured ? 'size-4 fill-primary text-primary' : 'size-4'} aria-hidden />
        </Button>
      )}

      {props.canDuplicate && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Duplicate ${item.title}`}
          onClick={() => run(duplicateItem(props.resource, item.id), 'Duplicated as a draft')}
        >
          <Copy className="size-4" aria-hidden />
        </Button>
      )}

      <ConfirmDialog
        title={`Delete ${props.singular.toLowerCase()}?`}
        description={`"${item.title}" will be permanently deleted. This cannot be undone.`}
        onConfirm={() => run(deleteItem(props.resource, item.id), 'Deleted')}
      >
        <Button variant="ghost" size="icon" aria-label={`Delete ${item.title}`}>
          <Trash2 className="size-4 text-destructive" aria-hidden />
        </Button>
      </ConfirmDialog>
    </li>
  )
}

/** A reorderable list (mouse, touch and keyboard) that saves the new order immediately. */
export function SortableList(props: Props) {
  const router = useRouter()
  const [items, setItems] = useState(props.items)
  // Server data changed (after refresh): adopt it. Adjusting state during render,
  // not in an effect, avoids a second render pass with stale items.
  const [seen, setSeen] = useState(props.items)
  if (seen !== props.items) {
    setSeen(props.items)
    setItems(props.items)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    if (from < 0 || to < 0) return

    const previous = items
    const next = moveItem(items, from, to)
    setItems(next) // optimistic
    const result = await reorderItems(props.resource, next.map((i) => i.id))
    if (!result.ok) {
      setItems(previous)
      toast.error(errorMessage(result.error))
    } else {
      toast.success('Order saved')
      router.refresh()
    }
  }

  if (items.length === 0) return <p className="text-sm text-muted-foreground">Nothing here yet.</p>

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <Row key={item.id} item={item} {...props} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

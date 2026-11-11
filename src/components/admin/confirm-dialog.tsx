'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Props = {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  children: ReactNode
}

/** Wraps a trigger button: nothing destructive runs until the dialog is confirmed. */
export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, children }: Props) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

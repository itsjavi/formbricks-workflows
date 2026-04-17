import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function InspectorPanel({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <aside
      data-open={open}
      aria-hidden={!open}
      className={cn(
        'fixed top-14 right-0 z-30 flex h-[calc(100vh-3.5rem)] w-full max-w-[420px] flex-col bg-card shadow-2xl ring-1 ring-foreground/5 transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full',
      )}
    >
      <header className="sticky top-0 flex items-start justify-between gap-4 bg-card/80 px-6 py-5 backdrop-blur">
        <div className="min-w-0">
          <div className="label-caps">{title}</div>
          {subtitle && (
            <div className="font-heading mt-1 truncate text-lg font-bold">{subtitle}</div>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close inspector">
          <X className="size-4" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">{open && children}</div>
      <footer className="sticky bottom-0 flex items-center justify-between gap-3 bg-card/80 px-6 py-4 backdrop-blur">
        <p className="text-xs text-muted-foreground">Edits are kept automatically.</p>
        <Button type="button" size="sm" onClick={onClose}>
          <Check className="size-4" />
          Done
        </Button>
      </footer>
    </aside>
  )
}

import { cn } from '@/lib/utils'
import { Sparkles, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

export function GeneratedWithAiBanner({ defaultVisible }: { defaultVisible: boolean }) {
  const [visible, setVisible] = useState(defaultVisible)
  if (!visible) return null
  return (
    <div
      className={cn([
        'mb-6 flex items-start gap-3 rounded-2xl bg-primary/5 px-4 py-3',
        'ring-1 ring-primary/20 animate-in fade-in slide-in-from-top-2 duration-200',
      ])}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="font-heading text-sm font-bold">Generated with AI</div>
        <p className="text-sm text-muted-foreground">
          Review the trigger, conditions, and actions before enabling this workflow.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  )
}

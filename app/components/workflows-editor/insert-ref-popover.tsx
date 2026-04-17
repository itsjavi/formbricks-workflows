import { Braces } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TriggerType } from '@/lib/workflows/schema'
import { listOutputLeaves } from '@/lib/workflows/trigger-output'

export function InsertRefPopover({
  triggerType,
  onInsert,
}: {
  triggerType: TriggerType | null
  onInsert: (ref: string) => void
}) {
  const [open, setOpen] = useState(false)
  const leaves = listOutputLeaves(triggerType)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="ghost" size="xs" disabled={!triggerType}>
            <Braces className="size-3" />
            Insert data
          </Button>
        }
      />
      <PopoverContent align="end" className="w-72 p-1">
        {leaves.length === 0 ? (
          <div className="px-3 py-4 text-xs text-muted-foreground">
            Pick a trigger to reference its data here.
          </div>
        ) : (
          <ul className="flex flex-col">
            {leaves.map((leaf) => (
              <li key={leaf.path}>
                <button
                  type="button"
                  onClick={() => {
                    onInsert(leaf.path)
                    setOpen(false)
                  }}
                  className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{leaf.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {'{{'}
                    {leaf.path}
                    {'}}'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

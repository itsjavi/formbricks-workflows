import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { listActionDescriptors, type ActionDescriptor } from '@/lib/workflows/actions-registry'

export function AddActionPopover({
  onSelect,
  variant = 'ghost',
  label = 'Add action',
}: {
  onSelect: (descriptor: ActionDescriptor) => void
  variant?: 'ghost' | 'default'
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const descriptors = listActionDescriptors()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant={variant} size="sm">
            <Plus className="size-4" />
            {label}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-80 p-1">
        <div className="px-3 py-2">
          <div className="label-caps">Integrations</div>
          <p className="mt-1 text-xs text-muted-foreground">Example description.</p>
        </div>
        <ul className="flex flex-col">
          {descriptors.map((descriptor) => (
            <li key={`${descriptor.integration}.${descriptor.operation}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(descriptor)
                  setOpen(false)
                }}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Plus className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-sm font-bold">{descriptor.label}</div>
                  <div className="text-xs text-muted-foreground">{descriptor.category}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

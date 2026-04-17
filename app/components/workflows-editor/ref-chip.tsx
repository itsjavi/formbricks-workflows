import { cn } from '@/lib/utils'
import type { TriggerType } from '@/lib/workflows/schema'
import { resolveRef } from '@/lib/workflows/trigger-output'

export function RefChip({
  path,
  triggerType,
}: {
  path: string
  triggerType: TriggerType | null | undefined
}) {
  const valid = resolveRef(triggerType, path) !== null
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 font-mono text-[10px] tracking-tight',
        valid
          ? 'bg-primary/10 text-primary'
          : 'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
      )}
    >
      {'{{'}
      {path}
      {'}}'}
    </span>
  )
}

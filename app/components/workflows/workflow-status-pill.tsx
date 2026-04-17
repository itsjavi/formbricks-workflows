import { cn } from '@/lib/utils'
import type { WorkflowStatus } from '@/lib/workflows/schema'

const pillCopy: Record<WorkflowStatus, string> = {
  draft: 'Draft',
  enabled: 'Enabled',
  disabled: 'Paused',
}

const pillStyle: Record<WorkflowStatus, string> = {
  draft: 'bg-amber-100 text-amber-900',
  enabled: 'bg-primary/10 text-primary',
  disabled: 'bg-muted text-muted-foreground',
}

export function WorkflowStatusPill({ status }: { status: WorkflowStatus }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold tracking-wide uppercase',
        pillStyle[status],
      )}
    >
      {pillCopy[status]}
    </span>
  )
}

import { Zap } from 'lucide-react'
import { Link } from 'react-router'

import type { Workflow } from '@/lib/workflows/schema'

import { cn } from '@/lib/utils'
import { WorkflowStatusPill } from './workflow-status-pill'

function triggerSummary(workflow: Workflow): string {
  if (!workflow.trigger) return 'No trigger yet'
  switch (workflow.trigger.type) {
    case 'survey.response.created':
      return `Survey response received · ${workflow.trigger.surveyId}`
  }
}

function formatUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return iso
  }
}

export function WorkflowRow({ workflow }: { workflow: Workflow }) {
  return (
    <Link
      to={`/workflows/${workflow.id}`}
      className={cn(
        'group flex items-center gap-5 rounded-2xl bg-card px-6 py-5 transition-colors hover:bg-white',
        'border border-transparent hover:border-primary transition-colors',
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Zap className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading truncate text-base font-bold">{workflow.name}</h3>
          <WorkflowStatusPill status={workflow.status} />
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{triggerSummary(workflow)}</p>
      </div>
      <div className="hidden text-right sm:block">
        <div className="label-caps">Updated</div>
        <div className="mt-0.5 text-sm text-muted-foreground">
          {formatUpdatedAt(workflow.updatedAt)}
        </div>
      </div>
    </Link>
  )
}

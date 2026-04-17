import { Plus, Workflow as WorkflowIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function WorkflowEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-card px-8 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <WorkflowIcon className="size-7" />
      </div>
      <h2 className="font-heading mt-6 text-2xl font-extrabold tracking-tight">No workflows yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Every workflow starts with a single event. Create one to pick a trigger, add a condition,
        and send data to the tools your team uses.
      </p>
      <Button size="lg" className="mt-8" nativeButton={false} render={<Link to="/workflows/new" />}>
        <Plus className="size-4" />
        Create your first workflow
      </Button>
    </div>
  )
}

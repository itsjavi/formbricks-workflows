import { ArrowLeft, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WorkflowStatusPill } from '@/components/workflows/workflow-status-pill'
import type { Workflow } from '@/lib/workflows/schema'
import { useDraft, useDraftMutator } from '@/state/editor'

import { DeleteWorkflowMenu } from './delete-workflow-menu'

export function EditorHeader({
  workflow,
  isNew = false,
  autoFocusName = false,
}: {
  workflow: Workflow
  isNew?: boolean
  autoFocusName?: boolean
}) {
  const fetcher = useFetcher()
  const draft = useDraft()
  const mutate = useDraftMutator()
  const sourceName = isNew ? (draft?.name ?? workflow.name) : workflow.name

  const [editing, setEditing] = useState(autoFocusName)
  const [draftName, setDraftName] = useState(sourceName)
  const inputRef = useRef<HTMLInputElement>(null)

  const pendingName =
    !isNew && fetcher.formData?.get('intent') === 'rename'
      ? (fetcher.formData.get('name') as string | null)
      : null
  const displayName = pendingName ?? sourceName

  useEffect(() => {
    if (!editing) setDraftName(sourceName)
  }, [sourceName, editing])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commit() {
    const trimmed = draftName.trim()
    setEditing(false)
    if (!trimmed || trimmed === sourceName) {
      setDraftName(sourceName)
      return
    }
    if (isNew) {
      mutate((d) => {
        d.name = trimmed
      })
      return
    }
    fetcher.submit({ intent: 'rename', name: trimmed }, { method: 'post' })
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Link
          to="/workflows"
          className="font-heading inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Back to workflows
        </Link>
        <div className="mt-4 flex items-center gap-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                autoFocus
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commit()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    setDraftName(sourceName)
                    setEditing(false)
                  }
                }}
                onBlur={commit}
                maxLength={120}
                className="font-heading h-10 max-w-lg text-2xl font-extrabold tracking-tight"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={commit}
                aria-label="Save name"
              >
                <Check className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-heading truncate rounded-md text-left text-3xl font-extrabold tracking-tight transition-colors hover:text-muted-foreground"
            >
              {displayName}
            </button>
          )}
          <WorkflowStatusPill status={workflow.status} />
        </div>
      </div>
      {!isNew && (
        <div className="flex items-center gap-1">
          <DeleteWorkflowMenu workflowName={workflow.name} />
        </div>
      )}
    </div>
  )
}

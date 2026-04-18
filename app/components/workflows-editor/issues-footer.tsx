import { useSetAtom } from 'jotai'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Workflow } from '@/lib/workflows/schema'
import type { Issue } from '@/lib/workflows/validate'
import {
  isDirtyAtom,
  useDraft,
  useIsDirty,
  useIssues,
  useSetSelectedStep,
  type SelectedStep,
} from '@/state/editor'

function issueToSelection(path: string): SelectedStep | null {
  if (path.startsWith('trigger')) return { kind: 'trigger' }
  if (path.startsWith('conditions')) return { kind: 'conditions' }
  if (path.startsWith('actions[')) {
    return null
  }
  return null
}

export function IssuesFooter({ workflow, isNew = false }: { workflow: Workflow; isNew?: boolean }) {
  const draft = useDraft()
  const issues = useIssues()
  const isDirty = useIsDirty()
  const setDirty = useSetAtom(isDirtyAtom)
  const setSelected = useSetSelectedStep()
  const saveFetcher = useFetcher<{ ok?: boolean; error?: string }>()
  const toggleFetcher = useFetcher<{ ok?: boolean; error?: string }>()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const saving = saveFetcher.state !== 'idle'
  const toggling = toggleFetcher.state !== 'idle'

  useEffect(() => {
    if (saveFetcher.state === 'idle' && saveFetcher.data?.ok) {
      setDirty(false)
    }
  }, [saveFetcher.state, saveFetcher.data, setDirty])

  const hasTrigger = (draft?.trigger ?? workflow.trigger) !== null
  const showIssues = !isNew || hasTrigger
  const hasIssues = showIssues && issues.length > 0
  const enabled = workflow.status === 'enabled'

  const optimisticEnabled = toggleFetcher.formData
    ? toggleFetcher.formData.get('intent') === 'enable'
    : enabled

  function handleSave() {
    if (!draft || saving) return
    saveFetcher.submit(
      { intent: 'save', workflow: JSON.stringify(draft) },
      { method: 'post', encType: 'application/x-www-form-urlencoded' },
    )
  }

  function handleToggleEnable(nextChecked: boolean) {
    toggleFetcher.submit({ intent: nextChecked ? 'enable' : 'disable' }, { method: 'post' })
  }

  function handleIssueClick(issue: Issue) {
    const selection = issueToSelection(issue.path)
    if (!selection) {
      const match = /^actions\[(\d+)\]/.exec(issue.path)
      if (match && draft) {
        const index = Number.parseInt(match[1]!, 10)
        const action = draft.actions[index]
        if (action) {
          setSelected({ kind: 'action', id: action.id })
          setPopoverOpen(false)
          return
        }
      }
      return
    }
    const condMatch = /^conditions\[(\d+)\]/.exec(issue.path)
    if (condMatch && draft) {
      const index = Number.parseInt(condMatch[1]!, 10)
      const condition = draft.conditions[index]
      if (condition) {
        setSelected({ kind: 'condition', id: condition.id })
        setPopoverOpen(false)
        return
      }
    }
    setSelected(selection)
    setPopoverOpen(false)
  }

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 flex justify-center px-4 pb-6">
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-6xl items-center gap-3 rounded-2xl bg-card/90 px-5 py-3 shadow-2xl ring-1 ring-foreground/5 backdrop-blur',
        )}
      >
        {isNew && !hasTrigger ? (
          <span className="px-3 text-xs text-muted-foreground">Start by picking a trigger.</span>
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!hasIssues}
                  className={cn(
                    'gap-2',
                    hasIssues ? 'text-amber-700' : 'text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  {hasIssues ? (
                    <AlertCircle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {hasIssues
                    ? `${issues.length} issue${issues.length === 1 ? '' : 's'} to fix`
                    : isNew
                      ? 'Ready to create'
                      : 'Ready to enable'}
                </Button>
              }
            />
            <PopoverContent side="top" align="start" className="w-96 max-w-[90vw] p-2">
              <div className="label-caps px-2 pt-1 pb-2">Issues</div>
              <ul className="flex flex-col gap-1">
                {issues.map((issue, index) => (
                  <li key={`${issue.path}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleIssueClick(issue)}
                      className="group flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-accent"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground">{issue.message}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {issue.path}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}

        <div className="flex-1" />

        <span
          className={cn(
            'text-xs',
            (saveFetcher.data?.error || toggleFetcher.data?.error) &&
              saveFetcher.state === 'idle' &&
              toggleFetcher.state === 'idle'
              ? 'text-destructive'
              : 'text-muted-foreground',
          )}
        >
          {saving
            ? isNew
              ? 'Creating…'
              : 'Saving…'
            : toggling
              ? optimisticEnabled
                ? 'Enabling…'
                : 'Disabling…'
              : saveFetcher.data?.error
                ? saveFetcher.data.error
                : toggleFetcher.data?.error
                  ? toggleFetcher.data.error
                  : isNew
                    ? hasTrigger
                      ? 'Not saved yet'
                      : ''
                    : isDirty
                      ? 'Unsaved changes'
                      : hasIssues
                        ? 'Draft'
                        : 'Everything saved'}
        </span>

        <Button
          type="button"
          variant={isNew ? 'default' : 'outline'}
          size="sm"
          onClick={handleSave}
          disabled={saving || (isNew ? !hasTrigger || hasIssues : !isDirty)}
        >
          {saving ? 'Saving…' : isNew ? 'Create workflow' : 'Save'}
        </Button>

        {!isNew && (
          <div className="mx-1 flex items-center gap-2 border-l border-border/40 pl-3">
            <span className="font-heading text-xs font-semibold">
              {optimisticEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              checked={optimisticEnabled}
              disabled={hasIssues || isDirty || toggling}
              onCheckedChange={handleToggleEnable}
              aria-label={optimisticEnabled ? 'Disable workflow' : 'Enable workflow'}
            />
          </div>
        )}
      </div>
    </div>
  )
}

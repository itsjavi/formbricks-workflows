import { Bolt, Link2, Plus, Trash2, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'

import { Button } from '@/components/ui/button'
import { TriggerCatalog } from '@/components/workflows/trigger-catalog'
import { cn } from '@/lib/utils'
import type { ActionDescriptor } from '@/lib/workflows/actions-registry'
import type { Condition, TriggerType, Workflow } from '@/lib/workflows/schema'
import {
  useDraft,
  useDraftMutator,
  useIsDirty,
  useIssues,
  useSelectedStep,
  useSetSelectedStep,
  type SelectedStep,
} from '@/state/editor'

import { ActionInspector } from './action-inspector'
import { AddActionPopover } from './add-action-popover'
import { ConditionInspector } from './condition-inspector'
import { EditorHeader } from './editor-header'
import { FlowConnector } from './flow-connector'
import { InspectorPanel } from './inspector-panel'
import { RefChip } from './ref-chip'
import { StepCard } from './step-card'
import { TriggerInspector } from './trigger-inspector'

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function indexedIssues(paths: string[], prefix: 'conditions' | 'actions'): Set<number> {
  const re = new RegExp(`^${prefix}\\[(\\d+)\\]`)
  const out = new Set<number>()
  for (const path of paths) {
    const match = re.exec(path)
    if (match) out.add(Number(match[1]))
  }
  return out
}

export function Editor({ workflow, isNew = false }: { workflow: Workflow; isNew?: boolean }) {
  const draft = useDraft() ?? workflow
  const selected = useSelectedStep()
  const setSelected = useSetSelectedStep()
  const mutate = useDraftMutator()
  const issues = useIssues()
  const isDirty = useIsDirty()
  const saveFetcher = useFetcher()

  const issuePaths = issues.map((i) => i.path)
  const triggerBad = issuePaths.some((p) => p.startsWith('trigger'))
  const condIssues = indexedIssues(issuePaths, 'conditions')
  const actionIssues = indexedIssues(issuePaths, 'actions')
  const labels = inspectorLabels(selected, draft)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && selected) {
        setSelected(null)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (isDirty && saveFetcher.state === 'idle') {
          saveFetcher.submit(
            { intent: 'save', workflow: JSON.stringify(draft) },
            { method: 'post' },
          )
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, setSelected, isDirty, draft, saveFetcher])

  function handleSelectTrigger(id: string) {
    if (id !== 'survey.response.created') return
    mutate((d) => {
      d.trigger = { type: 'survey.response.created', surveyId: '' }
    })
    setSelected({ kind: 'trigger' })
  }

  function handleAddCondition() {
    const id = newId('c')
    mutate((d) => {
      d.conditions.push({
        id,
        left: { $ref: '' },
        operator: 'eq',
        right: '',
      })
    })
    setSelected({ kind: 'condition', id })
  }

  function handleAddAction(descriptor: ActionDescriptor) {
    const id = newId('a')
    mutate((d) => {
      d.actions.push({
        id,
        integration: descriptor.integration,
        operation: descriptor.operation,
        config: {},
      })
    })
    setSelected({ kind: 'action', id })
  }

  const hasTrigger = draft.trigger !== null

  return (
    <>
      <div className="mx-auto max-w-5xl px-8 py-10 pb-32">
        <EditorHeader workflow={workflow} isNew={isNew} autoFocusName={isNew} />
        <div className="mt-10">
          {!hasTrigger ? (
            <TriggerEmptyState onSelect={handleSelectTrigger} />
          ) : (
            <div className="flex flex-col">
              <StepCard
                icon={<Zap className="size-5" />}
                label="When"
                title="Survey response created"
                subtitle={
                  draft.trigger?.type === 'survey.response.created'
                    ? draft.trigger.surveyId
                      ? `Survey: ${draft.trigger.surveyId}`
                      : 'No survey selected'
                    : undefined
                }
                selected={selected?.kind === 'trigger'}
                onClick={() => setSelected({ kind: 'trigger' })}
                className={cn(triggerBad && 'ring-1 ring-destructive/30')}
              />
              <FlowConnector active={workflow.status === 'enabled'} />
              <ConditionsGroup
                draft={draft}
                selected={selected}
                setSelected={setSelected}
                condIssues={condIssues}
                onAdd={handleAddCondition}
              />
              <FlowConnector active={workflow.status === 'enabled'} />
              <ActionsGroup
                draft={draft}
                selected={selected}
                setSelected={setSelected}
                actionIssues={actionIssues}
                onAdd={handleAddAction}
                onRemove={(id) => {
                  mutate((d) => {
                    d.actions = d.actions.filter((a) => a.id !== id)
                  })
                  if (selected?.kind === 'action' && selected.id === id) setSelected(null)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <InspectorPanel
        open={selected !== null}
        title={labels.title}
        subtitle={labels.subtitle}
        onClose={() => setSelected(null)}
      >
        {selected?.kind === 'trigger' && <TriggerInspector workflow={draft} />}
        {selected?.kind === 'condition' && (
          <ConditionInspector key={selected.id} workflow={draft} conditionId={selected.id} />
        )}
        {selected?.kind === 'action' && (
          <ActionInspector key={selected.id} workflow={draft} actionId={selected.id} />
        )}
      </InspectorPanel>
    </>
  )
}

function TriggerEmptyState({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section>
      <header className="max-w-xl">
        <div className="label-caps">Step 1</div>
        <h2 className="font-heading mt-2 text-3xl font-extrabold tracking-tight">
          Select a trigger
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Every workflow starts with a single event. Pick what should kick this sequence off — we
          ship one in this proof of concept; the rest land additively without migrating existing
          workflows.
        </p>
      </header>
      <div className="mt-10">
        <TriggerCatalog onSelect={onSelect} />
      </div>
    </section>
  )
}

function ConditionsGroup({
  draft,
  selected,
  setSelected,
  condIssues,
  onAdd,
}: {
  draft: Workflow
  selected: SelectedStep | null
  setSelected: (step: SelectedStep | null) => void
  condIssues: Set<number>
  onAdd: () => void
}) {
  const count = draft.conditions.length
  const title = count === 0 ? 'Always run' : `All of ${count} must be true`
  return (
    <div
      data-selected={selected?.kind === 'conditions' || selected?.kind === 'condition'}
      className={cn(
        'rounded-2xl bg-card p-5 transition-all',
        (selected?.kind === 'conditions' || selected?.kind === 'condition') &&
          'ring-2 ring-primary/40',
      )}
    >
      <div className="flex w-full items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Link2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-caps">Filter</div>
          <div className="font-heading mt-1 text-base font-bold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Conditions are joined with AND. All must pass for actions to run.
          </div>
        </div>
      </div>

      {count > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {draft.conditions.map((condition, index) => (
            <li key={condition.id}>
              <ConditionRow
                condition={condition}
                triggerType={draft.trigger?.type ?? null}
                selected={selected?.kind === 'condition' && selected.id === condition.id}
                hasIssue={condIssues.has(index)}
                onClick={() => setSelected({ kind: 'condition', id: condition.id })}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Add condition
        </Button>
      </div>
    </div>
  )
}

function ConditionRow({
  condition,
  triggerType,
  selected,
  hasIssue,
  onClick,
}: {
  condition: Condition
  triggerType: TriggerType | null
  selected: boolean
  hasIssue: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected || undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl bg-background px-4 py-3 text-left text-sm transition-colors hover:bg-accent/40',
        selected && 'ring-2 ring-primary/40',
        hasIssue && 'ring-1 ring-destructive/30',
      )}
    >
      <RefChip path={condition.left.$ref || '(none)'} triggerType={triggerType} />
      <span className="text-muted-foreground">{condition.operator}</span>
      {condition.right !== undefined && (
        <span className="rounded-full bg-muted px-2 font-mono text-[10px]">
          {JSON.stringify(condition.right)}
        </span>
      )}
    </button>
  )
}

function ActionsGroup({
  draft,
  selected,
  setSelected,
  actionIssues,
  onAdd,
  onRemove,
}: {
  draft: Workflow
  selected: SelectedStep | null
  setSelected: (step: SelectedStep | null) => void
  actionIssues: Set<number>
  onAdd: (descriptor: ActionDescriptor) => void
  onRemove: (id: string) => void
}) {
  const count = draft.actions.length
  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Bolt className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-caps">Then</div>
          <div className="font-heading mt-1 text-base font-bold">
            {count === 0 ? 'Add your first action' : `${count} action${count === 1 ? '' : 's'}`}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Actions run in order. The registry decides what shows up in the picker.
          </div>
        </div>
      </div>

      {count === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl bg-muted/40 px-4 py-5">
          <p className="text-sm text-muted-foreground">
            Nothing to do yet. Pick an action to run when the conditions pass.
          </p>
          <AddActionPopover onSelect={onAdd} variant="default" label="Add your first action" />
        </div>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-2">
            {draft.actions.map((action, index) => (
              <li key={action.id}>
                <ActionRow
                  label={`${action.integration}.${action.operation}`}
                  preview={actionPreview(action.config)}
                  selected={selected?.kind === 'action' && selected.id === action.id}
                  hasIssue={actionIssues.has(index)}
                  onClick={() => setSelected({ kind: 'action', id: action.id })}
                  onRemove={() => onRemove(action.id)}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <AddActionPopover onSelect={onAdd} />
          </div>
        </>
      )}
    </div>
  )
}

function actionPreview(config: Record<string, unknown>): string {
  const first = Object.values(config).find((value) => typeof value === 'string' && value.length > 0)
  if (typeof first === 'string') return first
  return 'Not configured yet'
}

function ActionRow({
  label,
  preview,
  selected,
  hasIssue,
  onClick,
  onRemove,
}: {
  label: string
  preview: string
  selected: boolean
  hasIssue: boolean
  onClick: () => void
  onRemove: () => void
}) {
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        'group/action flex items-center gap-3 rounded-xl bg-background px-4 py-3 transition-colors hover:bg-accent/40',
        selected && 'ring-2 ring-primary/40',
        hasIssue && 'ring-1 ring-destructive/30',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
      >
        <span className="font-heading text-sm font-bold">{label}</span>
        <span className="truncate text-xs text-muted-foreground">{preview}</span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        aria-label="Remove action"
        className="opacity-0 transition-opacity group-hover/action:opacity-100"
      >
        <Trash2 />
      </Button>
    </div>
  )
}

function inspectorLabels(
  selected: SelectedStep | null,
  draft: Workflow,
): { title: string; subtitle: string } {
  if (!selected) return { title: '', subtitle: '' }
  switch (selected.kind) {
    case 'trigger':
      return { title: 'Trigger', subtitle: 'Survey response created' }
    case 'conditions':
      return { title: 'Conditions', subtitle: 'AND filter' }
    case 'condition': {
      const c = draft.conditions.find((x) => x.id === selected.id)
      return { title: 'Condition', subtitle: c?.left.$ref || 'New condition' }
    }
    case 'action': {
      const a = draft.actions.find((x) => x.id === selected.id)
      return {
        title: 'Action',
        subtitle: a ? `${a.integration}.${a.operation}` : 'Action',
      }
    }
  }
}

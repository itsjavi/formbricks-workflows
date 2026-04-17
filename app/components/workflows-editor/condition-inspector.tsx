import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Condition, Operator, Workflow } from '@/lib/workflows/schema'
import {
  listOutputLeaves,
  operatorsFor,
  resolveRef,
  type LeafType,
} from '@/lib/workflows/trigger-output'
import { useDraftMutator, useSetSelectedStep } from '@/state/editor'

const operatorLabels: Record<Operator, string> = {
  eq: 'equals',
  neq: 'does not equal',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  isSet: 'is set',
  isEmpty: 'is empty',
}

function needsRight(op: Operator): boolean {
  return op !== 'isSet' && op !== 'isEmpty'
}

function coerceRight(type: LeafType | null, raw: string): string | number | boolean {
  if (type === 'number') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : raw
  }
  if (type === 'boolean') {
    if (raw === 'true') return true
    if (raw === 'false') return false
  }
  return raw
}

function rightToString(value: Condition['right']): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function ConditionInspector({
  workflow,
  conditionId,
}: {
  workflow: Workflow
  conditionId: string
}) {
  const mutate = useDraftMutator()
  const setSelected = useSetSelectedStep()
  const condition = workflow.conditions.find((c) => c.id === conditionId)
  const triggerType = workflow.trigger?.type ?? null
  const leaves = listOutputLeaves(triggerType)

  if (!condition) {
    return <div className="text-sm text-muted-foreground">This condition has been removed.</div>
  }

  const ref = condition.left.$ref
  const operator = condition.operator
  const right = rightToString(condition.right)
  const leafType: LeafType | null = ref ? resolveRef(triggerType, ref) : null
  const allowedOperators = leafType ? (operatorsFor(leafType) as Operator[]) : []

  function updateCondition(updater: (c: Condition) => void) {
    mutate((draft) => {
      const c = draft.conditions.find((x) => x.id === conditionId)
      if (!c) return
      updater(c)
    })
  }

  function handleRefChange(nextRef: string) {
    const nextType = resolveRef(triggerType, nextRef)
    const nextAllowed = nextType ? (operatorsFor(nextType) as Operator[]) : []
    updateCondition((c) => {
      c.left = { $ref: nextRef }
      if (!nextAllowed.includes(c.operator)) {
        c.operator = nextAllowed[0] ?? 'eq'
      }
    })
  }

  function handleOperatorChange(nextOperator: Operator) {
    updateCondition((c) => {
      c.operator = nextOperator
      if (!needsRight(nextOperator)) {
        delete c.right
      } else if (c.right === undefined) {
        c.right = ''
      }
    })
  }

  function handleRightChange(rawValue: string) {
    const coerced = coerceRight(leafType, rawValue)
    updateCondition((c) => {
      c.right = coerced
    })
  }

  function handleDelete() {
    mutate((draft) => {
      draft.conditions = draft.conditions.filter((c) => c.id !== conditionId)
    })
    setSelected(null)
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <FieldLabel>Data point</FieldLabel>
        <Select value={ref || undefined} onValueChange={(value) => handleRefChange(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pick a field from the trigger" />
          </SelectTrigger>
          <SelectContent>
            {leaves.map((leaf) => (
              <SelectItem key={leaf.path} value={leaf.path}>
                <span className="flex flex-col">
                  <span className="text-sm">{leaf.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{leaf.path}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldContent>
          <FieldDescription>
            Any value this trigger emits is fair game. New triggers add leaves, not code.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Is</FieldLabel>
        <Select
          value={operator}
          onValueChange={(value) => handleOperatorChange(value as Operator)}
          disabled={allowedOperators.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an operator" />
          </SelectTrigger>
          <SelectContent>
            {allowedOperators.map((op) => (
              <SelectItem key={op} value={op}>
                {operatorLabels[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needsRight(operator) && (
        <Field>
          <FieldLabel htmlFor="condition-right">Value</FieldLabel>
          {leafType === 'boolean' ? (
            <Select
              value={right || 'true'}
              onValueChange={(value) => handleRightChange(value ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="condition-right"
              type={leafType === 'number' ? 'number' : 'text'}
              placeholder={leafType === 'number' ? '8' : 'bug'}
              value={right}
              onChange={(event) => handleRightChange(event.target.value)}
            />
          )}
          <FieldContent>
            {needsRight(operator) && right.length === 0 && (
              <FieldError>Enter a value to compare against.</FieldError>
            )}
          </FieldContent>
        </Field>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-4" />
          Remove condition
        </Button>
      </div>
    </form>
  )
}

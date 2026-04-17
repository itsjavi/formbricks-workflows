import { Trash2 } from 'lucide-react'
import { useCallback, useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { findActionDescriptor, type FieldDescriptor } from '@/lib/workflows/actions-registry'
import { findInvalidRefs, wrapRef } from '@/lib/workflows/refs'
import type { Workflow } from '@/lib/workflows/schema'
import { useDraftMutator, useSetSelectedStep } from '@/state/editor'

import { InsertRefPopover } from './insert-ref-popover'

export function ActionInspector({ workflow, actionId }: { workflow: Workflow; actionId: string }) {
  const mutate = useDraftMutator()
  const setSelected = useSetSelectedStep()
  const action = workflow.actions.find((a) => a.id === actionId)
  const descriptor = action ? findActionDescriptor(action.integration, action.operation) : undefined
  const triggerType = workflow.trigger?.type ?? null

  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const updateField = useCallback(
    (key: string, value: string) => {
      mutate((draft) => {
        const a = draft.actions.find((x) => x.id === actionId)
        if (!a) return
        a.config[key] = value
      })
    },
    [actionId, mutate],
  )

  const handleInsertRef = useCallback(
    (field: FieldDescriptor, ref: string) => {
      const token = wrapRef(ref)
      const el = textareaRefs.current[field.key] ?? inputRefs.current[field.key]
      const currentRaw = action?.config[field.key]
      const current = typeof currentRaw === 'string' ? currentRaw : ''
      if (!el) {
        updateField(field.key, current + token)
        return
      }
      const start = el.selectionStart ?? current.length
      const end = el.selectionEnd ?? current.length
      const next = current.slice(0, start) + token + current.slice(end)
      updateField(field.key, next)
      requestAnimationFrame(() => {
        el.focus()
        const cursor = start + token.length
        el.setSelectionRange(cursor, cursor)
      })
    },
    [action, updateField],
  )

  if (!action) {
    return <div className="text-sm text-muted-foreground">This action has been removed.</div>
  }
  if (!descriptor) {
    return (
      <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Unknown action {action.integration}.{action.operation}.
      </div>
    )
  }

  function handleDelete() {
    mutate((draft) => {
      draft.actions = draft.actions.filter((a) => a.id !== actionId)
    })
    setSelected(null)
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
      <div className="rounded-xl bg-muted/40 px-4 py-3">
        <div className="label-caps">{descriptor.category}</div>
        <div className="font-heading mt-1 text-sm font-bold">{descriptor.label}</div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {descriptor.integration}.{descriptor.operation}
        </p>
      </div>

      {descriptor.fields.map((field) => {
        const rawValue = action.config[field.key]
        const value = typeof rawValue === 'string' ? rawValue : ''
        const badRefs = field.acceptsDataRefs ? findInvalidRefs(value, triggerType) : []
        const isEmpty = field.required && value.trim() === ''

        return (
          <Field key={field.key}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={`action-${field.key}`}>{field.label}</FieldLabel>
              {field.acceptsDataRefs && (
                <InsertRefPopover
                  triggerType={triggerType}
                  onInsert={(ref) => handleInsertRef(field, ref)}
                />
              )}
            </div>
            {field.kind === 'textarea' ? (
              <Textarea
                id={`action-${field.key}`}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) => updateField(field.key, event.target.value)}
                aria-invalid={isEmpty || badRefs.length > 0 ? 'true' : undefined}
                ref={(el) => {
                  textareaRefs.current[field.key] = el
                }}
              />
            ) : (
              <Input
                id={`action-${field.key}`}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) => updateField(field.key, event.target.value)}
                aria-invalid={isEmpty || badRefs.length > 0 ? 'true' : undefined}
                ref={(el) => {
                  inputRefs.current[field.key] = el
                }}
              />
            )}
            <FieldContent>
              {field.help && <FieldDescription>{field.help}</FieldDescription>}
              {isEmpty && <FieldError>{field.label} is required</FieldError>}
              {badRefs.length > 0 && (
                <FieldError>
                  {badRefs.map(wrapRef).join(', ')} {badRefs.length === 1 ? 'is' : 'are'} not
                  available on this trigger.
                </FieldError>
              )}
            </FieldContent>
          </Field>
        )
      })}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-4" />
          Remove action
        </Button>
      </div>
    </form>
  )
}

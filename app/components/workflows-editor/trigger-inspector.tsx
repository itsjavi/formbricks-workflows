import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { Workflow } from '@/lib/workflows/schema'
import { useDraftMutator } from '@/state/editor'

export function TriggerInspector({ workflow }: { workflow: Workflow }) {
  const mutate = useDraftMutator()
  const trigger = workflow.trigger
  const surveyId = trigger?.type === 'survey.response.created' ? trigger.surveyId : ''
  const showRequiredError = trigger?.type === 'survey.response.created' && surveyId.trim() === ''

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    mutate((draft) => {
      draft.trigger = { type: 'survey.response.created', surveyId: next }
    })
  }

  function handleChangeTrigger() {
    mutate((draft) => {
      draft.trigger = null
    })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
      <div className="rounded-xl bg-muted/40 px-4 py-3">
        <div className="label-caps">Event</div>
        <div className="font-heading mt-1 text-sm font-bold">Survey response created</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Fires once per submitted response. The fields below narrow the stream to a specific
          survey.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="surveyId">Survey</FieldLabel>
        <Input
          id="surveyId"
          name="surveyId"
          placeholder="srv_nps_1"
          value={surveyId}
          onChange={handleChange}
          aria-invalid={showRequiredError ? 'true' : undefined}
        />
        <FieldContent>
          <FieldDescription>Paste a survey ID. In a real build, this is a picker.</FieldDescription>
          {showRequiredError && <FieldError>Survey ID is required</FieldError>}
        </FieldContent>
      </Field>

      <div className="pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleChangeTrigger}>
          Change trigger
        </Button>
      </div>
    </form>
  )
}

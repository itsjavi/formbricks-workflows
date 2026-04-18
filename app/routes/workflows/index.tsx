import { WorkflowEmptyState } from '@/components/workflows/workflow-empty-state'
import { WorkflowRow } from '@/components/workflows/workflow-row'
import { listWorkflows } from '@/server-mocks'

import { AiGeneratePanel } from '@/components/workflows/ai-generate-panel'
import { NewWorkflowButton } from '@/components/workflows/new-workflow-button'
import { useId, useState } from 'react'
import type { Route } from './+types/index'

export function meta() {
  return [{ title: 'Workflows · Formbricks' }]
}

export function loader() {
  return { workflows: listWorkflows() }
}

export default function WorkflowsListPage({ loaderData }: Route.ComponentProps) {
  const { workflows } = loaderData
  const hasWorkflows = workflows.length > 0
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const panelId = useId()

  function handleAiButtonClick() {
    setAiPanelOpen((open) => !open)
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="label-caps">Workflows</div>
          <h1 className="font-heading mt-2 text-4xl font-extrabold tracking-tight">Automations</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            A workflow listens to an event, checks a condition, and runs an action.
          </p>
        </div>
        {hasWorkflows && <NewWorkflowButton onAiButtonClick={handleAiButtonClick} />}
      </header>

      {aiPanelOpen && (
        <section className="mt-8">
          <AiGeneratePanel id={panelId} onClose={() => setAiPanelOpen(false)} />
        </section>
      )}

      <section className="mt-10">
        {hasWorkflows ? (
          <ul className="flex flex-col gap-2">
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <WorkflowRow workflow={workflow} />
              </li>
            ))}
          </ul>
        ) : (
          <WorkflowEmptyState />
        )}
      </section>
    </div>
  )
}

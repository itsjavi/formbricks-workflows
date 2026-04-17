import { data, redirect } from 'react-router'

import { Editor } from '@/components/workflows-editor/editor'
import { EditorHydrator } from '@/components/workflows-editor/editor-hydrator'
import { IssuesFooter } from '@/components/workflows-editor/issues-footer'
import { WorkflowSchema } from '@/lib/workflows/schema'
import { createBlankWorkflow } from '@/lib/workflows/utils'
import { validate } from '@/lib/workflows/validate'
import { getCurrentUser, updateWorkflow } from '@/server-mocks'

import type { Route } from './+types/new'

export function meta() {
  return [{ title: 'New workflow · Formbricks' }]
}

export function loader() {
  const user = getCurrentUser()
  const workflow = createBlankWorkflow({ ownerId: user.id })
  return { workflow, issues: validate(workflow) }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get('intent')

  if (intent !== 'save') {
    return data({ error: 'Only save is allowed before the workflow exists.' }, { status: 400 })
  }

  const raw = form.get('workflow')
  if (typeof raw !== 'string') {
    return data({ error: 'Missing workflow payload.' }, { status: 400 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return data({ error: 'Invalid workflow JSON.' }, { status: 400 })
  }

  const result = WorkflowSchema.safeParse(parsed)
  if (!result.success) {
    return data(
      { error: 'Workflow does not match the schema.', issues: result.error.issues },
      { status: 422 },
    )
  }

  const incoming = result.data
  const issues = validate(incoming)
  if (issues.length > 0 && incoming.status !== 'draft') {
    return data({ error: 'Cannot save non-draft workflow with issues.', issues }, { status: 422 })
  }

  const user = getCurrentUser()
  const workflow = updateWorkflow({ ...incoming, ownerId: user.id, status: 'draft' })
  throw redirect(`/workflows/${workflow.id}`)
}

export default function NewWorkflowPage({ loaderData }: Route.ComponentProps) {
  const { workflow } = loaderData
  return (
    <>
      <EditorHydrator workflow={workflow} />
      <Editor workflow={workflow} isNew />
      <IssuesFooter workflow={workflow} isNew />
    </>
  )
}

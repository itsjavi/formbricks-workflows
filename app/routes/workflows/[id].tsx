import { data, redirect } from 'react-router'

import { Editor } from '@/components/workflows-editor/editor'
import { IssuesFooter } from '@/components/workflows-editor/issues-footer'
import { WorkflowSchema } from '@/lib/workflows/schema'
import { validate } from '@/lib/workflows/validate'
import { deleteWorkflow, getWorkflow, updateWorkflow } from '@/server-mocks'
import { EditorHydrator } from '@/state/editor-hydrator'

import type { Route } from './+types/[id]'

export function meta({ data }: Route.MetaArgs) {
  const name = data?.workflow.name ?? 'Workflow'
  return [{ title: `${name} · Formbricks` }]
}

export function loader({ params }: Route.LoaderArgs) {
  const workflow = getWorkflow(params.id)
  return { workflow, issues: validate(workflow) }
}

export async function action({ params, request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get('intent')

  if (intent === 'delete') {
    deleteWorkflow(params.id)
    throw redirect('/workflows')
  }

  const current = getWorkflow(params.id)

  if (intent === 'rename') {
    const raw = form.get('name')
    const name = typeof raw === 'string' ? raw.trim() : ''
    if (name.length < 1 || name.length > 120) {
      return data({ error: 'Name must be between 1 and 120 characters.' }, { status: 422 })
    }
    updateWorkflow({ ...current, name })
    return { ok: true }
  }

  if (intent === 'enable') {
    const issues = validate(current)
    if (issues.length > 0) {
      return data({ error: 'Resolve issues before enabling.', issues }, { status: 422 })
    }
    updateWorkflow({ ...current, status: 'enabled' })
    return { ok: true }
  }

  if (intent === 'disable') {
    updateWorkflow({ ...current, status: 'disabled' })
    return { ok: true }
  }

  if (intent === 'save') {
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
    updateWorkflow({ ...incoming, id: params.id, ownerId: current.ownerId })
    return { ok: true }
  }

  throw new Response('Unknown intent', { status: 400 })
}

export default function WorkflowEditorPage({ loaderData }: Route.ComponentProps) {
  const { workflow } = loaderData
  return (
    <>
      <EditorHydrator workflow={workflow} />
      <Editor workflow={workflow} />
      <IssuesFooter workflow={workflow} />
    </>
  )
}

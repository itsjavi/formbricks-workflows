import { data, redirect } from 'react-router'

import { humanizeAiError } from '@/lib/workflows/ai-generate'
import { generateCompleteWorkflowDraft, isAiEnabled } from '@/server-mocks'

import type { Route } from './+types/generate'

export async function action({ request }: Route.ActionArgs) {
  if (!isAiEnabled()) {
    return data({ error: 'AI is not configured. Enable it in Settings.' }, { status: 400 })
  }

  const form = await request.formData()
  const prompt = String(form.get('prompt') ?? '').trim()
  if (prompt.length < 4) {
    return data({ error: 'Prompt is too short.' }, { status: 400 })
  }

  try {
    const draft = await generateCompleteWorkflowDraft(prompt)

    throw redirect(`/workflows/${draft.id}?generated=true`)
  } catch (err) {
    if (err instanceof Response) throw err
    return data({ error: humanizeAiError(err) }, { status: 502 })
  }
}

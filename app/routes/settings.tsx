import { AlertCircle, Sparkles } from 'lucide-react'
import { data, useFetcher } from 'react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

import { hasOpenAiApiKey, isAiEnabled, setAiEnabled } from '@/server-mocks'
import type { Route } from './+types/settings'

export function meta() {
  return [{ title: 'Settings · Formbricks' }]
}

export function loader() {
  return { aiEnabled: isAiEnabled(), isApiKeySet: hasOpenAiApiKey() }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get('intent')

  if (intent === 'toggle') {
    const enabled = form.get('enabled') === 'true'
    setAiEnabled(enabled)
    return { ok: true }
  }

  return data({ error: 'Unknown intent.' }, { status: 400 })
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { aiEnabled, isApiKeySet } = loaderData
  const toggleFetcher = useFetcher()
  const formData = toggleFetcher.formData ?? new FormData()

  const optimisticEnabled =
    formData.get('intent') === 'toggle' ? formData.get('enabled') === 'true' : aiEnabled

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <header>
        <div className="label-caps">Workspace</div>
        <h1 className="font-heading mt-2 text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Settings for this demo workspace.
        </p>
      </header>

      <section className="mt-10 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              AI features
            </CardTitle>
            <CardDescription>
              Use an AI model to draft workflows from a natural-language prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Enable AI features</FieldTitle>
                <FieldDescription>
                  If enabled, we will configure your user experience to enable AI features through
                  your workspace.
                </FieldDescription>
              </FieldContent>
              <Switch
                checked={optimisticEnabled}
                disabled={!isApiKeySet}
                onCheckedChange={(checked) => {
                  toggleFetcher.submit(
                    { intent: 'toggle', enabled: String(checked) },
                    { method: 'post' },
                  )
                }}
              />
            </Field>

            {!isApiKeySet && (
              <div className="flex items-start gap-2 rounded-xl bg-red-100 px-3 py-2.5 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  Server issue: The{' '}
                  <code className="rounded bg-red-50 px-1 py-0.5 font-mono text-xs">
                    OPENAI_API_KEY
                  </code>{' '}
                  environment variable is not set.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

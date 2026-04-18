import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { getCurrentUser, hasOpenAiApiKey, isAiEnabled } from '@/server-mocks'

import type { Route } from './+types/root'
import './app.css'
import { SettingsHydrator } from './state/settings-hydrator'

export function loader() {
  return { user: getCurrentUser(), aiEnabled: isAiEnabled(), hasOpenAiApiKey: hasOpenAiApiKey() }
}

export default function App({ loaderData }: Route.ComponentProps) {
  console.log('loaderData', loaderData)
  return (
    <AppShell user={loaderData.user}>
      <SettingsHydrator aiEnabled={loaderData.aiEnabled} />
      <Outlet />
    </AppShell>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="mx-auto max-w-3xl px-8 pt-24">
      <div className="label-caps mb-4">{message}</div>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{details}</p>
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-xl bg-muted p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

import Logo from '@/assets/formbricks-logo.svg?react'
import { Link, NavLink } from 'react-router'

import type { User } from '@/types'

type AppShellProps = {
  user: User
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-8">
          <Link to="/workflows" className="flex items-center gap-2 -mx-4">
            <Logo className="h-10 w-auto aspect-[795/200]" />
            <span className="sr-only">Formbricks</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavItem to="/workflows">Workflows</NavItem>
            <NavItem to="/workflows/templates">Templates</NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <UserChip user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          'font-heading text-sm font-medium transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

function UserChip({ user }: { user: User }) {
  const initials = user.name
    .split(' ')
    .map((segment) => segment[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <div className="text-sm font-medium leading-tight">{user.name}</div>
        <div className="text-[11px] leading-tight text-muted-foreground">{user.email}</div>
      </div>
      <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
        {initials}
      </div>
    </div>
  )
}

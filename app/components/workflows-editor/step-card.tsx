import { cn } from '@/lib/utils'

export function StepCard({
  icon,
  label,
  title,
  subtitle,
  selected,
  onClick,
  children,
  className,
}: {
  icon: React.ReactNode
  label: string
  title: string
  subtitle?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}) {
  const interactive = typeof onClick === 'function'
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      data-selected={selected ? 'true' : undefined}
      className={cn(
        'group/step rounded-2xl bg-card px-6 py-5 transition-all',
        interactive && 'cursor-pointer hover:bg-secondary/60',
        selected && 'ring-2 ring-primary/40',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-caps">{label}</div>
          <div className="font-heading mt-1 truncate text-base font-bold">{title}</div>
          {subtitle !== undefined && subtitle !== '' && (
            <div className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

import { cn } from '@/lib/utils'

export function FlowConnector({ active = false }: { active?: boolean }) {
  return (
    <div className="flex justify-center">
      <div
        className={cn(
          'h-6 w-0.5 rounded-full',
          active ? 'animate-pulse bg-primary/60' : 'bg-muted-foreground/20',
        )}
      />
    </div>
  )
}

import { ClipboardCheck, FileText, UserPlus, UserCog, Webhook, Plus } from 'lucide-react'

type TriggerDefinition = {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'Surveys' | 'Contact' | 'External'
  available: boolean
  badge?: string
}

// only `survey.response.created` is wired up in v1; the rest render as disabled
export const triggerCatalog: TriggerDefinition[] = [
  {
    id: 'survey.response.created',
    label: 'Response Received',
    description: 'Trigger when a user submits any response to a specific survey.',
    icon: FileText,
    category: 'Surveys',
    available: true,
  },
  {
    id: 'survey.completed',
    label: 'Survey Completed',
    description: 'Runs only when the user reaches the thank-you screen of a survey.',
    icon: ClipboardCheck,
    category: 'Surveys',
    available: false,
    badge: 'Soon',
  },
  {
    id: 'contact.created',
    label: 'Contact Created',
    description: 'Fire whenever a new profile is identified in your database.',
    icon: UserPlus,
    category: 'Contact',
    available: false,
    badge: 'Soon',
  },
  {
    id: 'contact.updated',
    label: 'Contact Updated',
    description: 'Trigger when attributes or tags of an existing contact change.',
    icon: UserCog,
    category: 'Contact',
    available: false,
    badge: 'Soon',
  },
  {
    id: 'webhook.received',
    label: 'Webhook Received',
    description: 'Connect external apps. Trigger via an incoming POST request to a unique URL.',
    icon: Webhook,
    category: 'External',
    available: false,
    badge: 'Pro',
  },
]

const categoryOrder: TriggerDefinition['category'][] = ['Surveys', 'Contact', 'External']

export function TriggerCatalog({ onSelect }: { onSelect?: (id: string) => void } = {}) {
  const byCategory = new Map<TriggerDefinition['category'], TriggerDefinition[]>()
  for (const trigger of triggerCatalog) {
    const existing = byCategory.get(trigger.category) ?? []
    existing.push(trigger)
    byCategory.set(trigger.category, existing)
  }

  return (
    <div className="space-y-10">
      {categoryOrder.map((category) => {
        const entries = byCategory.get(category) ?? []
        if (entries.length === 0) return null
        return (
          <section key={category}>
            <h3 className="label-caps">{category}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((trigger) => (
                <TriggerCard key={trigger.id} trigger={trigger} onSelect={onSelect} />
              ))}
              {category === 'External' && <TriggerRequestCard />}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function TriggerCard({
  trigger,
  onSelect,
}: {
  trigger: TriggerDefinition
  onSelect?: (id: string) => void
}) {
  const Icon = trigger.icon
  const clickable = trigger.available && typeof onSelect === 'function'
  return (
    <div
      data-available={trigger.available}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect?.(trigger.id) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect?.(trigger.id)
              }
            }
          : undefined
      }
      className="group relative flex flex-col gap-3 rounded-2xl bg-card p-5 transition-colors data-[available=true]:cursor-pointer data-[available=true]:hover:bg-secondary/60 data-[available=false]:opacity-60"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </div>
        {trigger.badge && (
          <span className="inline-flex h-5 items-center rounded-full bg-amber-100 px-2 text-[10px] font-semibold tracking-wide text-amber-900 uppercase">
            {trigger.badge}
          </span>
        )}
      </div>
      <div>
        <h4 className="font-heading text-base font-bold">{trigger.label}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{trigger.description}</p>
      </div>
    </div>
  )
}

function TriggerRequestCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-muted/60 p-5 text-muted-foreground outline outline-2 outline-dashed outline-muted-foreground/20">
      <div className="flex size-10 items-center justify-center rounded-full bg-card">
        <Plus className="size-4" />
      </div>
      <span className="font-heading text-sm font-semibold">Request a trigger</span>
    </div>
  )
}

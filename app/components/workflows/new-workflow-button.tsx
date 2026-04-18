import { Plus, Wand2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsAiEnabled } from '@/state/settings'

type Props = {
  onAiButtonClick: () => void
}

export function NewWorkflowButton({ onAiButtonClick }: Props) {
  const aiEnabled = useIsAiEnabled()
  const navigate = useNavigate()

  const handleAiButtonClick = () => {
    if (aiEnabled) {
      onAiButtonClick()
    } else {
      navigate('/settings')
    }
  }

  return (
    <div className="inline-flex items-stretch">
      <Button
        size="lg"
        nativeButton={false}
        render={<Link to="/workflows/new" />}
        className={cn('rounded-r-none')}
      >
        <Plus className="size-4" />
        New workflow
      </Button>
      <Button
        type="button"
        size="lg"
        aria-label="Generate workflow with AI"
        onClick={handleAiButtonClick}
        className={cn('rounded-l-none border-l-0', { 'bg-neutral-500': !aiEnabled })}
      >
        <Wand2 className="size-4" />
      </Button>
    </div>
  )
}

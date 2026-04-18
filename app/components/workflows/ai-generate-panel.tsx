import { AlertCircle, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const PROMPT_MIN = 4
const PROMPT_MAX = 500

const promptSchema = z.object({
  prompt: z.string().min(PROMPT_MIN).max(PROMPT_MAX),
})

type Props = {
  id: string
  onClose: () => void
}

export function AiGeneratePanel({ id, onClose }: Props) {
  const [prompt, setPrompt] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isGenerating = false
  const serverError = null
  const error = localError ?? serverError

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)
    const result = promptSchema.safeParse({ prompt: prompt.trim() })
    if (!result.success) {
      setLocalError(`Prompt must be between ${PROMPT_MIN} and ${PROMPT_MAX} characters.`)
      return
    }
    console.log('submit', result.data.prompt)
  }

  return (
    <div
      id={id}
      className={cn([
        'rounded-3xl bg-card p-6 ring-1 ring-foreground/10',
        'animate-in fade-in slide-in-from-top-2 duration-200',
      ])}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="label-caps">AI assistant</div>
              <h3 className="font-heading mt-1 text-lg font-extrabold tracking-tight">
                Describe your workflow
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close AI panel"
              disabled={isGenerating}
            >
              <X className="size-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">{error}</span>
              </div>
            )}

            <Textarea
              ref={textareaRef}
              name="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              readOnly={isGenerating}
              maxLength={PROMPT_MAX}
              placeholder="e.g. Send a Slack message to #promoters when someone gives an NPS score of 9 or 10"
              className="min-h-24"
            />

            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {isGenerating ? 'Crafting your workflow…' : `${prompt.length}/${PROMPT_MAX}`}
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={isGenerating || prompt.trim().length < PROMPT_MIN}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {isGenerating ? 'Generating' : 'Generate'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

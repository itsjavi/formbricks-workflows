import { useSetAtom } from 'jotai'

import { aiEnabledAtom } from '@/state/editor'
import { useEffect } from 'react'

// SSR hydration enabler for global state
export function SettingsHydrator({ aiEnabled }: { aiEnabled: boolean }) {
  const setAiEnabled = useSetAtom(aiEnabledAtom)

  useEffect(() => {
    setAiEnabled(aiEnabled)
  }, [setAiEnabled, aiEnabled])

  return null
}

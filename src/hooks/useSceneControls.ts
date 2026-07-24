import { useContext } from 'react'

import { SceneControlsContext } from '@/context/scene-controls-context'

export function useSceneControls() {
  const ctx = useContext(SceneControlsContext)
  if (!ctx) {
    throw new Error('useSceneControls must be used within SceneControlsProvider')
  }
  return ctx
}

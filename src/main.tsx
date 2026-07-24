import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { preloadScene, prefetchSceneModule } from '@/scene'
import '@/styles/globals.css'

// Kick off HDRI + chunk warm before first paint
preloadScene()
prefetchSceneModule()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

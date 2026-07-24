import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { AmbientSceneBackdrop } from '@/components/common/AmbientSceneBackdrop'
import { BootOverlay } from '@/components/common/BootOverlay'
import { CommandPalette } from '@/components/common/CommandPalette'
import { CustomCursor } from '@/components/common/CustomCursor'
import { EntranceBlurOverlay } from '@/components/common/EntranceBlurOverlay'
import { GrainOverlay } from '@/components/common/GrainOverlay'
import { WarpFadeOverlay } from '@/components/common/WarpFadeOverlay'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { IntroProvider } from '@/context/IntroProvider'
import { SceneControlsProvider } from '@/context/SceneControlsProvider'
import { ScrollProgressProvider } from '@/context/ScrollProgressProvider'
import { SkillHighlightProvider } from '@/context/SkillHighlightProvider'
import { cn } from '@/lib/utils'

/**
 * Client-only WebGL canvas — Vite equivalent of Next.js
 * `dynamic(() => import('./Orb'), { ssr: false })`.
 */
const SceneCanvas = lazy(() => import('@/scene/SceneCanvas'))

type RootLayoutProps = {
  className?: string
}

export function RootLayout({ className }: RootLayoutProps) {
  return (
    <ScrollProgressProvider>
      <IntroProvider>
        <SceneControlsProvider>
          <SkillHighlightProvider>
            {/* z-0: ambient grid / glows / grain — behind the WebGL canvas */}
            <AmbientSceneBackdrop />
            <GrainOverlay />

            {/* z-0: 3D canvas — ambient behind UI (dimmed for text contrast) */}
            <Suspense fallback={null}>
              <SceneCanvas />
            </Suspense>

            {/* z-20: UI overlays, headers, typography */}
            <div
              className={cn(
                'relative z-20 flex min-h-dvh flex-col bg-transparent',
                className,
              )}
            >
              <CustomCursor />
              <Navbar />
              <main className="relative z-20 flex-1 pointer-events-auto">
                <Outlet />
              </main>
              <Footer />
            </div>

            <EntranceBlurOverlay />
            <WarpFadeOverlay />
            <BootOverlay />
            <CommandPalette />
          </SkillHighlightProvider>
        </SceneControlsProvider>
      </IntroProvider>
    </ScrollProgressProvider>
  )
}

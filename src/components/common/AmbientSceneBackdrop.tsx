import { cn } from '@/lib/utils'

/**
 * Fixed ambient layer — hairline grid at near-invisible opacity.
 */
export function AmbientSceneBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-transparent"
    >
      {/* ~0.35% — almost disappears */}
      <div
        className={cn(
          'absolute inset-0 bg-transparent',
          '[background-image:linear-gradient(to_right,rgb(255_255_255/0.0035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.0035)_1px,transparent_1px)]',
          '[background-size:72px_72px]',
          '[mask-image:radial-gradient(ellipse_at_55%_50%,black_8%,transparent_68%)]',
        )}
      />
    </div>
  )
}

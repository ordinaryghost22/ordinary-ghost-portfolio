/**
 * Fixed SVG noise/grain — material, not decoration.
 * Lives on the ambient stack (z-0), behind the WebGL canvas.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
            <filter id='n'>
              <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/>
          </svg>`,
        )}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }}
    />
  )
}

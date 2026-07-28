/**
 * Fixed SVG film grain — almost invisible material across the page.
 * Lives on the ambient stack (z-0), behind the WebGL canvas.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.015] mix-blend-overlay"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
              <filter id='n'>
                <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>
              </filter>
              <rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/>
            </svg>`,
          )}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}

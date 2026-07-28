import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { HeroStars } from '@/components/hero/HeroStars'
import { MoonNight } from '@/components/hero/MoonNight'
import { heroContent } from '@/data/hero'
import { TEXT_LINK_CLASS, TEXT_LINK_UNDERLINE } from '@/lib/editorial'
import { EASE_OUT } from '@/lib/motion'
import {
  navigateWithCameraWarp,
  scrollToSection,
  sectionIdFromHref,
} from '@/lib/scroll'
import { cn } from '@/lib/utils'

const SEQUENCE = {
  moon: 80,
  stars: 40,
  eyebrow: 180,
  line1: 280,
  line2: 400,
  line3: 520,
  supporting: 680,
  cta: 820,
  scroll: 980,
} as const

const TYPE_PARALLAX_MAX = 2
const TYPE_PARALLAX_LERP = 0.05

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/>
    </filter>
    <rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/>
  </svg>`,
)

function FadeUp({
  delayMs,
  active,
  reduceMotion,
  children,
  className,
  as = 'div',
  y = 24,
}: {
  delayMs: number
  active: boolean
  reduceMotion: boolean
  children: ReactNode
  className?: string
  as?: 'div' | 'span' | 'p'
  y?: number
}) {
  const MotionTag =
    as === 'span' ? motion.span : as === 'p' ? motion.p : motion.div

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      animate={
        active
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: reduceMotion ? 0 : y }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.85,
        ease: EASE_OUT,
        delay: reduceMotion || !active ? 0 : delayMs / 1000,
      }}
    >
      {children}
    </MotionTag>
  )
}

/** Soft magnetic follow — translate only, never scale */
function SoftPrimaryLink({
  href,
  children,
  reduceMotion,
  onNavigate,
}: {
  href: string
  children: ReactNode
  reduceMotion: boolean
  onNavigate: () => void
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const active = useRef(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (reduceMotion) return

    const tick = () => {
      const node = btnRef.current
      if (!node) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const lerp = active.current ? 0.14 : 0.16
      current.current.x += (target.current.x - current.current.x) * lerp
      current.current.y += (target.current.y - current.current.y) * lerp

      if (
        !active.current &&
        Math.abs(current.current.x) < 0.03 &&
        Math.abs(current.current.y) < 0.03
      ) {
        current.current.x = 0
        current.current.y = 0
        target.current.x = 0
        target.current.y = 0
      }

      node.style.transform = `translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0)`
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduceMotion])

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !btnRef.current) return
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = event.clientX - cx
    const dy = event.clientY - cy
    const dist = Math.hypot(dx, dy)

    if (dist > 56) {
      active.current = false
      target.current = { x: 0, y: 0 }
      return
    }

    active.current = true
    const strength = 1 - dist / 56
    const max = 3.5
    const inv = dist || 1
    target.current = {
      x: (dx / inv) * max * strength,
      y: (dy / inv) * max * strength,
    }
  }

  const onLeave = () => {
    active.current = false
    target.current = { x: 0, y: 0 }
  }

  return (
    <div
      className={cn(
        'relative inline-flex',
        /* Magnetic hit pad is desktop-only — negative margin overflows on phones */
        !reduceMotion && 'md:p-14 md:-m-14',
      )}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Link
        ref={btnRef}
        to={href}
        className={cn(
          TEXT_LINK_CLASS,
          TEXT_LINK_UNDERLINE,
          'cursor-pointer text-[15px]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--hero-text)]',
        )}
        style={
          reduceMotion
            ? undefined
            : { willChange: 'transform', transition: 'none' }
        }
        onClick={(event) => {
          event.preventDefault()
          onNavigate()
        }}
      >
        {children}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </div>
  )
}

export function Hero() {
  const reduceMotion = !!useReducedMotion()
  const navigate = useNavigate()
  const [contentActive, setContentActive] = useState(reduceMotion)
  const [moonReady, setMoonReady] = useState(reduceMotion)
  const [starsReady, setStarsReady] = useState(reduceMotion)

  const typeTargetX = useRef(0)
  const typeTargetY = useRef(0)
  const typeX = useMotionValue(0)
  const typeY = useMotionValue(0)

  useEffect(() => {
    if (reduceMotion) {
      setContentActive(true)
      setMoonReady(true)
      setStarsReady(true)
      return
    }

    // Let the first paint settle on the hidden state, then play entrance
    let moonTimer = 0
    const start = window.requestAnimationFrame(() => {
      setContentActive(true)
      setStarsReady(true)
      moonTimer = window.setTimeout(() => setMoonReady(true), SEQUENCE.moon)
    })

    return () => {
      window.cancelAnimationFrame(start)
      if (moonTimer) window.clearTimeout(moonTimer)
    }
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) {
      typeTargetX.current = 0
      typeTargetY.current = 0
      typeX.set(0)
      typeY.set(0)
      return
    }

    const onMove = (event: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      if (cx <= 0 || cy <= 0) return
      const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / cx))
      const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / cy))
      /* Opposite of moon — subtle counter-parallax for depth */
      typeTargetX.current = -nx * TYPE_PARALLAX_MAX
      typeTargetY.current = -ny * TYPE_PARALLAX_MAX
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion, typeX, typeY])

  useAnimationFrame(() => {
    if (reduceMotion) {
      typeX.set(0)
      typeY.set(0)
      return
    }
    typeX.set(typeX.get() + (typeTargetX.current - typeX.get()) * TYPE_PARALLAX_LERP)
    typeY.set(typeY.get() + (typeTargetY.current - typeY.get()) * TYPE_PARALLAX_LERP)
  })

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className={cn(
        'og-hero relative overflow-hidden',
        'min-h-[calc(100dvh-5rem)]',
      )}
    >
      {/* Stars — behind moon */}
      <motion.div
        className="absolute inset-0 z-[1]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: starsReady ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : 1,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : SEQUENCE.stars / 1000,
        }}
        aria-hidden
      >
        <HeroStars ready={starsReady} />
      </motion.div>

      {/* Signature moon / globe — slide up + fade in */}
      <motion.div
        className="absolute inset-0 z-[2]"
        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
        animate={
          moonReady
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: reduceMotion ? 0 : 48 }
        }
        transition={{
          duration: reduceMotion ? 0 : 1.15,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : 0.06,
        }}
        aria-hidden
      >
        <MoonNight ready={moonReady} />
      </motion.div>

      {/* Soft veil — dissolves moon into the field, kills hard wedges */}
      <div className="og-hero-moon-veil" aria-hidden />

      {/* Editorial copy — slide up + fade in, staggered */}
      <motion.div
        className={cn(
          'relative z-10 flex w-full flex-col',
          'min-h-[calc(100dvh-5rem)]',
        )}
        style={reduceMotion ? undefined : { x: typeX, y: typeY }}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-7xl flex-1 flex-col justify-start',
            'px-5 pt-12 pb-28 sm:px-6 sm:pt-16 sm:pb-32',
            'md:pt-20',
            'lg:pt-[min(12vh,6rem)] lg:pb-36',
          )}
        >
          <div className="w-full max-w-[36rem] lg:max-w-[42rem]">
            <FadeUp
              delayMs={SEQUENCE.eyebrow}
              active={contentActive}
              reduceMotion={reduceMotion}
              y={18}
              className="og-hero-mono max-w-[28ch] text-[color:var(--hero-text-dim)] sm:max-w-none"
            >
              {heroContent.eyebrow}
            </FadeUp>

            <h1
              id="hero-heading"
              className={cn(
                'og-hero-display mt-8 text-[color:var(--hero-text)] sm:mt-10',
                'text-[clamp(2.75rem,11vw,6.5rem)] md:text-[clamp(3.25rem,8.6vw,6.5rem)]',
              )}
            >
              <FadeUp
                as="span"
                className="block"
                delayMs={SEQUENCE.line1}
                active={contentActive}
                reduceMotion={reduceMotion}
                y={28}
              >
                {heroContent.headline.line1}
              </FadeUp>
              <FadeUp
                as="span"
                className="mt-[0.18em] block"
                delayMs={SEQUENCE.line2}
                active={contentActive}
                reduceMotion={reduceMotion}
                y={28}
              >
                {heroContent.headline.line2}
              </FadeUp>
              <FadeUp
                as="span"
                className="mt-[0.18em] block"
                delayMs={SEQUENCE.line3}
                active={contentActive}
                reduceMotion={reduceMotion}
                y={28}
              >
                {heroContent.headline.line3Before}
                <em className="og-hero-display-italic">
                  {heroContent.headline.line3Italic}
                </em>
                {heroContent.headline.line3After}
              </FadeUp>
            </h1>

            <FadeUp
              as="p"
              delayMs={SEQUENCE.supporting}
              active={contentActive}
              reduceMotion={reduceMotion}
              y={20}
              className={cn(
                'mt-8 max-w-[40ch] sm:mt-12',
                'text-[15px] leading-[1.7] tracking-[-0.011em] sm:text-[17px]',
                'text-zinc-400',
              )}
            >
              <span className="block">{heroContent.supporting[0]}</span>
              <span className="mt-2 block text-zinc-400">
                {heroContent.supporting[1]}
              </span>
            </FadeUp>

            <FadeUp
              delayMs={SEQUENCE.cta}
              active={contentActive}
              reduceMotion={reduceMotion}
              y={18}
              className={cn(
                'mt-8 flex flex-col items-start gap-4',
                'sm:mt-12 sm:flex-row sm:items-center sm:gap-8',
              )}
            >
              <SoftPrimaryLink
                href={heroContent.primaryCta.href}
                reduceMotion={reduceMotion}
                onNavigate={() => {
                  navigate(heroContent.primaryCta.href)
                  requestAnimationFrame(() => {
                    navigateWithCameraWarp(
                      sectionIdFromHref(heroContent.primaryCta.href),
                    )
                  })
                }}
              >
                {heroContent.primaryCta.label}
              </SoftPrimaryLink>

              <a
                href={heroContent.secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  TEXT_LINK_CLASS,
                  TEXT_LINK_UNDERLINE,
                  'cursor-pointer text-[15px]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--hero-text)]',
                )}
              >
                <span>{heroContent.secondaryCta.label}</span>
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            </FadeUp>
          </div>
        </div>

        <FadeUp
          delayMs={SEQUENCE.scroll}
          active={contentActive}
          reduceMotion={reduceMotion}
          y={12}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pb-4 sm:bottom-10 sm:pb-6"
        >
          <button
            type="button"
            aria-label="Scroll to work"
            onClick={() => {
              navigate('/#work')
              requestAnimationFrame(() => {
                scrollToSection('work')
              })
            }}
            className={cn(
              'og-hero-scroll-label flex cursor-pointer flex-col items-center gap-1.5',
              'focus-visible:outline-none focus-visible:opacity-70',
            )}
          >
            <span aria-hidden className="og-hero-scroll-chevron">
              ↓
            </span>
            <span>Scroll</span>
          </button>
        </FadeUp>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[20] opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </section>
  )
}

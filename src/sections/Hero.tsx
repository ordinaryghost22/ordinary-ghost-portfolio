import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import {
  DecryptText,
  MagneticAnchor,
  MagneticLink,
  Typewriter,
} from '@/components/common'
import { HudStatusBar } from '@/components/common/HudStatusBar'
import { useIntro } from '@/hooks/useIntro'
import { useEffectiveLowPower } from '@/hooks/useEffectiveLowPower'
import { socialBadgeClassName, socialLinks } from '@/data/contact'
import { heroContent } from '@/data/hero'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  REVEAL_DURATION,
  REVEAL_STAGGER,
  fadeUp,
  staggerContainer,
} from '@/lib/motion'
import {
  navigateWithCameraWarp,
  sectionIdFromHref,
} from '@/lib/scroll'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

const HUD_LABELS = [
  { pos: 'left-4 top-4 sm:left-6 sm:top-6', text: 'X 00.00 · Y 00.00' },
  { pos: 'right-4 top-4 sm:right-6 sm:top-6', text: 'FOV 42° · Z −1.45' },
  { pos: 'bottom-4 left-4 sm:bottom-6 sm:left-6', text: 'N41.0082 · E71.6061' },
  { pos: 'bottom-4 right-4 sm:bottom-6 sm:right-6', text: 'T+00:00 · HDRI 0.05' },
] as const

/** HUD chrome only — ambient grid/glows live at root z-0 behind the canvas */
function HeroHudLabels() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-transparent"
      aria-hidden
    >
      {HUD_LABELS.map((label) => (
        <span
          key={label.text}
          className={cn(
            'absolute font-mono text-[9px] tracking-[0.18em] text-white/25 uppercase sm:text-[10px]',
            label.pos,
          )}
        >
          {label.text}
        </span>
      ))}
    </div>
  )
}

const ctaClass = {
  primary: cn(
    'og-btn og-interactive h-11 gap-2 rounded-full px-5',
    'font-mono text-xs font-medium tracking-wider text-primary-foreground uppercase',
    'hover:brightness-110',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
    'max-md:min-w-0 max-md:flex-1 max-md:justify-center',
  ),
  secondary: cn(
    'og-btn og-interactive h-11 gap-2 rounded-full px-5',
    'font-mono text-xs font-medium tracking-wider text-foreground uppercase',
    'border border-amber-500/20 bg-white/5 backdrop-blur-md',
    'hover:border-amber-400/50 hover:bg-amber-400/10 transition-all',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
    'max-md:min-w-0 max-md:flex-1 max-md:justify-center',
  ),
}

const HERO_TEXT_SHADOW = 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'

const TYPE_SPEED_MS = 18

function useHeroSequence(compact: boolean, useEntrance: boolean) {
  const factor = compact ? 0.75 : 1
  const parentStagger = REVEAL_STAGGER * factor
  const roleStagger = (compact ? 0.04 : 0.06) * factor
  const roleDelay = 0.02 * factor
  const roleCount = heroContent.roles.length

  const rolesGroupStart = parentStagger * 1
  const lastRoleStart =
    rolesGroupStart + roleDelay + roleStagger * Math.max(0, roleCount - 1)
  const rolesCompleteSec = lastRoleStart + REVEAL_DURATION

  const typewriterStartMs = useEntrance
    ? Math.round(rolesCompleteSec * 1000)
    : 0
  const typeDurationMs = heroContent.description.length * TYPE_SPEED_MS
  const buttonsDelaySec = useEntrance
    ? (typewriterStartMs + typeDurationMs + 120) / 1000
    : 0
  const socialDelaySec = useEntrance ? buttonsDelaySec + 0.18 : 0

  return { typewriterStartMs, buttonsDelaySec, socialDelaySec }
}

export function Hero() {
  const reduceMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 640px)')
  const lowPower = useEffectiveLowPower()
  const navigate = useNavigate()
  const { heroReady, playIntro, phase } = useIntro()
  const useEntrance = playIntro
  const preloaderActive = playIntro && phase === 'boot'
  const heroLayerVisible = !preloaderActive
  const { typewriterStartMs, buttonsDelaySec, socialDelaySec } = useHeroSequence(
    compact,
    useEntrance && !reduceMotion,
  )

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-transparent pt-4 md:pt-0"
    >
      <motion.div
        className="absolute inset-0 z-20"
        initial={false}
        animate={{ opacity: heroLayerVisible ? 1 : 0 }}
        transition={{
          duration: heroLayerVisible ? 0.55 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ pointerEvents: heroLayerVisible ? 'auto' : 'none' }}
        aria-hidden={preloaderActive}
      >
        <HeroHudLabels />

        <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-12 lg:grid-cols-12">
          {/* Left — glass HUD copy card */}
          <div className="z-10 lg:col-span-5">
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl border border-neutral-800/80',
                'bg-neutral-950/75 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8',
                // Golden top-edge accent
                'after:absolute after:top-0 after:left-1/4 after:h-px after:w-1/2',
                'after:bg-gradient-to-r after:from-transparent after:via-amber-400/60 after:to-transparent',
              )}
            >
              <div className="relative z-[1] flex flex-col items-start text-left">
                <motion.div
                  variants={staggerContainer({
                    reduceMotion: !useEntrance,
                    compact,
                  })}
                  initial={useEntrance ? 'hidden' : false}
                  animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
                >
                  <motion.div
                    variants={fadeUp({
                      reduceMotion: !useEntrance,
                    })}
                    className="flex justify-start"
                  >
                    <span
                      className={cn(
                        'inline-flex max-w-full items-center rounded-full border border-primary/30',
                        'bg-primary/10 px-3 py-1.5 font-mono text-[9px] tracking-[0.14em] text-primary uppercase sm:text-[10px]',
                        'shadow-[0_0_20px_-4px_rgb(198_161_91/0.55)]',
                        HERO_TEXT_SHADOW,
                      )}
                    >
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-400"
                        aria-hidden
                      />
                      <span className="truncate">{heroContent.badge}</span>
                    </span>
                  </motion.div>

                  <motion.div
                    variants={fadeUp({
                      reduceMotion: !useEntrance,
                    })}
                    className="mt-5 sm:mt-6"
                  >
                    <DecryptText
                      as="h1"
                      id="hero-heading"
                      text={heroContent.headline}
                      tickMs={compact ? 20 : 26}
                      delayMs={0}
                      active={heroReady && useEntrance}
                      className={cn(
                        'font-display text-5xl font-bold tracking-[-0.03em] leading-[0.85] text-balance text-left lg:text-7xl',
                        'bg-[linear-gradient(105deg,#ffffff_0%,#f5f4f0_22%,#c6a15b_52%,#f5f4f0_78%,#ffffff_100%)]',
                        'bg-clip-text text-transparent',
                        '[background-size:140%_100%]',
                        HERO_TEXT_SHADOW,
                      )}
                    />
                    <p
                      className={cn(
                        'my-3 border-l-2 border-amber-500/50 pl-3 text-left',
                        'font-mono text-sm font-medium text-neutral-200 drop-shadow-sm',
                        HERO_TEXT_SHADOW,
                      )}
                    >
                      {heroContent.founderLine}
                    </p>
                  </motion.div>

                  <motion.ul
                    variants={staggerContainer({
                      stagger: compact ? 0.04 : 0.05,
                      delay: 0.02,
                      reduceMotion: !useEntrance,
                      compact,
                    })}
                    className="my-4 flex flex-wrap items-center justify-start gap-3"
                  >
                    {heroContent.roles.map((role, index) => (
                      <motion.li
                        key={role}
                        variants={fadeUp({
                          reduceMotion: !useEntrance,
                          y: 10,
                          duration: 0.45,
                        })}
                      >
                        <span
                          className={cn(
                            'font-mono text-xs uppercase tracking-widest',
                            HERO_TEXT_SHADOW,
                            index === 0
                              ? 'border-l-2 border-amber-400 bg-amber-400/10 px-3 py-1.5 font-semibold text-amber-300 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)]'
                              : 'border-b border-neutral-700/80 px-2 py-1 text-neutral-200 transition-colors hover:border-amber-400/50 hover:text-amber-300',
                          )}
                        >
                          {role}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>

                <p
                  className={cn(
                    'mt-6 max-w-xl text-left text-pretty sm:mt-8',
                    'text-sm font-normal leading-relaxed text-slate-200 sm:text-base',
                    HERO_TEXT_SHADOW,
                  )}
                >
                  <Typewriter
                    text={heroContent.description}
                    speed={TYPE_SPEED_MS}
                    startDelay={typewriterStartMs}
                    enabled={useEntrance}
                    active={heroReady}
                    className="text-left"
                  />
                </p>

                <motion.div
                  variants={fadeUp({
                    reduceMotion: !useEntrance,
                    delay: buttonsDelaySec,
                  })}
                  initial={useEntrance ? 'hidden' : false}
                  animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
                  className="mt-8 flex w-full flex-row items-center gap-3"
                >
                  <MagneticLink
                    to={heroContent.primaryCta.href}
                    data-cursor="view"
                    data-magnetic
                    depthGlyph={<span className="text-[0.95em]">→</span>}
                    containerClassName="min-w-0 flex-1 sm:flex-none"
                    className={cn(
                      ctaClass.primary,
                      'w-full',
                      lowPower ? 'og-glass-cta-fallback' : 'og-glass-cta',
                    )}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(heroContent.primaryCta.href)
                      requestAnimationFrame(() => {
                        navigateWithCameraWarp(
                          sectionIdFromHref(heroContent.primaryCta.href),
                        )
                      })
                    }}
                  >
                    {heroContent.primaryCta.label}
                  </MagneticLink>

                  <MagneticAnchor
                    href={heroContent.secondaryCta.href}
                    download={heroContent.secondaryCta.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-magnetic
                    depthGlyph={<span className="text-[0.85em]">↓</span>}
                    containerClassName="min-w-0 flex-1 sm:flex-none"
                    className={cn(ctaClass.secondary, 'w-full')}
                  >
                    {heroContent.secondaryCta.label}
                  </MagneticAnchor>
                </motion.div>

                <motion.ul
                  variants={fadeUp({
                    reduceMotion: !useEntrance,
                    delay: socialDelaySec,
                  })}
                  initial={useEntrance ? 'hidden' : false}
                  animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
                  className={cn(
                    'mt-5 flex w-full items-center justify-start gap-2 overflow-x-auto pb-1',
                    'font-mono text-xs',
                    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  )}
                >
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <li key={link.label} className="shrink-0">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          data-magnetic
                          onPointerEnter={() => {
                            void playUiSound('hover')
                          }}
                          onClick={() => {
                            void playUiSound('click')
                          }}
                          className={cn(
                            socialBadgeClassName,
                            'border-neutral-800/80 px-3 py-1.5 text-xs font-mono whitespace-nowrap text-neutral-300',
                            'hover:border-amber-400/50 hover:text-amber-300',
                            HERO_TEXT_SHADOW,
                          )}
                        >
                          <Icon className="size-3.5 shrink-0" />
                          <span>{link.label}</span>
                        </a>
                      </li>
                    )
                  })}
                </motion.ul>
              </div>
            </div>
          </div>

          {/* Right — canvas breath / orb stage */}
          <div
            className="pointer-events-none relative hidden h-[500px] items-center justify-center lg:col-span-7 lg:flex lg:h-[650px]"
            aria-hidden
          />
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-4 z-20 px-6 sm:bottom-6"
          variants={fadeUp({
            reduceMotion: !useEntrance,
            delay: socialDelaySec + 0.08,
            y: 12,
          })}
          initial={useEntrance ? 'hidden' : false}
          animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
        >
          <div className="mx-auto max-w-7xl">
            <HudStatusBar variant="hero" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

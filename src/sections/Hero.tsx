import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import {
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

const ctaClass = {
  primary: cn(
    'og-btn og-interactive h-11 w-full justify-center gap-1.5 rounded-full px-2',
    'font-mono text-[11px] font-medium tracking-wider text-primary-foreground uppercase',
    'hover:brightness-110',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
    'md:w-auto md:gap-2 md:px-5 md:text-xs',
  ),
  secondary: cn(
    'og-btn og-interactive h-11 w-full justify-center gap-1.5 rounded-full px-2',
    'font-mono text-[11px] font-medium tracking-wider text-foreground uppercase',
    'border border-amber-500/20 bg-white/5 backdrop-blur-md',
    'hover:border-amber-400/50 hover:bg-amber-400/10 transition-all',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
    'md:w-auto md:gap-2 md:px-5 md:text-xs',
  ),
}

const TYPE_SPEED_MS = 18

function useHeroSequence(compact: boolean, useEntrance: boolean) {
  const factor = compact ? 0.75 : 1
  const parentStagger = REVEAL_STAGGER * factor
  const rolesCompleteSec = parentStagger * 1 + REVEAL_DURATION

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
      className={cn(
        'relative flex items-stretch bg-transparent',
        /* Mobile: height = content only (kills the black void) */
        'min-h-0 max-md:overflow-x-clip',
        /* Desktop: full viewport stage — allow title glyphs to paint fully */
        'md:min-h-[calc(100dvh-4rem)] md:overflow-x-visible',
      )}
    >
      <motion.div
        className={cn(
          'z-20 flex w-full flex-col',
          'relative',
          'md:min-h-[calc(100dvh-4rem)]',
          'lg:absolute lg:inset-0 lg:min-h-0',
        )}
        initial={false}
        animate={{ opacity: heroLayerVisible ? 1 : 0 }}
        transition={{
          duration: heroLayerVisible ? 0.55 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ pointerEvents: heroLayerVisible ? 'auto' : 'none' }}
        aria-hidden={preloaderActive}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-7xl flex-col',
            /* Dense packed stack — no flex-1 stretch on mobile */
            'gap-0 px-4 pt-3 pb-4',
            'md:flex-1 md:justify-center md:gap-8 md:px-6 md:py-10',
            'lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-12',
          )}
        >
          <div className="@container/hero relative z-10 flex w-full min-w-0 flex-col items-stretch text-left lg:col-span-5">
            <motion.div
              variants={staggerContainer({
                reduceMotion: !useEntrance,
                compact,
              })}
              initial={useEntrance ? 'hidden' : false}
              animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
              className="flex w-full min-w-0 flex-col items-start"
            >
              <motion.div
                variants={fadeUp({ reduceMotion: !useEntrance })}
                className="flex w-full min-w-0 flex-col gap-2"
              >
                <span
                  className={cn(
                    'inline-flex max-w-full items-center gap-1.5',
                    'font-mono text-[9px] tracking-[0.18em] text-amber-300/90 uppercase',
                  )}
                >
                  <span
                    className="size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400"
                    aria-hidden
                  />
                  <span className="truncate">{heroContent.badge}</span>
                </span>

                <ul
                  className={cn(
                    'flex w-full items-center gap-1.5 overflow-x-auto',
                    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                    'md:hidden',
                  )}
                >
                  {heroContent.roles.map((role, index) => (
                    <li key={role} className="shrink-0">
                      <span
                        className={cn(
                          'inline-flex items-center border px-2 py-0.5',
                          'font-mono text-[8px] tracking-[0.14em] uppercase',
                          index === 0
                            ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
                            : 'border-neutral-700/80 bg-black/40 text-neutral-400 backdrop-blur-sm',
                        )}
                      >
                        {role}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.h1
                id="hero-heading"
                className={cn(
                  'mt-3 w-full min-w-0 overflow-visible font-[family-name:var(--font-syne)] text-left md:mt-5',
                  'font-extrabold uppercase tracking-tight leading-[0.9]',
                  /* Size to the column so "ORDINARY" never clips the Y */
                  'text-[clamp(2rem,8.5vw,2.45rem)]',
                  'md:text-[clamp(2.2rem,9.5cqi,2.65rem)]',
                  'lg:text-[clamp(2.35rem,9cqi,2.75rem)]',
                )}
                initial={
                  useEntrance && !reduceMotion
                    ? { opacity: 0, y: 14 }
                    : false
                }
                animate={
                  !useEntrance || reduceMotion || heroReady
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 14 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: reduceMotion || !useEntrance ? 0 : 0.12,
                }}
              >
                <span className="block overflow-visible whitespace-nowrap bg-gradient-to-br from-white via-amber-50 to-amber-400 bg-clip-text pr-[0.06em] text-transparent">
                  Ordinary
                </span>
                <span className="mt-0.5 block overflow-visible whitespace-nowrap pr-[0.06em] text-amber-200/95">
                  Ghost
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp({ reduceMotion: !useEntrance })}
                className="mt-2.5 max-w-md text-pretty font-mono text-[11px] leading-snug tracking-wide text-neutral-400 md:mt-4 md:text-[13px] md:leading-relaxed"
              >
                {heroContent.founderLine}
              </motion.p>

              <motion.p
                variants={fadeUp({ reduceMotion: !useEntrance })}
                className="mt-3 hidden max-w-full font-mono text-[10px] tracking-[0.22em] text-neutral-500 uppercase md:block"
              >
                {heroContent.roles.join(' · ')}
              </motion.p>
            </motion.div>

            <div
              className={cn(
                'relative z-10 mt-4 w-full min-w-0 md:mt-7',
                'rounded-2xl border border-white/10 bg-black/55 px-4 py-4 shadow-2xl backdrop-blur-sm',
                'md:border-neutral-800/70 md:bg-neutral-950/70 md:p-6 md:backdrop-blur-xl',
              )}
            >
              <p className="max-w-prose text-left text-pretty text-[12.5px] leading-relaxed text-neutral-300 md:text-[15px] md:leading-relaxed">
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
                className="mt-4 grid w-full grid-cols-2 gap-2.5 md:mt-6 md:flex md:flex-row md:items-center md:justify-start md:gap-3"
              >
                <MagneticLink
                  to={heroContent.primaryCta.href}
                  data-cursor="view"
                  data-magnetic
                  depthGlyph={<span className="text-[0.95em]">→</span>}
                  containerClassName="min-w-0 w-full md:w-auto md:flex-none"
                  className={cn(
                    ctaClass.primary,
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
                  containerClassName="min-w-0 w-full md:w-auto md:flex-none"
                  className={ctaClass.secondary}
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
                  'mt-3.5 flex w-full flex-nowrap items-center justify-start gap-1.5 overflow-x-auto',
                  'font-mono text-xs',
                  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  'md:mt-5 md:gap-2 md:overflow-visible',
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
                          'border-neutral-800/80 bg-black/30 px-2.5 py-1 text-[10px] font-mono whitespace-nowrap text-neutral-400 backdrop-blur-sm',
                          'hover:border-amber-400/50 hover:text-amber-300',
                          'md:bg-transparent md:px-3 md:py-1.5 md:text-xs md:backdrop-blur-none',
                        )}
                      >
                        <Icon className="size-3 shrink-0 md:size-3.5" />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  )
                })}
              </motion.ul>
            </div>

            {/* Telemetry in-flow on mobile — no absolute void */}
            <motion.div
              className="mt-4 md:hidden"
              variants={fadeUp({
                reduceMotion: !useEntrance,
                delay: socialDelaySec + 0.08,
                y: 6,
              })}
              initial={useEntrance ? 'hidden' : false}
              animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
            >
              <HudStatusBar variant="hero" />
            </motion.div>
          </div>

          <div
            className="pointer-events-none relative hidden h-full min-h-[520px] items-center justify-center lg:col-span-7 lg:flex"
            aria-hidden
          />
        </div>

        {/* Desktop telemetry only */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 hidden px-6 md:block"
          variants={fadeUp({
            reduceMotion: !useEntrance,
            delay: socialDelaySec + 0.08,
            y: 8,
          })}
          initial={useEntrance ? 'hidden' : false}
          animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
        >
          <div className="mx-auto max-w-7xl overflow-hidden">
            <HudStatusBar variant="hero" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

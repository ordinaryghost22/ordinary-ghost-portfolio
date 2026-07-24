import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import {
  DecryptText,
  MagneticAnchor,
  MagneticLink,
  TextBackdrop,
  Typewriter,
} from '@/components/common'
import { HudStatusBar } from '@/components/common/HudStatusBar'
import { useIntro } from '@/hooks/useIntro'
import { useEffectiveLowPower } from '@/hooks/useEffectiveLowPower'
import { socialLinks } from '@/data/contact'
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
    'og-btn og-interactive h-11 gap-2 rounded-full px-6 text-sm text-primary-foreground',
    'hover:brightness-110',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
  ),
  secondary: cn(
    'og-btn og-interactive h-11 gap-2 rounded-full px-6 text-sm text-foreground',
    'border border-amber-500/20 bg-white/5 backdrop-blur-md',
    'hover:border-amber-400/50 hover:bg-amber-400/10 transition-all',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
  ),
}

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
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-transparent"
    >
      {/*
        Hard-hide hero UI while the preloader is up (opacity 0 + no hits).
        Fade in only after boot exit completes (phase leaves 'boot').
      */}
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

        {/*
          Asymmetric 5 / 7 split: copy at z-20, right rail reserves space for
          the fixed WebGL orb (root z-10) so typography never fights the mesh.
        */}
        <div className="relative z-20 mx-auto grid w-full max-w-6xl grid-cols-1 items-center px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-28">
          <TextBackdrop className="mx-auto w-full max-w-xl text-center lg:col-span-5 lg:mx-0 lg:max-w-none lg:text-left">
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
                className="flex justify-center lg:justify-start"
              >
                <span
                  className={cn(
                    'inline-flex max-w-full items-center rounded-full border border-primary/30',
                    'bg-primary/10 px-3 py-1.5 font-mono text-[9px] tracking-[0.14em] text-primary uppercase sm:text-[10px]',
                    'shadow-[0_0_20px_-4px_rgb(198_161_91/0.55)]',
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
                    'font-display text-5xl font-bold tracking-[-0.03em] leading-[0.85] text-balance lg:text-7xl',
                    'bg-[linear-gradient(105deg,#ffffff_0%,#f5f4f0_22%,#c6a15b_52%,#f5f4f0_78%,#ffffff_100%)]',
                    'bg-clip-text text-transparent',
                    '[background-size:140%_100%]',
                  )}
                />
                <p
                  className={cn(
                    'my-3 border-l-2 border-amber-500/50 pl-3',
                    'font-mono text-sm text-neutral-400',
                    'text-left',
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
                className="my-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
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
                        index === 0
                          ? 'border-l-2 border-amber-400 bg-amber-400/10 px-3 py-1.5 font-semibold text-amber-300 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)]'
                          : 'border-b border-neutral-700/80 px-2 py-1 text-neutral-400 transition-colors hover:border-amber-400/50 hover:text-amber-300',
                      )}
                    >
                      {role}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:mt-8 sm:text-lg lg:mx-0">
              <Typewriter
                text={heroContent.description}
                speed={TYPE_SPEED_MS}
                startDelay={typewriterStartMs}
                enabled={useEntrance}
                active={heroReady}
                className="text-center lg:text-left"
              />
            </p>

            <motion.div
              variants={fadeUp({
                reduceMotion: !useEntrance,
                delay: buttonsDelaySec,
              })}
              initial={useEntrance ? 'hidden' : false}
              animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row lg:justify-start"
            >
              <MagneticLink
                to={heroContent.primaryCta.href}
                data-cursor="view"
                data-magnetic
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
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start"
            >
              {socialLinks.map((link) => (
                <li key={link.label}>
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
                      'cursor-pointer font-mono text-xs text-neutral-500',
                      'transition-colors duration-300 hover:text-amber-400',
                      'focus-visible:text-amber-400 focus-visible:outline-none',
                    )}
                  >
                    {link.hudLabel}
                  </a>
                </li>
              ))}
            </motion.ul>
          </TextBackdrop>

          {/* Right column — layout breath for the fixed WebGL canvas */}
          <div
            className="pointer-events-none relative hidden min-h-[320px] lg:col-span-7 lg:block"
            aria-hidden
          />
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-4 z-20 px-4 sm:bottom-6 sm:px-6 lg:px-8"
          variants={fadeUp({
            reduceMotion: !useEntrance,
            delay: socialDelaySec + 0.08,
            y: 12,
          })}
          initial={useEntrance ? 'hidden' : false}
          animate={heroReady || !useEntrance ? 'visible' : 'hidden'}
        >
          <div className="mx-auto max-w-6xl">
            <HudStatusBar variant="hero" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

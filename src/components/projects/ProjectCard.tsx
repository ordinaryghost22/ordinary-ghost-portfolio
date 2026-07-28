import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

export type ProjectCardProps = {
  year: string
  title: string
  description: string
  tags: string[]
  screenshotSrc: string
  href: string
  /** Opt-in grayscale → color reveal on desktop hover */
  hasColorReveal: boolean
  url?: string
  className?: string
  dimmed?: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1]
const HOVER_MS = 0.35

/**
 * Selected Work card — browser chrome + always-visible meta.
 * Whole card navigates to the case study.
 */
export function ProjectCard({
  year,
  title,
  description,
  tags,
  screenshotSrc,
  href,
  hasColorReveal,
  url = 'app.ordinaryghost.dev',
  className,
  dimmed = false,
}: ProjectCardProps) {
  const navigate = useNavigate()
  const reduceMotion = !!useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const cardRef = useRef<HTMLButtonElement>(null)
  const [fullyVisible, setFullyVisible] = useState(true)

  const idleGrayscale = isDesktop
  const revealOnHover = hasColorReveal && isDesktop

  useEffect(() => {
    if (!isDesktop) {
      setFullyVisible(true)
      return
    }

    const el = cardRef.current
    if (!el) return

    const root = el.closest('.og-selected-work')
    if (!(root instanceof Element)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setFullyVisible(entry.intersectionRatio >= 0.9)
      },
      { root, threshold: [0, 0.5, 0.9, 1] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isDesktop])

  const depthScale = !isDesktop || fullyVisible ? 1 : 0.96
  const depthOpacity = dimmed ? 0.4 : !isDesktop || fullyVisible ? 1 : 0.7

  const openCaseStudy = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    void playUiSound('click')
    navigate(href)
  }

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onPointerEnter={() => {
        void playUiSound('hover')
      }}
      onClick={openCaseStudy}
      className={cn(
        'project-card group relative block w-full shrink-0 cursor-pointer text-left md:w-[min(78vw,520px)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0B0E]',
        className,
      )}
      aria-label={`${title} — View case study`}
      animate={
        reduceMotion
          ? { scale: 1, opacity: dimmed ? 0.4 : 1 }
          : { scale: depthScale, opacity: depthOpacity }
      }
      whileHover={
        reduceMotion || !isDesktop
          ? undefined
          : { y: -6, scale: fullyVisible ? 1.03 : 0.98 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{
        duration: reduceMotion ? 0 : HOVER_MS,
        ease: EASE_OUT_EXPO,
      }}
    >
      {/* Browser chrome frame */}
      <div
        className={cn(
          'overflow-hidden rounded-[16px] border border-zinc-800/80 bg-[#111111]',
          'transition-[box-shadow] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          'shadow-[0_20px_40px_rgba(0,0,0,0.3)]',
          'group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)]',
          hasColorReveal &&
            'shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_80px_20px_rgba(244,60,92,0.04)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_100px_28px_rgba(244,60,92,0.07)]',
        )}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800/80 px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-[#6B4545]" />
            <span className="size-2 rounded-full bg-[#6B6345]" />
            <span className="size-2 rounded-full bg-[#456B4A]" />
          </div>
          <div className="min-w-0 flex-1 truncate text-center text-[12px] text-zinc-500">
            {url}
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0B0E]">
          <img
            src={screenshotSrc}
            alt=""
            decoding="async"
            className={cn(
              'h-full w-full object-cover object-top',
              'transition-[filter,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'group-hover:scale-[1.02]',
              idleGrayscale && 'grayscale',
              revealOnHover &&
                'group-hover:grayscale-0 group-focus-visible:grayscale-0',
            )}
          />
          {/* Soft dark veil — lifts on hover so light screenshots don't blow out the canvas */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 bg-[#0A0B0E]/45',
              'transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'group-hover:opacity-0 group-focus-visible:opacity-0',
              !isDesktop && 'opacity-0',
            )}
          />
        </div>
      </div>

      {/* Always-visible meta */}
      <div className="flex flex-col pt-8">
        <p className="font-['IBM_Plex_Mono',ui-monospace,monospace] text-xs tracking-widest text-zinc-400 uppercase">
          {year}
        </p>
        <h3 className="mt-4 text-[clamp(1.5rem,2.8vw,2rem)] font-medium leading-[1.1] tracking-[-0.03em] text-zinc-50">
          {title}
        </h3>
        <p className="mt-3 max-w-[36ch] text-[14px] leading-[1.6] tracking-[-0.011em] text-zinc-400">
          {description}
        </p>
        <p className="mt-5 text-[12px] tracking-[0.04em] text-zinc-500">
          {tags.join(' · ')}
        </p>
        <span
          className={cn(
            'mt-8 inline-flex items-center gap-2 text-[14px] font-medium tracking-[-0.01em]',
            'text-zinc-400 transition-colors duration-200',
            'group-hover:text-white',
          )}
        >
          Explore case study
          <span
            aria-hidden
            className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]"
          >
            →
          </span>
        </span>
      </div>
    </motion.button>
  )
}

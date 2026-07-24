import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from 'framer-motion'
import { type RefObject, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const REVEAL = {
  y: 60,
  opacity: 0,
  duration: 1,
  stagger: 0.15,
  ease: 'power3.out',
} as const

/**
 * Staggered scroll reveal for cards / pills / contact blocks.
 * Client-only via useGSAP; no-ops when prefers-reduced-motion is on.
 */
export function useGsapStaggerReveal(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  deps: unknown[] = [],
) {
  const reduceMotion = useReducedMotion()

  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root || reduceMotion) return

      const targets = root.querySelectorAll(selector)
      if (!targets.length) return

      gsap.fromTo(
        targets,
        {
          y: REVEAL.y,
          opacity: REVEAL.opacity,
        },
        {
          y: 0,
          opacity: 1,
          duration: REVEAL.duration,
          stagger: REVEAL.stagger,
          ease: REVEAL.ease,
          // Clear both so remount / Strict Mode never leaves opacity:0 stuck
          clearProps: 'transform,opacity',
          immediateRender: false,
          scrollTrigger: {
            trigger: root,
            start: 'top 82%',
            once: true,
            invalidateOnRefresh: true,
            toggleActions: 'play none none none',
          },
        },
      )
    },
    {
      scope: scopeRef,
      dependencies: [reduceMotion, selector, ...deps],
      revertOnUpdate: true,
    },
  )
}

/**
 * Subtle scrubbed parallax for section headings / backdrop type.
 */
export function useGsapParallaxScrub(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  amount = 40,
) {
  const reduceMotion = useReducedMotion()

  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root || reduceMotion) return

      const targets = root.querySelectorAll(selector)
      if (!targets.length) return

      gsap.fromTo(
        targets,
        { y: amount * 0.35 },
        {
          y: -amount,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      )
    },
    {
      scope: scopeRef,
      dependencies: [reduceMotion, selector, amount],
      revertOnUpdate: true,
    },
  )
}

/** Convenience: section-scoped ref for GSAP hooks */
export function useGsapSectionRef<T extends HTMLElement = HTMLElement>() {
  return useRef<T>(null)
}

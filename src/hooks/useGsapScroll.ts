import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from 'framer-motion'
import { type RefObject, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Match Framer reveal language — quiet, never theatrical */
const REVEAL = {
  y: 14,
  opacity: 0,
  duration: 0.55,
  stagger: 0.1,
  ease: 'power2.out',
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
          clearProps: 'transform,opacity',
          immediateRender: false,
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
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
 * Kept small so scroll never feels like a ride.
 */
export function useGsapParallaxScrub(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  amount = 18,
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
        { y: amount * 0.25 },
        {
          y: -amount,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
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

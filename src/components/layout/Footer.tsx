import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

import { DecryptText } from '@/components/common/DecryptText'
import { HudStatusBar } from '@/components/common/HudStatusBar'
import { RevealText } from '@/components/common/RevealText'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_HREF,
  socialBadgeClassName,
  socialLinks,
} from '@/data/contact'
import { playUiSound } from '@/lib/uiSounds'
import { VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Minimal site chrome footer — signature decrypt echo once on enter.
 */
export function Footer() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: VIEWPORT.margin })

  return (
    <footer className="relative z-[2] border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <HudStatusBar variant="footer" />
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
        variants={staggerContainer({
          reduceMotion: !!reduceMotion,
        })}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <motion.div
          variants={fadeUp({ reduceMotion: !!reduceMotion })}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1.5 font-mono text-xs tracking-[0.08em] text-neutral-500 sm:text-[13px]">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              className="text-neutral-300 transition-colors duration-300 hover:text-amber-400"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={CONTACT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              className="transition-colors duration-300 hover:text-amber-400"
            >
              {CONTACT_PHONE} · WhatsApp
            </a>
          </div>

          <ul className="flex flex-wrap gap-2.5">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={() => {
                      void playUiSound('hover')
                    }}
                    onClick={() => {
                      void playUiSound('click')
                    }}
                    className={cn(socialBadgeClassName, 'px-3 py-1.5 text-sm')}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase">
                      {link.label}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2 border-t border-border/40 pt-6 sm:flex-row sm:items-end sm:justify-between"
          variants={fadeUp({ reduceMotion: !!reduceMotion })}
        >
          <div ref={ref}>
            <DecryptText
              text="Ordinary Ghost — built with intent."
              tickMs={16}
              delayMs={60}
              active={inView && !reduceMotion}
              className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase"
            />
          </div>
          <RevealText as="p" className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shayan Ahmed
          </RevealText>
        </motion.div>
      </motion.div>
    </footer>
  )
}

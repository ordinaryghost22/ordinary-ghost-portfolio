import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

import { RevealText } from '@/components/common/RevealText'
import { footerContent } from '@/data/contact'
import { navItems } from '@/data/navigation'
import {
  BODY_CLASS,
  META_CLASS,
  PAGE_SHELL,
  TEXT_LINK_CLASS,
  TEXT_LINK_UNDERLINE,
} from '@/lib/editorial'
import { VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'
import { navigateWithCameraWarp, sectionIdFromHref } from '@/lib/scroll'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

/**
 * Minimal editorial footer — brand, credit, year, quiet navigation.
 */
export function Footer() {
  const reduceMotion = !!useReducedMotion()
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-[2] border-t border-zinc-900">
      <motion.div
        className={cn(PAGE_SHELL, 'py-14 sm:py-20')}
        variants={staggerContainer({ reduceMotion })}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <motion.div
          variants={fadeUp({ reduceMotion })}
          className="col-span-full flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <RevealText
              as="p"
              className="text-[15px] font-medium tracking-[-0.02em] text-zinc-50"
            >
              {footerContent.brand}
            </RevealText>
            <RevealText as="p" className={cn(BODY_CLASS, 'text-[13px]')}>
              {footerContent.credit}
            </RevealText>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onPointerEnter={() => {
                      void playUiSound('hover')
                    }}
                    onClick={(event) => {
                      event.preventDefault()
                      void playUiSound('click')
                      navigate(item.href)
                      requestAnimationFrame(() => {
                        navigateWithCameraWarp(sectionIdFromHref(item.href))
                      })
                    }}
                    className={cn(
                      TEXT_LINK_CLASS,
                      TEXT_LINK_UNDERLINE,
                      'text-[13px]',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        <motion.p
          variants={fadeUp({ reduceMotion })}
          className={cn(META_CLASS, 'col-span-full mt-4 tabular-nums sm:mt-0')}
        >
          © {year}
        </motion.p>
      </motion.div>
    </footer>
  )
}

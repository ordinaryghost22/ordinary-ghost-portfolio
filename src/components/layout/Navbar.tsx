import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { MagneticLink } from '@/components/common'
import { SoundToggle } from '@/components/common/SoundToggle'
import { useIntro } from '@/hooks/useIntro'
import { ctaItem, navItems, type NavItem } from '@/data/navigation'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useEffectiveLowPower } from '@/hooks/useEffectiveLowPower'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrolled } from '@/hooks/useScrolled'
import { EASE_OUT_EXPO, fadeDown, staggerContainer } from '@/lib/motion'
import {
  navigateWithCameraWarp,
  scrollToSection,
  sectionIdFromHref,
} from '@/lib/scroll'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

function getLocationKey(pathname: string, hash: string) {
  return `${pathname}${hash}`
}

function sectionIdFromItem(item: NavItem) {
  return item.hash ?? sectionIdFromHref(item.href)
}

function resolveActiveSection(hash: string, spyId: string) {
  const fromHash = hash.replace(/^#/, '')
  // Explicit home hash always wins; empty hash trusts scroll-spy (defaults to home)
  if (!fromHash) return spyId || 'home'
  if (fromHash === 'home') return 'home'
  return fromHash
}

type NavLinkProps = {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  className?: string
  showIndicator?: boolean
}

function NavLinkItem({
  item,
  active,
  onNavigate,
  className,
  showIndicator = true,
}: NavLinkProps) {
  const navigate = useNavigate()
  const sectionId = sectionIdFromItem(item)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    void playUiSound('click')
    navigate(item.href, { replace: false })
    requestAnimationFrame(() => {
      navigateWithCameraWarp(sectionId)
    })
    onNavigate?.()
  }

  return (
    <Link
      to={item.href}
      onClick={handleClick}
      onPointerEnter={() => {
        void playUiSound('hover')
      }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'og-interactive relative rounded-md px-3 py-2 text-sm font-medium',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-primary',
        className,
      )}
    >
      {item.label}
      {showIndicator && active ? (
        <motion.span
          layoutId="nav-active-indicator"
          className="absolute inset-x-3 -bottom-[6px] h-px bg-primary"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      ) : null}
    </Link>
  )
}

type CtaButtonProps = {
  onNavigate?: () => void
  className?: string
}

function CtaButton({ onNavigate, className }: CtaButtonProps) {
  const navigate = useNavigate()
  const lowPower = useEffectiveLowPower()

  return (
    <MagneticLink
      to={ctaItem.href}
      onClick={(event) => {
        event.preventDefault()
        navigate(ctaItem.href)
        requestAnimationFrame(() => {
          navigateWithCameraWarp(ctaItem.hash)
        })
        onNavigate?.()
      }}
      depthGlyph={<span className="text-[0.95em]">→</span>}
      className={cn(
        'og-btn og-interactive h-11 gap-2 rounded-full px-6 text-sm text-primary-foreground',
        lowPower ? 'og-glass-cta-fallback' : 'og-glass-cta',
        'hover:brightness-110',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
        className,
      )}
      data-magnetic
      data-cursor="magnetic"
    >
      {ctaItem.label}
    </MagneticLink>
  )
}

export function Navbar() {
  const scrolled = useScrolled(80)
  const spySection = useActiveSection()
  const location = useLocation()
  const navigate = useNavigate()
  const activeSection = resolveActiveSection(location.hash, spySection)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuId = useId()
  const reduceMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 640px)')
  const { navReady, playIntro } = useIntro()
  const locationKey = getLocationKey(location.pathname, location.hash)
  const [menuLocationKey, setMenuLocationKey] = useState(locationKey)

  if (menuLocationKey !== locationKey) {
    setMenuLocationKey(locationKey)
    if (mobileOpen) {
      setMobileOpen(false)
    }
  }

  useBodyScrollLock(mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    const id = sectionIdFromHref(
      `${location.pathname}${location.hash || ''}`,
    )
    if (id === 'home' && !location.hash) return

    const frame = requestAnimationFrame(() => {
      scrollToSection(id, 'auto')
    })
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeMobile = () => setMobileOpen(false)
  const animate = !reduceMotion
  const useEntrance = playIntro

  return (
    <header className="sticky top-0 z-50 w-full">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-border bg-card/80 backdrop-blur-[12px]"
        initial={false}
        animate={{ opacity: scrolled || mobileOpen ? 1 : 0 }}
        transition={{ duration: animate ? 0.3 : 0, ease: EASE_OUT_EXPO }}
      />

      <motion.nav
        className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
        variants={staggerContainer({
          stagger: 0.05,
          delay: 0,
          reduceMotion: !useEntrance,
          compact,
        })}
        initial={useEntrance ? 'hidden' : false}
        animate={navReady || !useEntrance ? 'visible' : 'hidden'}
      >
        <motion.div
          variants={fadeDown({
            y: -8,
            duration: 0.35,
            reduceMotion: !useEntrance,
          })}
        >
          <Link
            to="/#home"
            className="og-interactive font-display text-base font-semibold tracking-[-0.02em] text-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={(event) => {
              event.preventDefault()
              closeMobile()
              navigate('/#home')
              requestAnimationFrame(() => {
                scrollToSection('home')
              })
            }}
          >
            Ordinary Ghost
          </Link>
        </motion.div>

        <motion.div
          className="hidden items-center gap-1 md:flex"
          variants={staggerContainer({
            stagger: 0.05,
            delay: 0,
            reduceMotion: !useEntrance,
            compact,
          })}
        >
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeDown({
                y: -8,
                duration: 0.35,
                reduceMotion: !useEntrance,
              })}
            >
              <NavLinkItem
                item={item}
                active={activeSection === sectionIdFromItem(item)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          variants={fadeDown({
            y: -8,
            duration: 0.35,
            reduceMotion: !useEntrance,
          })}
        >
          <SoundToggle className="hidden sm:inline-flex" />

          <div className="hidden md:block">
            <CtaButton />
          </div>

          <button
            type="button"
            className={cn(
              'og-interactive inline-flex size-10 items-center justify-center rounded-md text-foreground md:hidden',
              'hover:bg-foreground/5 hover:text-primary',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => {
              void playUiSound(mobileOpen ? 'close' : 'open')
              setMobileOpen((open) => !open)
            }}
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id={menuId}
            key="mobile-nav"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: EASE_OUT_EXPO,
            }}
            className="relative border-t border-border md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
              <div className="mb-2 flex justify-end px-1 sm:hidden">
                <SoundToggle />
              </div>
              {navItems.map((item) => (
                <NavLinkItem
                  key={item.label}
                  item={item}
                  active={activeSection === sectionIdFromItem(item)}
                  onNavigate={closeMobile}
                  showIndicator={false}
                  className="w-full px-3 py-3 text-base"
                />
              ))}
              <div className="pt-3">
                <CtaButton onNavigate={closeMobile} className="w-full" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

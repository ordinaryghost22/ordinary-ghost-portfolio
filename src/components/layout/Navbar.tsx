import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useIntro } from '@/hooks/useIntro'
import { ctaItem, navItems, type NavItem } from '@/data/navigation'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrolled } from '@/hooks/useScrolled'
import { DURATION, EASE_OUT, fadeDown, staggerContainer } from '@/lib/motion'
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

type NavLinkProps = {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  onActivate?: (sectionId: string) => void
  className?: string
  variant?: 'desktop' | 'mobile'
}

function NavLinkItem({
  item,
  active,
  onNavigate,
  onActivate,
  className,
  variant = 'desktop',
}: NavLinkProps) {
  const navigate = useNavigate()
  const sectionId = sectionIdFromItem(item)
  const isMobile = variant === 'mobile'

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    void playUiSound('click')
    onActivate?.(sectionId)
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
        'relative inline-flex items-center font-[family-name:Inter,ui-sans-serif,system-ui,sans-serif] font-medium tracking-[-0.01em] text-[#F2F1EE]',
        'transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        isMobile ? 'w-full px-4 py-4 text-[18px]' : 'px-1 py-2 text-[14px]',
        active ? 'opacity-100' : 'opacity-45 hover:opacity-100',
        className,
      )}
    >
      <span className="relative inline-flex items-center pl-3">
        {active ? (
          <span
            aria-hidden
            className="absolute top-1/2 left-0 size-[3px] -translate-y-1/2 rounded-full bg-[#F2F1EE]"
          />
        ) : null}
        <span>{item.label}</span>
      </span>
    </Link>
  )
}

type CtaButtonProps = {
  onNavigate?: () => void
  onActivate?: (sectionId: string) => void
  className?: string
}

function CtaButton({ onNavigate, onActivate, className }: CtaButtonProps) {
  const navigate = useNavigate()

  return (
    <Link
      to={ctaItem.href}
      onClick={(event) => {
        event.preventDefault()
        void playUiSound('click')
        onActivate?.(ctaItem.hash)
        navigate(ctaItem.href)
        requestAnimationFrame(() => {
          navigateWithCameraWarp(ctaItem.hash)
        })
        onNavigate?.()
      }}
      onPointerEnter={() => {
        void playUiSound('hover')
      }}
      className={cn(
        'inline-flex h-[46px] items-center justify-center px-6',
        'rounded-[14px] border border-[#F2F1EE] bg-transparent',
        'font-[family-name:Inter,ui-sans-serif,system-ui,sans-serif] text-[14px] font-medium tracking-[-0.01em] text-[#F2F1EE]',
        'transition-[opacity,background-color,color,border-color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:bg-[#F2F1EE] hover:text-[#0A0B0E]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      {ctaItem.label}
    </Link>
  )
}

export function Navbar() {
  const scrolled = useScrolled(24)
  const { activeSectionId, setActiveSection } = useActiveSection()
  const location = useLocation()
  const navigate = useNavigate()
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
  const surfaceOn = scrolled || mobileOpen

  return (
    <header className="sticky top-0 z-50 w-full">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-[#1C1C1D] bg-[#0A0B0E]/80 backdrop-blur-xl"
        initial={false}
        animate={{ opacity: surfaceOn ? 1 : 0 }}
        transition={{
          duration: animate ? DURATION.card : 0,
          ease: EASE_OUT,
        }}
      />

      <motion.nav
        className={cn(
          'relative mx-auto flex h-20 w-full max-w-6xl items-center justify-between',
          'px-5 sm:px-8 md:px-16 lg:px-24',
          'font-[family-name:Inter,ui-sans-serif,system-ui,sans-serif]',
        )}
        aria-label="Primary"
        variants={staggerContainer({
          stagger: 0.04,
          delay: 0,
          reduceMotion: !useEntrance,
          compact,
        })}
        initial={useEntrance ? 'hidden' : false}
        animate={navReady || !useEntrance ? 'visible' : 'hidden'}
      >
        <motion.div
          className="relative z-10 shrink-0"
          variants={fadeDown({
            y: -6,
            duration: DURATION.section,
            reduceMotion: !useEntrance,
          })}
        >
          <Link
            to="/#home"
            className={cn(
              'inline-flex items-center text-[15px] font-medium tracking-[-0.03em] text-[#F2F1EE]',
              'translate-y-px',
              'transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'hover:opacity-70',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            onClick={(event) => {
              event.preventDefault()
              closeMobile()
              setActiveSection('home')
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
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:flex"
          variants={staggerContainer({
            stagger: 0.03,
            delay: 0,
            reduceMotion: !useEntrance,
            compact,
          })}
        >
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeDown({
                y: -6,
                duration: DURATION.section,
                reduceMotion: !useEntrance,
              })}
            >
              <NavLinkItem
                item={item}
                active={activeSectionId === sectionIdFromItem(item)}
                onActivate={setActiveSection}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="relative z-10 flex shrink-0 items-center gap-4"
          variants={fadeDown({
            y: -6,
            duration: DURATION.section,
            reduceMotion: !useEntrance,
          })}
        >
          <div className="hidden lg:block">
            <CtaButton onActivate={setActiveSection} />
          </div>

          <button
            type="button"
            className={cn(
              'inline-flex size-[46px] items-center justify-center text-[#F2F1EE] lg:hidden',
              'transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'hover:opacity-70',
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
              <X className="size-5" strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-[#0A0B0E]/60 backdrop-blur-sm lg:hidden"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : DURATION.hover,
                ease: EASE_OUT,
              }}
              onClick={closeMobile}
            />

            <motion.aside
              id={menuId}
              key="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className={cn(
                'fixed top-0 right-0 z-50 flex h-dvh w-[min(100%,20rem)] flex-col',
                'border-l border-[#1C1C1D] bg-[#0A0B0E]/95 backdrop-blur-xl lg:hidden',
                'font-[family-name:Inter,ui-sans-serif,system-ui,sans-serif]',
              )}
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              transition={{
                duration: reduceMotion ? 0 : DURATION.card,
                ease: EASE_OUT,
              }}
            >
              <div className="flex h-20 items-center justify-between px-6">
                <span className="text-[15px] font-medium tracking-[-0.03em] text-[#F2F1EE]">
                  Menu
                </span>
                <button
                  type="button"
                  className={cn(
                    'inline-flex size-[46px] items-center justify-center text-[#F2F1EE]',
                    'transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'hover:opacity-70',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  )}
                  aria-label="Close menu"
                  onClick={() => {
                    void playUiSound('close')
                    closeMobile()
                  }}
                >
                  <X className="size-5" strokeWidth={1.5} aria-hidden />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-8">
                {navItems.map((item) => (
                  <NavLinkItem
                    key={item.label}
                    item={item}
                    active={activeSectionId === sectionIdFromItem(item)}
                    onNavigate={closeMobile}
                    onActivate={setActiveSection}
                    variant="mobile"
                  />
                ))}

                <div className="mt-auto pt-8">
                  <CtaButton
                    onNavigate={closeMobile}
                    onActivate={setActiveSection}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

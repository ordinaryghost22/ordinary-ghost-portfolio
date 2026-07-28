import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Box,
  Copy,
  Download,
  Gauge,
  Lightbulb,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

import {
  LIGHTING_THEME_LABELS,
  type LightingTheme,
  type MorphShape,
  type PerformanceMode,
} from '@/context/scene-controls-context'
import {
  CONTACT_EMAIL,
  RESUME_DOWNLOAD_NAME,
  RESUME_URL,
} from '@/data/contact'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useSceneControls } from '@/hooks/useSceneControls'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

type CommandId =
  | 'perf-toggle'
  | 'lighting-cycle'
  | 'morph-toggle'
  | 'morph-auto'
  | 'copy-email'
  | 'download-resume'

type PaletteCommand = {
  id: CommandId
  label: string
  description: string
  keywords: string
  icon: typeof Gauge
  group: 'Scene' | 'Actions'
}

function performanceLabel(mode: PerformanceMode) {
  if (mode === 'low') return 'Low-Power'
  if (mode === 'high') return 'High-Performance'
  return 'Auto'
}

function morphLabel(shape: MorphShape) {
  if (shape === 'sphere') return 'Sphere (Shape A)'
  if (shape === 'grid') return 'Cube Grid (Shape B)'
  return 'Scroll Auto'
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTACT_EMAIL)
    return true
  } catch {
    return false
  }
}

function downloadResume() {
  const link = document.createElement('a')
  link.href = RESUME_URL
  link.download = RESUME_DOWNLOAD_NAME
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function CommandPalette() {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    performanceMode,
    togglePerformanceMode,
    lightingTheme,
    cycleLightingTheme,
    morphShape,
    toggleMorphShape,
    setMorphShape,
  } = useSceneControls()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  useBodyScrollLock(open)

  const commands = useMemo<PaletteCommand[]>(() => {
    return [
      {
        id: 'perf-toggle',
        label: `Toggle 3D Mode → ${
          performanceMode === 'low' ? 'High-Performance' : 'Low-Power'
        }`,
        description: `Currently ${performanceLabel(performanceMode)}. Full glow orb is default — switch to Low-Power manually.`,
        keywords: 'performance power low high fps mode 3d canvas',
        icon: Gauge,
        group: 'Scene',
      },
      {
        id: 'lighting-cycle',
        label: 'Change Canvas Lighting Theme',
        description: `Now: ${LIGHTING_THEME_LABELS[lightingTheme]}. Cycles Void → Ember → Fog → Studio.`,
        keywords: 'lighting theme light color mood canvas fog ember',
        icon: Lightbulb,
        group: 'Scene',
      },
      {
        id: 'morph-toggle',
        label: 'Morph Particles: Sphere ↔ Grid',
        description: `Force Shape A/B. Current: ${morphLabel(morphShape)}.`,
        keywords: 'morph particles sphere grid neural cube shape lerp',
        icon: Box,
        group: 'Scene',
      },
      {
        id: 'morph-auto',
        label: 'Reset Morph to Scroll Auto',
        description: 'Return particle layouts to section-driven scroll morphing.',
        keywords: 'morph reset auto scroll section',
        icon: RotateCcw,
        group: 'Scene',
      },
      {
        id: 'copy-email',
        label: 'Copy Email to Clipboard',
        description: CONTACT_EMAIL,
        keywords: 'email copy contact clipboard hello',
        icon: Copy,
        group: 'Actions',
      },
      {
        id: 'download-resume',
        label: 'Download CV (PDF)',
        description: 'Download the resume PDF.',
        keywords: 'resume cv download pdf',
        icon: Download,
        group: 'Actions',
      },
    ]
  }, [performanceMode, lightingTheme, morphShape])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((cmd) => {
      const hay = `${cmd.label} ${cmd.description} ${cmd.keywords}`.toLowerCase()
      return hay.includes(q)
    })
  }, [commands, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(id)
  }, [toast])

  const close = useCallback((opts?: { silent?: boolean }) => {
    setOpen(false)
    setQuery('')
    if (!opts?.silent) void playUiSound('close')
  }, [])

  const runCommand = useCallback(
    async (id: CommandId) => {
      void playUiSound(
        id === 'copy-email' || id === 'download-resume' ? 'success' : 'click',
      )
      switch (id) {
        case 'perf-toggle': {
          togglePerformanceMode()
          setToast('3D performance mode updated')
          break
        }
        case 'lighting-cycle': {
          cycleLightingTheme()
          setToast('Canvas lighting theme changed')
          break
        }
        case 'morph-toggle': {
          toggleMorphShape()
          setToast('Particle morph target updated')
          break
        }
        case 'morph-auto': {
          setMorphShape('auto')
          setToast('Scroll morph restored')
          break
        }
        case 'copy-email': {
          const ok = await copyEmail()
          setToast(ok ? 'Email copied' : 'Could not copy email')
          break
        }
        case 'download-resume': {
          downloadResume()
          setToast('Resume download started')
          break
        }
      }
      close({ silent: true })
    },
    [
      togglePerformanceMode,
      cycleLightingTheme,
      toggleMorphShape,
      setMorphShape,
      close,
    ],
  )

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const isPalette =
        (event.key === 'k' || event.key === 'K') &&
        (event.metaKey || event.ctrlKey)
      if (isPalette) {
        event.preventDefault()
        setOpen((prev) => {
          const next = !prev
          void playUiSound(next ? 'open' : 'close')
          if (!next) setQuery('')
          return next
        })
        return
      }

      if (!open) return

      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (filtered.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % filtered.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) void runCommand(cmd.id)
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const statusLine = useMemo(() => {
    return `${performanceLabel(performanceMode)} · ${LIGHTING_THEME_LABELS[lightingTheme as LightingTheme]} · ${morphLabel(morphShape)}`
  }, [performanceMode, lightingTheme, morphShape])

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="command-palette"
            className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
          >
            <button
              type="button"
              aria-label="Close command palette"
              className="absolute inset-0 bg-background/55 backdrop-blur-md"
              onClick={() => close()}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(
                'relative z-[1] w-full max-w-lg overflow-hidden',
                'rounded-xl border border-border/70 bg-card/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
                'ring-1 ring-primary/10 backdrop-blur-xl',
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }
              }
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              onKeyDown={onListKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                <Search
                  className="size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onListKeyDown}
                  placeholder="Type a command…"
                  className={cn(
                    'w-full bg-transparent font-sans text-sm text-foreground outline-none',
                    'placeholder:text-muted-foreground/70',
                  )}
                  aria-autocomplete="list"
                  aria-controls="command-list"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                  esc
                </kbd>
              </div>

              <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
                <Sparkles className="size-3 text-primary" strokeWidth={1.5} aria-hidden />
                <p
                  id={titleId}
                  className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
                >
                  Command Palette
                </p>
                <p className="ml-auto truncate font-mono text-[10px] text-muted-foreground/80">
                  {statusLine}
                </p>
              </div>

              <div
                id="command-list"
                ref={listRef}
                role="listbox"
                aria-label="Commands"
                className="max-h-[min(52vh,360px)] overflow-y-auto p-2"
              >
                {filtered.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No matching commands
                  </p>
                ) : (
                  filtered.map((cmd, index) => {
                    const Icon = cmd.icon
                    const active = index === activeIndex
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-index={index}
                        className={cn(
                          'og-interactive flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          active
                            ? 'bg-primary/15 text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => void runCommand(cmd.id)}
                      >
                        <Icon
                          className={cn(
                            'mt-0.5 size-4 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground',
                          )}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {cmd.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {cmd.description}
                          </span>
                        </span>
                        <span className="mt-0.5 shrink-0 font-mono text-[10px] tracking-wide text-muted-foreground/70 uppercase">
                          {cmd.group}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
                <p className="font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground/80">↑↓</span> navigate ·{' '}
                  <span className="text-foreground/80">↵</span> run
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border/60 px-1 py-px">
                    ⌘
                  </kbd>
                  <kbd className="ml-0.5 rounded border border-border/60 px-1 py-px">
                    K
                  </kbd>
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="palette-toast"
            role="status"
            className={cn(
              'pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2',
              'rounded-full border border-border/60 bg-card/90 px-4 py-2',
              'font-mono text-xs text-foreground backdrop-blur-md',
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

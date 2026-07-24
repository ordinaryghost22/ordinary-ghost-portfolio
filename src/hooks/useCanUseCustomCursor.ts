import { useMediaQuery } from '@/hooks/useMediaQuery'

/** True when a custom cursor should run (fine pointer, not touch, motion ok). */
export function useCanUseCustomCursor(reduceMotion: boolean | null) {
  const coarse = useMediaQuery('(pointer: coarse)')
  const fine = useMediaQuery('(pointer: fine)')

  if (reduceMotion) return false
  if (coarse) return false
  return fine
}

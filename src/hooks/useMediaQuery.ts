import { useEffect, useState } from 'react'

function getMatches(query: string) {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

/** SSR-safe media query with correct first client paint (no false→true flip). */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

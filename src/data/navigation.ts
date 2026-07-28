export type NavItem = {
  label: string
  href: string
  hash?: string
}

/** Logo left · balanced centre links · Talk CTA right */
export const navItems: NavItem[] = [
  { label: 'Home', href: '/#home', hash: 'home' },
  { label: 'About', href: '/#about', hash: 'about' },
  { label: 'Work', href: '/#work', hash: 'work' },
  { label: 'Method', href: '/#method', hash: 'method' },
  { label: 'Resume', href: '/#resume', hash: 'resume' },
  { label: 'Contact', href: '/#contact', hash: 'contact' },
]

export const ctaItem = {
  label: 'Talk',
  href: '/#contact',
  hash: 'contact',
} as const

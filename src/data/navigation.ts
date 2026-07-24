export type NavItem = {
  label: string
  href: string
  hash?: string
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/#home', hash: 'home' },
  { label: 'About', href: '/#about', hash: 'about' },
  { label: 'Projects', href: '/#projects', hash: 'projects' },
  { label: 'Skills', href: '/#skills', hash: 'skills' },
  { label: 'Resume', href: '/#resume', hash: 'resume' },
  { label: 'Contact', href: '/#contact', hash: 'contact' },
]

export const ctaItem = {
  label: "Let's Talk",
  href: '/#contact',
  hash: 'contact',
} as const

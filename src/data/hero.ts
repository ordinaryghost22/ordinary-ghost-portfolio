import { RESUME_URL } from '@/data/contact'

export const heroContent = {
  eyebrow: 'Shayan Ahmed — Available for work',
  headline: {
    line1: 'Built slowly.',
    line2: 'Meant',
    line3Before: 'to ',
    line3Italic: 'last',
    line3After: '.',
  },
  supporting: [
    'I build software for businesses that cannot afford quiet failures.',
    'Booking, learning, and operations systems — designed and shipped end to end.',
  ],
  primaryCta: {
    label: 'See the work',
    href: '/#work',
  },
  secondaryCta: {
    label: 'Resume',
    href: RESUME_URL,
  },
} as const

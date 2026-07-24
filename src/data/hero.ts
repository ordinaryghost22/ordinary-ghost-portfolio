import { RESUME_DOWNLOAD_NAME, RESUME_URL } from '@/data/contact'

export const heroContent = {
  badge: 'AVAILABLE FOR HIRE',
  headline: 'Ordinary Ghost',
  founderLine:
    'Engineered & Led by Shayan Ahmed — Founder & Lead Architect',
  roles: ['AI SYSTEMS', 'FULL-STACK', 'SAAS ARCHITECTURE'],
  description:
    'We engineer autonomous AI receptionists, custom RAG search engines, and production full-stack platforms for fast-growing businesses.',
  primaryCta: {
    label: 'View Case Studies',
    href: '/#projects',
  },
  secondaryCta: {
    label: 'Read Resume',
    href: RESUME_URL,
    download: RESUME_DOWNLOAD_NAME,
  },
} as const

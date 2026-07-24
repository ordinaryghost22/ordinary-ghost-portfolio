import { RESUME_DOWNLOAD_NAME, RESUME_URL } from '@/data/contact'

export const heroContent = {
  badge: 'ORDINARY GHOST AGENCY // AI & SAAS ENGINEERING',
  headline: 'Ordinary Ghost',
  founderLine:
    'Engineered & Led by Shayan Ahmed — Founder & Lead Architect',
  roles: ['AI SYSTEMS', 'FULL-STACK', 'SAAS ARCHITECTURE'],
  description:
    'Architecting autonomous AI workflows, high-performance web systems, and scalable SaaS platforms engineered for maximum impact.',
  primaryCta: {
    label: 'Explore Works →',
    href: '/#projects',
  },
  secondaryCta: {
    label: 'Read Resume',
    href: RESUME_URL,
    download: RESUME_DOWNLOAD_NAME,
  },
} as const

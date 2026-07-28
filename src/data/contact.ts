import type { ComponentType, SVGProps } from 'react'

import {
  DiscordIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/icons/BrandIcons'

export const CONTACT_EMAIL = 'ordinaryghost7@gmail.com'

/** Display label for phone / WhatsApp */
export const CONTACT_PHONE = '+92 332 816787'

export const CONTACT_TEL_HREF = 'tel:+92332816787'
export const CONTACT_WHATSAPP_HREF = 'https://wa.me/92332816787'

export const CONTACT_LOCATION = 'Lahore, Pakistan'

export const RESUME_URL = '/resume.html'
export const RESUME_DOWNLOAD_NAME = 'Shayan_Ahmed_CV.html'

export const contactContent = {
  eyebrow: 'Contact',
  heading: 'Get in touch.',
  supporting: [
    'Available for freelance work and collaborations',
    'on products that need to hold in production.',
  ],
  primaryCta: {
    label: 'Write to me',
  },
  details: {
    email: 'Email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    location: 'Location',
  },
} as const

export const footerContent = {
  brand: 'Ordinary Ghost',
  credit: 'Built with care.',
} as const

type BrandIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

export type SocialLink = {
  id: 'linkedin' | 'github' | 'discord'
  label: string
  /** Bracket HUD label for hero strip */
  hudLabel: string
  href: string
  icon: BrandIcon
}

export const socialLinks: SocialLink[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    hudLabel: '[ LINKEDIN ]',
    href: 'https://www.linkedin.com/in/ordin4ry-ghost-96487a414/',
    icon: LinkedInIcon,
  },
  {
    id: 'github',
    label: 'GitHub',
    hudLabel: '[ GITHUB ]',
    href: 'https://github.com/ordinaryghost22',
    icon: GitHubIcon,
  },
  {
    id: 'discord',
    label: 'Discord',
    hudLabel: '[ DISCORD ]',
    href: 'https://discord.com/users/1379701906032820244',
    icon: DiscordIcon,
  },
]

export const socialBadgeClassName =
  'flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] px-4 py-2 text-[#A1A1AA] transition-[border-color,background-color,color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[#171717] hover:text-[#FAFAFA]'

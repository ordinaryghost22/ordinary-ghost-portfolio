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

export const RESUME_URL = '/resume.pdf'
export const RESUME_DOWNLOAD_NAME = 'Shayan_Ahmed_CV.pdf'

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
  'flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-neutral-300 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'

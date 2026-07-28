export type ExperienceItem = {
  role: string
  period: string
  detail: string
}

export type SelectedWorkItem = {
  name: string
  href: string
}

export const resumeContent = {
  eyebrow: 'Resume',
  heading: 'Background',
  intro: 'Independent product engineer in Lahore. Design, build, and ship alone.',
  experience: [
    {
      role: 'Independent Product Engineer',
      period: '2023 — Present',
      detail:
        'Own products end to end — architecture, interface, APIs, and deployment.',
    },
    {
      role: 'AI Systems',
      period: '2024 — Present',
      detail:
        'Grounded retrieval, booking assistants, and study tools that stay faithful to their sources.',
    },
    {
      role: 'Full-stack Delivery',
      period: '2022 — Present',
      detail: 'Web products from first commit to hosted release.',
    },
  ] satisfies ExperienceItem[],
  selected: [
    { name: 'AI Repair SaaS', href: '/work/irepair' },
    { name: 'AI Tutor', href: '/work/ai-tutor' },
    { name: 'Ordinary Ghost', href: '/work/ordinary-ghost' },
  ] satisfies SelectedWorkItem[],
  education: {
    label: 'Education',
    title: 'Self-taught software engineering',
    detail: 'Practice through shipped products.',
  },
  downloadLabel: 'View resume',
} as const

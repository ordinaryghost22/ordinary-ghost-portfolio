export type ExperienceMilestone = {
  title: string
  description: string
  impact: string
  period: string
}

export type ResumeChapter = {
  title: string
  items: string[]
}

export const resumeContent = {
  eyebrow: 'Resume',
  heading: 'Background',
  intro:
    'A short record of what I have built — written to be read, not scanned for keywords.',
  experience: {
    title: 'Experience',
    milestones: [
      {
        title: 'Independent product work',
        description:
          'Design and ship products alone — architecture, interface, and deployment.',
        impact: 'Live systems used by real businesses.',
        period: '2023 — Present',
      },
      {
        title: 'Grounded systems',
        description:
          'Retrieval, conversational intake, and study tools that stay faithful to their sources.',
        impact: 'Answers that retrieve before they invent.',
        period: '2024 — Present',
      },
      {
        title: 'Full-stack delivery',
        description:
          'Web products from first commit to hosted release.',
        impact: 'End-to-end ownership on every build.',
        period: '2022 — Present',
      },
    ] satisfies ExperienceMilestone[],
  },
  projectsDelivered: {
    title: 'Shipped',
    items: [
      'AI Repair SaaS — booking and operations in production',
      'AI Tutor — study help grounded in the syllabus',
      'Automation Platform — first replies and lead capture without waiting',
    ],
  } satisfies ResumeChapter,
  education: {
    title: 'Education',
    items: [
      'Self-taught software engineering',
      'Practice through shipped products',
      'Focus: product design, grounded systems, full-stack delivery',
    ],
  } satisfies ResumeChapter,
  achievements: {
    title: 'Notes',
    items: [
      'Shipped products end to end, alone',
      'Owned interface, API, and model layer on the same builds',
      'Automated intake for teams stuck in first replies',
      'Designed interfaces meant to stay calm under use',
    ],
  } satisfies ResumeChapter,
  currentFocus: {
    title: 'Now',
    items: [
      'Production booking and receptionist systems',
      'Retrieval that stays faithful to private sources',
      'Software that feels quiet and precise',
    ],
  } satisfies ResumeChapter,
  downloadLabel: 'Download PDF',
} as const

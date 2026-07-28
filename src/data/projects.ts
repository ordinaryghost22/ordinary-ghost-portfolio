export type ProjectFrame = 'browser' | 'device'

export type EngineeringDecision = {
  title: string
  body: string
}

export type ExperienceShot = {
  caption: string
  frame: ProjectFrame
}

export type Project = {
  id: string
  title: string
  year: string
  /** Tiny cover metadata — status, role, scope (legacy single line) */
  meta: string
  /** Cover metadata chips */
  tags: string[]
  /** One-sentence product summary */
  summary: string
  /** Future editorial case study path */
  href: string
  /** Cover surface — login is used for archive photography where noted */
  cover: 'irepair-login' | 'tutor' | 'ordinary-ghost'
  /** Screenshot framed inside the Selected Work browser chrome */
  screenshotSrc: string
  /** Opt-in grayscale → color reveal on desktop hover */
  hasColorReveal: boolean
  problem: string
  solution: {
    overview: string
    architecture: string
    ux: string
    ai: string
  }
  experience: ExperienceShot[]
  /** Ordered architecture layers — editorial flow, not badges */
  architecture: string[]
  decisions: EngineeringDecision[]
  outcome: string
  reflection: string
  /** Flat tech list for Skills ↔ Projects highlight matching */
  stack: string[]
  liveUrl?: string
  codeUrl?: string
  previewUrl: string
  /** Which stylized product UI to render in case-study mockups */
  mockup: 'irepair' | 'tutor' | 'ordinary-ghost'
  flagship?: boolean
}

export const projects: Project[] = [
  {
    id: 'irepair',
    title: 'AI Repair SaaS',
    year: '2026',
    meta: 'Production SaaS · AI · Automation',
    tags: ['Production SaaS', 'AI', 'Automation'],
    href: '/work/irepair',
    flagship: true,
    mockup: 'irepair',
    cover: 'irepair-login',
    screenshotSrc: '/projects/ai-repair-saas.png',
    hasColorReveal: true,
    previewUrl: 'irepair-dashboard.vercel.app/login',
    liveUrl: 'https://irepair-dashboard.vercel.app/login',
    summary:
      'Intelligent booking platform built for modern repair businesses.',
    problem:
      'When the shop closed, the phone went quiet — and so did revenue. Bookings arrived in WhatsApp threads, paper notes, and half-updated calendars. Owners had no single place to see who needed what, when, or whether a slot was free.',
    solution: {
      overview:
        'One desk for the whole shop: intake, scheduling, and follow-up. After hours, an assistant books against live availability in English, Urdu, and Roman Urdu. By day, the owner sees every lead and job without hunting through chats.',
      architecture:
        'The operator surface and booking service share one source of truth for slots, leads, and roles. Conversation stays fast enough to feel present. Hosting is split so a quiet failure in one layer does not take the shop offline.',
      ux:
        'The owner view is sparse — status, leads, and today’s book at a glance. The customer widget asks only what scheduling needs. Every screen answers one job.',
      ai:
        'The assistant confirms availability before it promises a slot, and hands off when a person should decide. It behaves like a receptionist with limits — not a chat layer on top of a form.',
    },
    experience: [
      {
        caption: 'Owner desk — today’s book, live leads, status at a glance.',
        frame: 'browser',
      },
      {
        caption: 'Intake that confirms a slot before the conversation ends.',
        frame: 'browser',
      },
    ],
    architecture: [
      'React',
      'FastAPI',
      'Supabase',
      'Groq',
      'Railway',
      'Vercel',
    ],
    decisions: [
      {
        title: 'Speed over spectacle',
        body: 'A booking conversation dies if the reply stalls. Turn speed mattered more than a clever demo. The assistant had to feel present.',
      },
      {
        title: 'Promise only what exists',
        body: 'The model never invents a free slot. Every confirmation uses the same rules the owner sees. Trust is a product requirement.',
      },
      {
        title: 'One system, two audiences',
        body: 'Customers need a thin widget. Owners need an operations desk. One backend keeps the truth in one place without forcing one interface on both.',
      },
      {
        title: 'Ship as if it must stay up',
        body: 'Auth, roles, and deploy paths shipped with the first usable version. A demo that cannot stay online is not a product.',
      },
    ],
    outcome:
      'More than five hundred conversations handled without someone glued to the phone. Shops take intake overnight. The path from message to confirmed job now lives in one place.',
    reflection:
      'Exception handling still asks too much of the owner — reschedules, no-shows, parts delays. Booking tone holds up; diagnostic conversations need more care. The shape is right. The next work is operational nuance.',
    stack: [
      'React',
      'FastAPI',
      'Python',
      'JavaScript',
      'Supabase',
      'PostgreSQL',
      'Groq API',
      'Vercel',
      'Railway',
    ],
  },
  {
    id: 'tutor',
    title: 'AI Tutor',
    year: '2024',
    meta: 'Education · Syllabus-faithful · Solo',
    tags: ['Education', 'Retrieval', 'Production'],
    href: '/work/ai-tutor',
    mockup: 'tutor',
    cover: 'tutor',
    screenshotSrc: '/projects/ai-tutor.svg',
    hasColorReveal: false,
    previewUrl: 'tutor.ordinaryghost.dev',
    summary:
      'Study help grounded in the student’s own syllabus — not the open web.',
    problem:
      'Students already have chatbots. What they lack is help that stays inside the chapters they will be examined on. Generic answers invent facts and drift into the wrong syllabus. For Matric Physics, that is a quiet failure of trust.',
    solution: {
      overview:
        'Treat the textbook as the only source of truth. Extract it, index it by chapter, and answer only from retrieved passages. The promise is simple: help that matches what you study.',
      architecture:
        'Pages become searchable chapters before any model writes a word. Retrieval stays scoped to the active chapter. The model is the last step — never the first.',
      ux:
        'Chapter first, question second. Students see which material an answer came from. Citations are how trust is shown, not decoration.',
      ai:
        'If the chapter cannot support an answer, the system says so. Invented certainty is treated as a product bug.',
    },
    experience: [
      {
        caption: 'Ask from the chapter. Cite the chapter.',
        frame: 'browser',
      },
      {
        caption: 'Answers that show their source before they sound sure.',
        frame: 'browser',
      },
    ],
    architecture: [
      'Python',
      'OCR',
      'pgvector',
      'FastAPI',
      'LLMs',
      'Supabase',
    ],
    decisions: [
      {
        title: 'Corpus before conversation',
        body: 'A polished chat on an ungrounded model would have shipped faster — and been wrong. The textbook pipeline came first so every answer had somewhere honest to stand.',
      },
      {
        title: 'Chapter as the unit of trust',
        body: 'Search across the whole book still drifts. Scoping retrieval to the active chapter keeps answers fair and examinable.',
      },
      {
        title: 'Cite or refuse',
        body: 'Weak retrieval should admit uncertainty. Silent guessing teaches confidence without correctness.',
      },
      {
        title: 'Waiting feels broken',
        body: 'Study help that stalls loses the student. Indexing and query shape were tuned so the pause feels like thinking, not buffering.',
      },
    ],
    outcome:
      'Answers arrive quickly and stay faithful to the book. Students get help aligned with what they will be examined on — not a confident guess from elsewhere.',
    reflection:
      'Progress and quizzes can reuse the same corpus; the retrieval layer is ready. Dense diagrams still need human review after OCR. The lesson that stayed: in education, grounding is the product.',
    stack: ['Python', 'OCR', 'pgvector', 'FastAPI', 'LLMs', 'Supabase'],
  },
  {
    id: 'ordinary-ghost',
    title: 'Ordinary Ghost',
    year: '2026',
    meta: 'Portfolio · Design systems · Solo',
    tags: ['Portfolio', 'Motion', '3D'],
    href: '/work/ordinary-ghost',
    mockup: 'ordinary-ghost',
    cover: 'ordinary-ghost',
    screenshotSrc: '/projects/ordinary-ghost.svg',
    hasColorReveal: false,
    previewUrl: 'ordinaryghost.dev',
    summary:
      'A monochrome portfolio that treats product work as editorial photography.',
    problem:
      'Most developer portfolios look like dashboards of badges. The work itself never gets a quiet frame. Visitors skim chips and leave without understanding how anything was thought through.',
    solution: {
      overview:
        'Build the site as a publication: one composition per viewport, covers that open into case studies, and motion that signals presence without noise.',
      architecture:
        'React and Vite for the shell. Three.js for the hero atmosphere. Framer Motion and GSAP for scroll and hover that stay deliberate.',
      ux:
        'Black, white, and gray only — so the one place color appears (a product screenshot waking up) actually means something.',
      ai:
        'No model in the product surface. The craft is composition, pacing, and restraint.',
    },
    experience: [
      {
        caption: 'Hero as atmosphere — brand first, one clear ask.',
        frame: 'browser',
      },
      {
        caption: 'Selected work as covers, not a card grid of chips.',
        frame: 'browser',
      },
    ],
    architecture: [
      'React',
      'Vite',
      'Tailwind',
      'Framer Motion',
      'Three.js',
      'GSAP',
    ],
    decisions: [
      {
        title: 'Monochrome as a rule',
        body: 'Color is reserved for product truth inside a frame. Everywhere else stays gray so that reveal can land.',
      },
      {
        title: 'Covers, not cards',
        body: 'The archive should feel like browsing photography — not a marketing grid of badges and stats.',
      },
      {
        title: 'Hover reveals, click navigates',
        body: 'No expand state. Presence is presentational; the whole cover is the link to the case study.',
      },
      {
        title: 'Motion with a job',
        body: 'Lift, scale, and grayscale release signal clickability. They do not invent content.',
      },
    ],
    outcome:
      'A site that can hold product screenshots without competing with them — and that reads as Ordinary Ghost even with the nav removed.',
    reflection:
      'Case study pages still need the same editorial discipline as the covers. The shell is ready; the writing has to match.',
    stack: [
      'React',
      'TypeScript',
      'JavaScript',
      'Vite',
      'Tailwind',
      'Three.js',
      'Framer Motion',
      'GSAP',
    ],
  },
]

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  if (!slug) return undefined
  return projects.find((project) => project.href === `/work/${slug}`)
}

export function getAdjacentProjects(slug: string | undefined): {
  project: Project
  prev: Project | null
  next: Project | null
} | null {
  const project = getProjectBySlug(slug)
  if (!project) return null

  const index = projects.findIndex((p) => p.id === project.id)
  return {
    project,
    prev: index > 0 ? projects[index - 1]! : null,
    next: index < projects.length - 1 ? projects[index + 1]! : null,
  }
}

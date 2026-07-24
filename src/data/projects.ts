export type ProjectMetric = {
  label: string
  value: string
}

export type Project = {
  title: string
  subtitle: string
  description: string
  features: string[]
  /** High-ticket ROI / impact stats shown on the card */
  metrics: ProjectMetric[]
  stack: string[]
  liveUrl?: string
  flagship?: boolean
  /** Accent pair for the floating hover preview (no image assets required) */
  preview: {
    from: string
    to: string
    monogram: string
  }
}

export const projects: Project[] = [
  {
    title: 'iRepair Dashboard',
    subtitle: 'AI Booking & Business Platform',
    flagship: true,
    liveUrl: 'https://irepair-dashboard.vercel.app/login',
    preview: {
      from: '#1a1510',
      to: '#c6a15b',
      monogram: 'iR',
    },
    description:
      'Production-ready AI-powered booking and business management platform for repair shops. Built end to end — from the booking agent to the owner dashboard.',
    metrics: [
      { value: '90%', label: 'Reduced booking friction' },
      { value: '24/7', label: 'AI Receptionist' },
      { value: '500+', label: 'Conversations Automated' },
    ],
    features: [
      '24/7 AI booking assistant',
      'Smart scheduling',
      'Customer chat widget',
      'English / Urdu / Roman Urdu',
      'Real-time booking validation',
      'Owner dashboard & lead management',
      'Secure authentication',
      'Blockchain repair records (in progress)',
    ],
    stack: [
      'React',
      'FastAPI',
      'Python',
      'JavaScript',
      'Supabase',
      'PostgreSQL',
      'Groq API',
      'Blockchain',
      'Vercel',
      'Railway',
    ],
  },
  {
    title: 'AI Tutor for Class 10',
    subtitle: 'Textbook-aware learning platform',
    preview: {
      from: '#0c1218',
      to: '#5b8fc6',
      monogram: 'AT',
    },
    description:
      'Matric-focused AI learning system with OCR textbook extraction, intelligent chunking and embeddings, and a RAG pipeline for chapter-based Q&A. Quiz generation and progress tracking planned next.',
    metrics: [
      { value: 'Sub-second', label: 'RAG Retrieval' },
      { value: '100%', label: 'Textbook-Accurate Indexing' },
    ],
    features: [
      'OCR textbook extraction',
      'Chunking + embeddings',
      'Semantic search + RAG',
      'Chapter-based Q&A',
      'Quiz generation (planned)',
      'Progress tracking (planned)',
    ],
    stack: ['Python', 'OCR', 'pgvector', 'FastAPI', 'LLMs', 'Supabase'],
  },
  {
    title: 'AI Automation Workflows',
    subtitle: 'Business productivity systems',
    preview: {
      from: '#120e14',
      to: '#a15bc6',
      monogram: 'AW',
    },
    description:
      'AI-driven automation for chatbots, lead capture, and knowledge retrieval — agents and API integrations that sit inside real business workflows.',
    metrics: [
      { value: '10x', label: 'Operational Speed' },
      { value: 'Zero', label: 'Human Interventions Required' },
    ],
    features: [
      'AI chatbots',
      'Workflow automation',
      'Knowledge retrieval',
      'Lead collection',
      'AI agents',
      'API integrations',
    ],
    stack: [
      'Python',
      'LLMs',
      'FastAPI',
      'Automation',
      'APIs',
      'Supabase',
    ],
  },
]

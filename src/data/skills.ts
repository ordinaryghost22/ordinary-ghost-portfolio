export type Capability = {
  name: string
  description: string
  technologies: string[]
  /** Project ids from `@/data/projects` */
  usedIn: string[]
  /** Keys used for Skills ↔ Projects highlight matching */
  matchKeys: string[]
}

export type CapabilityGroup = {
  title: string
  purpose: string
  capabilities: Capability[]
}

/**
 * Editorial capability model — how problems are solved, not a logo cloud.
 * `id="method"` remains on the section for navigation / scroll spy.
 */
export const capabilityGroups: CapabilityGroup[] = [
  {
    title: 'AI Systems',
    purpose: 'Answers that stay tied to real data.',
    capabilities: [
      {
        name: 'Grounded retrieval',
        description:
          'Index private knowledge, find the right passage, and answer without inventing.',
        technologies: ['Embeddings', 'pgvector', 'LLMs', 'FastAPI'],
        usedIn: ['tutor'],
        matchKeys: ['RAG', 'Embeddings', 'pgvector', 'LLMs'],
      },
      {
        name: 'Conversational assistants',
        description:
          'Helpers that book, route, and escalate — with clear limits.',
        technologies: ['Groq', 'LLMs', 'Python', 'APIs'],
        usedIn: ['irepair'],
        matchKeys: ['Groq', 'LLMs', 'AI Agents', 'Chatbots'],
      },
      {
        name: 'Document intelligence',
        description:
          'Turn textbooks and files into structure you can search and trust.',
        technologies: ['OCR', 'Python', 'Embeddings'],
        usedIn: ['tutor'],
        matchKeys: ['OCR', 'Embeddings'],
      },
    ],
  },
  {
    title: 'Product Engineering',
    purpose: 'From the screen someone uses to the data that keeps it honest.',
    capabilities: [
      {
        name: 'Full-stack delivery',
        description:
          'Own the path from interface to database so one coherent system ships.',
        technologies: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'],
        usedIn: ['irepair', 'ordinary-ghost'],
        matchKeys: ['React', 'TypeScript', 'JavaScript', 'FastAPI', 'PostgreSQL'],
      },
      {
        name: 'Auth and access',
        description:
          'Sessions and roles that stay invisible when they work.',
        technologies: ['Supabase', 'Auth systems', 'REST APIs'],
        usedIn: ['irepair'],
        matchKeys: ['Auth systems', 'Supabase', 'REST APIs'],
      },
      {
        name: 'Operational interfaces',
        description:
          'Desks and widgets that stay clear under live load.',
        technologies: ['React', 'Tailwind CSS', 'Framer Motion'],
        usedIn: ['irepair', 'ordinary-ghost'],
        matchKeys: ['React', 'Tailwind CSS', 'Framer Motion'],
      },
    ],
  },
  {
    title: 'Infrastructure',
    purpose: 'Hosts and data that stay available.',
    capabilities: [
      {
        name: 'Cloud deployment',
        description:
          'Ship frontends and APIs to stable hosts with predictable environments.',
        technologies: ['Vercel', 'Railway'],
        usedIn: ['irepair'],
        matchKeys: ['Vercel', 'Railway'],
      },
      {
        name: 'Data platforms',
        description:
          'Storage, auth, and vectors in one operational backbone.',
        technologies: ['Supabase', 'PostgreSQL', 'pgvector'],
        usedIn: ['irepair', 'tutor'],
        matchKeys: ['Supabase', 'PostgreSQL', 'pgvector'],
      },
    ],
  },
  {
    title: 'Design Thinking',
    purpose: 'Clarity and trust before novelty.',
    capabilities: [
      {
        name: 'System design',
        description:
          'Shape the architecture around the real workflow before choosing tools.',
        technologies: ['System design'],
        usedIn: ['irepair', 'tutor', 'ordinary-ghost'],
        matchKeys: ['System design'],
      },
      {
        name: 'Solo delivery',
        description:
          'Carry a product from blank repo to production without losing the plot.',
        technologies: ['Solo delivery'],
        usedIn: ['irepair', 'ordinary-ghost'],
        matchKeys: ['Solo delivery'],
      },
    ],
  },
  {
    title: 'Automation',
    purpose: 'Take repetitive intake out of human queues.',
    capabilities: [
      {
        name: 'Business workflows',
        description:
          'Connect chat, knowledge, and CRM so routine work moves without waiting.',
        technologies: ['Workflows', 'APIs', 'Python'],
        usedIn: ['irepair'],
        matchKeys: ['Workflows', 'APIs', 'Automation'],
      },
      {
        name: 'Lead capture',
        description:
          'First-line replies that classify intent and write structured leads.',
        technologies: ['Chatbots', 'AI Agents', 'Supabase'],
        usedIn: ['irepair'],
        matchKeys: ['Chatbots', 'AI Agents'],
      },
    ],
  },
]

/** Flat list retained for any legacy consumers expecting categories */
export const skillCategories = capabilityGroups.map((group) => ({
  label: group.title,
  items: group.capabilities.flatMap((c) => c.matchKeys),
}))

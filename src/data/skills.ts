export type SkillCategory = {
  label: string
  items: string[]
}

export const skillCategories: SkillCategory[] = [
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python'],
  },
  {
    label: 'Frontend',
    items: ['React', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    label: 'Backend',
    items: ['FastAPI', 'REST APIs', 'Auth systems'],
  },
  {
    label: 'Databases',
    items: ['PostgreSQL', 'Supabase', 'pgvector'],
  },
  {
    label: 'Artificial Intelligence',
    items: ['RAG', 'LLMs', 'Embeddings', 'OCR', 'Groq'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['Vercel', 'Railway', 'Supabase'],
  },
  {
    label: 'Automation',
    items: ['AI Agents', 'Chatbots', 'Workflows'],
  },
  {
    label: 'Other',
    items: ['Blockchain', 'System design', 'Solo delivery'],
  },
]

/** Normalize labels for fuzzy skill ↔ project.stack matching */
function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Extra aliases so skill pills light up related project stack tags */
const ALIASES: Record<string, string[]> = {
  groq: ['groq api', 'groq'],
  'rest apis': ['apis', 'rest', 'fastapi'],
  'ai agents': ['ai agents', 'automation'],
  chatbots: ['ai chatbots', 'chatbots', 'automation'],
  workflows: ['automation', 'workflow'],
  'auth systems': ['authentication', 'auth', 'secure'],
  rag: ['rag', 'semantic search', 'embeddings'],
  llms: ['llms', 'groq api'],
  embeddings: ['embeddings', 'chunking', 'pgvector'],
  ocr: ['ocr'],
  react: ['react'],
  python: ['python'],
  javascript: ['javascript'],
  fastapi: ['fastapi'],
  postgresql: ['postgresql'],
  supabase: ['supabase'],
  vercel: ['vercel'],
  railway: ['railway'],
  blockchain: ['blockchain'],
  pgvector: ['pgvector'],
  typescript: ['typescript', 'javascript'],
  'tailwind css': ['tailwind'],
  'framer motion': ['framer'],
}

/**
 * Returns true when a skill pill should highlight a project with the given stack.
 */
export function skillMatchesStack(skill: string, stack: string[]): boolean {
  const key = norm(skill)
  const aliases = ALIASES[key] ?? [key]
  const needles = new Set([key, ...aliases].map(norm))

  return stack.some((tech) => {
    const t = norm(tech)
    for (const needle of needles) {
      if (!needle) continue
      if (t === needle || t.includes(needle) || needle.includes(t)) return true
    }
    return false
  })
}

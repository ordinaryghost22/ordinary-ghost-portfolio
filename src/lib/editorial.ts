/** Unified editorial page grid — shared by every content section. */
export const PAGE_SHELL =
  'mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-12'

/** Left rail: section identifiers (cols 1–4) */
export const COL_LABEL = 'md:col-span-4 md:col-start-1'

/** Right rail: body / chapter content (cols 5–12) */
export const COL_CONTENT = 'md:col-span-8 md:col-start-5'

/** Section masthead — headline flush left from column 1 */
export const COL_HEADING = 'col-span-full md:col-span-8 md:col-start-1'

/** Monospaced section / chapter label */
export const LABEL_CLASS =
  'font-mono text-xs tracking-widest text-zinc-500 uppercase'

/** Body copy */
export const BODY_CLASS = 'text-zinc-400 leading-relaxed'

/** Meta / dates / numbers */
export const META_CLASS = 'font-mono text-xs text-zinc-500'

/** Editorial text action — underline on hover, no pill */
export const TEXT_LINK_CLASS =
  'group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white'

export const TEXT_LINK_UNDERLINE =
  'border-b border-transparent transition-[border-color,color] duration-200 group-hover:border-zinc-800 group-hover:text-white'

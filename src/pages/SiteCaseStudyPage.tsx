/**
 * Public walkthrough of the Ordinary Ghost premium portfolio website.
 * Separate from per-project `/work/:slug` case studies.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    id: 'hero',
    step: '01',
    route: '/#home',
    title: 'Hero',
    image: '/site-case-study/01-hero.png',
    summary: 'A quiet, Apple-like first frame — brand before everything else.',
    body: 'The landing viewport leads with Shayan Ahmed / Ordinary Ghost: a sparse night sky, ceramic moon, and the line “Built slowly. Meant to last.” One primary CTA and a resume link — no dashboard clutter, no stacked marketing modules.',
    highlights: [
      'Brand-first hero with restrained motion',
      'Clear availability and craft statement',
      'Single composition: moon, type, and CTAs',
    ],
  },
  {
    id: 'about',
    step: '02',
    route: '/#about',
    title: 'About',
    image: '/site-case-study/02-about.png',
    summary: 'Philosophy, path, and principles in editorial columns.',
    body: 'About explains how the work is approached — craft over speed, products before features, fewer and better. It reads like a premium editorial spread, not a bio dump.',
    highlights: [
      'Sectioned philosophy and principles',
      'Calm typography and generous measure',
      'Scroll-linked reveals without noise',
    ],
  },
  {
    id: 'work',
    step: '03',
    route: '/#work',
    title: 'Selected Work',
    image: '/site-case-study/03-work.png',
    summary: 'Project covers that open into deep case studies.',
    body: 'Selected Work presents flagship products — AI Repair SaaS, AI Tutor, and the portfolio itself — as large photographic covers. Hover reveals detail; click enters a full case study page.',
    highlights: [
      'Cover-led archive, not card grids',
      'Hover preview and color reveal',
      'Routes into /work/:slug case studies',
    ],
  },
  {
    id: 'method',
    step: '04',
    route: '/#method',
    title: 'Method',
    image: '/site-case-study/04-method.png',
    summary: 'Skills framed as systems thinking, not a badge wall.',
    body: 'Method groups capability into AI systems, product engineering, infrastructure, design thinking, and automation — with interactive highlights that connect skills back to real projects.',
    highlights: [
      'Capability clusters instead of tag clouds',
      'Skill ↔ project highlight linking',
      'Quiet interactive depth on scroll',
    ],
  },
  {
    id: 'resume',
    step: '05',
    route: '/#resume',
    title: 'Resume',
    image: '/site-case-study/05-resume.png',
    summary: 'Experience and education as a readable timeline.',
    body: 'Resume keeps credentials scannable: roles, education, and a path to the PDF. Designed to feel like part of the same monochrome system as the rest of the site.',
    highlights: [
      'Editorial timeline layout',
      'Direct path to downloadable resume',
      'Consistent type and spacing language',
    ],
  },
  {
    id: 'contact',
    step: '06',
    route: '/#contact',
    title: 'Contact',
    image: '/site-case-study/06-contact.png',
    summary: 'A focused close — one way to start a conversation.',
    body: 'Contact ends the scroll with a clear invitation to talk. No form maze — channels and intent stay obvious so the site finishes as calmly as it started.',
    highlights: [
      'Single-purpose closing section',
      'Talk CTA aligned with navbar',
      'Footer and contact as one ending beat',
    ],
  },
  {
    id: 'case-study',
    step: '07',
    route: '/work/irepair',
    title: 'Project case study',
    image: '/site-case-study/07-project-case-study.png',
    summary: 'Deep narrative pages for each selected product.',
    body: 'Each /work/:slug page is a full editorial case study — problem, solution, architecture, decisions, outcome, and reflection — with product photography and adjacent project navigation.',
    highlights: [
      'Problem → solution → outcome structure',
      'Architecture and engineering decisions',
      'Prev / next project navigation',
    ],
  },
  {
    id: 'mobile',
    step: '08',
    route: '/#home',
    title: 'Mobile',
    image: '/site-case-study/08-mobile.png',
    summary: 'The same premium system on a phone viewport.',
    body: 'On mobile, the monochrome system, moon hero, and section rhythm hold — navbar collapses cleanly, covers stack, and typography stays readable without losing the Apple-like calm.',
    highlights: [
      'Responsive hero and section stack',
      'Mobile nav without visual clutter',
      'Touch-friendly work covers',
    ],
  },
] as const

function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(`scs-${id}`))
      .filter(Boolean) as HTMLElement[]
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id.replace(/^scs-/, ''))
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.55] },
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [ids])

  return active
}

export function SiteCaseStudyPage() {
  const ids = useMemo(() => SECTIONS.map((s) => s.id), [])
  const active = useScrollSpy(ids)

  return (
    <div className="site-case-study">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@600;700&display=swap");

        .site-case-study {
          --cs-bg: #0A0B0E;
          --cs-surface: #12141A;
          --cs-elevated: #181B22;
          --cs-border: rgba(242,241,238,0.10);
          --cs-text: #F2F1EE;
          --cs-muted: #9A9A96;
          --cs-faint: #6E6E6A;
          --cs-accent: #F2F1EE;
          --cs-font: "Manrope", system-ui, sans-serif;
          --cs-display: "Syne", system-ui, sans-serif;

          min-height: 100vh;
          background: var(--cs-bg);
          color: var(--cs-text);
          font-family: var(--cs-font);
          font-size: 15px;
          line-height: 1.55;
        }

        .site-case-study * { box-sizing: border-box; }

        .scs-hero {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 32px clamp(20px, 5vw, 64px) 56px;
          overflow: hidden;
          background:
            radial-gradient(ellipse 60% 45% at 70% 15%, rgba(242,241,238,0.08), transparent 55%),
            linear-gradient(180deg, #0E1014 0%, #0A0B0E 100%);
        }

        .scs-hero-media { position: absolute; inset: 0; pointer-events: none; }
        .scs-hero-media img {
          position: absolute;
          right: -2%;
          top: 8%;
          width: min(58vw, 720px);
          border-radius: 16px;
          border: 1px solid var(--cs-border);
          opacity: 0.7;
          transform: perspective(1400px) rotateY(-8deg) rotateX(2deg);
          mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 82%, transparent 100%),
            linear-gradient(180deg, #000 58%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 82%, transparent 100%),
            linear-gradient(180deg, #000 58%, transparent 100%);
          mask-composite: intersect;
          -webkit-mask-composite: source-in;
        }

        .scs-hero-inner { position: relative; z-index: 1; max-width: 640px; }

        .scs-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .scs-brand-mark {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--cs-text);
        }
        .scs-brand-name {
          font-family: var(--cs-display);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .scs-brand-sub {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cs-muted);
          margin-top: 4px;
        }

        .scs-hero h1 {
          margin: 0 0 16px;
          font-family: var(--cs-display);
          font-size: clamp(34px, 5.2vw, 54px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.08;
        }
        .scs-hero p.lead {
          margin: 0 0 28px;
          color: var(--cs-muted);
          font-size: 17px;
          max-width: 42ch;
        }

        .scs-cta-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .scs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-family: var(--cs-font);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          color: inherit;
        }
        .scs-btn-primary { background: var(--cs-text); color: #0A0B0E; }
        .scs-btn-ghost {
          background: transparent;
          border-color: var(--cs-border);
          color: var(--cs-text);
        }

        .scs-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 40px) 96px;
        }

        .scs-toc {
          position: sticky;
          top: 24px;
          align-self: start;
          padding: 48px 16px 24px 0;
          max-height: calc(100vh - 48px);
          overflow: auto;
        }
        .scs-toc-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cs-faint);
          margin-bottom: 14px;
          padding-left: 10px;
        }
        .scs-toc a {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          color: var(--cs-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          border-left: 2px solid transparent;
        }
        .scs-toc a:hover { color: var(--cs-text); background: rgba(242,241,238,0.04); }
        .scs-toc a.active {
          color: var(--cs-text);
          border-left-color: var(--cs-text);
          background: rgba(242,241,238,0.06);
        }
        .scs-toc .n {
          font-variant-numeric: tabular-nums;
          color: var(--cs-faint);
          font-size: 11px;
          min-width: 18px;
        }

        .scs-main { padding-top: 40px; min-width: 0; }
        .scs-intro {
          padding: 24px 0 48px;
          border-bottom: 1px solid var(--cs-border);
          margin-bottom: 8px;
        }
        .scs-intro h2 {
          margin: 0 0 10px;
          font-family: var(--cs-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .scs-intro p { margin: 0; color: var(--cs-muted); max-width: 62ch; }
        .scs-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 20px;
          margin-top: 20px;
          font-size: 13px;
          color: var(--cs-faint);
        }
        .scs-meta strong { color: var(--cs-muted); font-weight: 600; }

        .scs-section {
          padding: 56px 0;
          border-bottom: 1px solid var(--cs-border);
          scroll-margin-top: 24px;
        }
        .scs-section:last-child { border-bottom: none; }
        .scs-kicker {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          color: var(--cs-muted);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .scs-kicker .route {
          color: var(--cs-faint);
          font-weight: 500;
          letter-spacing: 0;
          text-transform: none;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
        }
        .scs-section h3 {
          margin: 0 0 10px;
          font-family: var(--cs-display);
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .scs-section .summary {
          margin: 0 0 16px;
          font-size: 17px;
          font-weight: 500;
          max-width: 48ch;
        }
        .scs-section .body {
          margin: 0 0 20px;
          color: var(--cs-muted);
          max-width: 62ch;
        }
        .scs-points {
          list-style: none;
          margin: 0 0 28px;
          padding: 0;
          display: grid;
          gap: 8px;
          max-width: 560px;
        }
        .scs-points li {
          position: relative;
          padding-left: 16px;
          color: var(--cs-muted);
          font-size: 14px;
        }
        .scs-points li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cs-text);
        }

        .scs-frame {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--cs-border);
          background: var(--cs-surface);
        }
        .scs-frame-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: var(--cs-elevated);
          border-bottom: 1px solid var(--cs-border);
        }
        .scs-frame-bar i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(242,241,238,0.2);
          display: block;
        }
        .scs-frame-bar span {
          margin-left: 8px;
          font-size: 11px;
          color: var(--cs-faint);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .scs-frame img {
          display: block;
          width: 100%;
          height: auto;
          background: #000;
        }

        .scs-footer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 48px clamp(16px, 4vw, 40px) 80px;
          border-top: 1px solid var(--cs-border);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .scs-footer p { margin: 0; color: var(--cs-muted); max-width: 42ch; }

        @media (max-width: 900px) {
          .scs-layout { grid-template-columns: 1fr; }
          .scs-toc { display: none; }
          .scs-hero-media img {
            opacity: 0.28;
            right: -20%;
            width: 90vw;
            transform: none;
          }
        }
      `}</style>

      <header className="scs-hero">
        <div className="scs-hero-media" aria-hidden>
          <img src="/site-case-study/01-hero.png" alt="" />
        </div>
        <div className="scs-hero-inner">
          <div className="scs-brand">
            <div>
              <div className="scs-brand-name">Ordinary Ghost</div>
              <div className="scs-brand-sub">Premium portfolio</div>
            </div>
          </div>
          <h1>Website case study</h1>
          <p className="lead">
            A screen-by-screen walkthrough of the Apple-style Ordinary Ghost
            portfolio — hero through contact, plus a project case study page.
          </p>
          <div className="scs-cta-row">
            <a className="scs-btn scs-btn-primary" href="#scs-hero">
              Start walkthrough
            </a>
            <Link className="scs-btn scs-btn-ghost" to="/">
              Open live site
            </Link>
          </div>
        </div>
      </header>

      <div className="scs-layout">
        <nav className="scs-toc" aria-label="Screen outline">
          <div className="scs-toc-label">Screens</div>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#scs-${s.id}`}
              className={active === s.id ? 'active' : undefined}
            >
              <span className="n">{s.step}</span>
              {s.title}
            </a>
          ))}
        </nav>

        <div className="scs-main">
          <div className="scs-intro">
            <h2>Product walkthrough</h2>
            <p>
              Ordinary Ghost is a premium monochrome developer portfolio —
              night sky hero, editorial sections, selected work covers, and
              deep project case studies. Built slowly; meant to last.
            </p>
            <div className="scs-meta">
              <span>
                <strong>Product</strong> · Portfolio website
              </span>
              <span>
                <strong>Screens</strong> · {SECTIONS.length}
              </span>
              <span>
                <strong>Path</strong> · Hero → Mobile
              </span>
            </div>
          </div>

          {SECTIONS.map((s) => (
            <section key={s.id} id={`scs-${s.id}`} className="scs-section">
              <div className="scs-kicker">
                <span>Step {s.step}</span>
                <span className="route">{s.route}</span>
              </div>
              <h3>{s.title}</h3>
              <p className="summary">{s.summary}</p>
              <p className="body">{s.body}</p>
              <ul className="scs-points">
                {s.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <figure className="scs-frame">
                <div className="scs-frame-bar">
                  <i />
                  <i />
                  <i />
                  <span>ordinary-ghost · {s.id}</span>
                </div>
                <img
                  src={s.image}
                  alt={`${s.title} on the Ordinary Ghost portfolio`}
                  loading="lazy"
                />
              </figure>
            </section>
          ))}
        </div>
      </div>

      <footer className="scs-footer">
        <p>
          Premium Apple-style portfolio for Shayan Ahmed — calm surfaces,
          deliberate motion, and work that opens into full case studies.
        </p>
        <Link className="scs-btn scs-btn-primary" to="/">
          Visit portfolio
        </Link>
      </footer>
    </div>
  )
}

#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const repoRoot = process.cwd()
const distDir = path.join(repoRoot, 'dist')
const presentationsDir = path.join(repoRoot, 'presentations')
const logoSource = path.join(
  repoRoot,
  'node_modules',
  'slidev-theme-oxrse',
  'img',
  'logos',
  '2024_oxrse_next_to_oxford.svg',
)
const logoDir = path.join(distDir, 'assets')
const logoDest = path.join(logoDir, 'oxrse-logo.svg')

const courseOrder = [
  'introduction',
  'object_oriented',
  'functional',
  'version_control',
  'collaborative_code_development',
  'testing',
  'packaging_dependency',
  'containerisation',
  'hpc',
  'snakemake',
]

const descriptions = {
  introduction: 'Why software engineering matters in research, how the course is structured, and where modern tooling and AI fit in.',
  object_oriented: 'Core OO design ideas, modelling techniques, and the tradeoffs behind classes, interfaces, and composition.',
  functional: 'Pure functions, immutability, higher-order programming, and ways to make code simpler to reason about.',
  version_control: 'A practical Git foundation for safer collaboration, reproducibility, and confident change management.',
  collaborative_code_development: 'Working effectively with branches, pull requests, issue trackers, and code review in shared repositories.',
  testing: 'Testing strategies, unit and integration testing, and how to use tests to improve reliability without slowing delivery.',
  packaging_dependency: 'Managing environments, dependencies, and packaging workflows so software stays repeatable and distributable.',
  containerisation: 'Using Docker to package applications and environments consistently across development, CI, and deployment.',
  hpc: 'An introduction to high-performance computing concepts, architectures, and ways to adapt software for larger systems.',
  snakemake: 'Building reproducible computational workflows with rules, dependencies, and scalable automation.',
}

const audiences = {
  introduction: 'Framing',
  object_oriented: 'Design',
  functional: 'Programming',
  version_control: 'Collaboration',
  collaborative_code_development: 'Teamwork',
  testing: 'Quality',
  packaging_dependency: 'Environments',
  containerisation: 'Deployment',
  hpc: 'Infrastructure',
  snakemake: 'Automation',
}

async function readPresentationMeta(slug) {
  const file = path.join(presentationsDir, slug, 'slides.md')
  const contents = await fs.readFile(file, 'utf8')
  const frontmatterMatch = contents.match(/^---\n([\s\S]*?)\n---/)
  const frontmatter = frontmatterMatch ? YAML.parse(frontmatterMatch[1]) : {}
  return {
    slug,
    title: frontmatter.title || humanize(slug),
    description: descriptions[slug] || 'Course presentation',
    audience: audiences[slug] || 'Presentation',
    href: `./${slug}/index.html`,
  }
}

function humanize(slug) {
  return slug
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function getPresentationEntries() {
  const dirEntries = await fs.readdir(presentationsDir, { withFileTypes: true })
  const slugs = dirEntries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  const ordered = [
    ...courseOrder.filter(slug => slugs.includes(slug)),
    ...slugs.filter(slug => !courseOrder.includes(slug)).sort(),
  ]
  return Promise.all(ordered.map(readPresentationMeta))
}

async function readEventSchedule() {
  const trainingEvent = process.env.TRAINING_EVENT
  if (!trainingEvent)
    return null

  const eventPath = path.join(repoRoot, 'events', `${trainingEvent}.yaml`)
  try {
    const contents = await fs.readFile(eventPath, 'utf8')
    const parsed = YAML.parse(contents)
    return {
      name: humanize(trainingEvent.replace(/-/g, '_')),
      year: parsed?.year,
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    }
  }
  catch {
    return null
  }
}

function buildPlausibleSnippet() {
  const domain = process.env.PLAUSIBLE_DOMAIN
  if (!domain)
    return ''

  const src = process.env.PLAUSIBLE_SRC || 'https://plausible.io/js/script.outbound-links.js'
  const api = process.env.PLAUSIBLE_API
  const apiAttribute = api ? ` data-api="${escapeHtml(api)}"` : ''
  return `  <script defer data-domain="${escapeHtml(domain)}"${apiAttribute} src="${escapeHtml(src)}"></script>\n`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderStats(presentations, eventSchedule) {
  const stats = [
    { value: String(presentations.length), label: 'presentations' },
    { value: 'Slidev', label: 'delivery format' },
  ]

  if (eventSchedule?.sessions?.length)
    stats.push({ value: String(eventSchedule.sessions.length), label: 'scheduled sessions' })
  else
    stats.push({ value: 'OxRSE', label: 'theme and branding' })

  return stats.map(stat => `
          <div class="stat">
            <strong>${escapeHtml(stat.value)}</strong>
            <span>${escapeHtml(stat.label)}</span>
          </div>`).join('')
}

function renderEventPanel(eventSchedule) {
  if (!eventSchedule?.sessions?.length) {
    return `
        <aside class="schedule-card">
          <p class="eyebrow">Course Structure</p>
          <h2>Built as a browsable set of self-contained sessions.</h2>
          <p>Each presentation opens directly into its own Slidev deck, so attendees can jump to a topic without losing the overall course context.</p>
          <p class="schedule-note">Set <code>TRAINING_EVENT</code> during build to surface the current scheduled run here.</p>
        </aside>`
  }

  const sessions = eventSchedule.sessions.slice(0, 6).map(session => `
            <li>
              <span>${escapeHtml(session.date)}</span>
              <strong>${escapeHtml(session.topic)}</strong>
              <em>${escapeHtml(session.slot)}</em>
            </li>`).join('')

  const remaining = eventSchedule.sessions.length - 6
  const suffix = remaining > 0
    ? `<p class="schedule-note">Plus ${remaining} more session${remaining === 1 ? '' : 's'} in this event.</p>`
    : ''

  return `
        <aside class="schedule-card">
          <p class="eyebrow">Current Training Event</p>
          <h2>${escapeHtml(eventSchedule.name)}${eventSchedule.year ? ` ${escapeHtml(eventSchedule.year)}` : ''}</h2>
          <ul class="schedule-list">${sessions}
          </ul>
          ${suffix}
        </aside>`
}

function renderCards(presentations) {
  return presentations.map((presentation, index) => `
          <a class="deck-card" href="${presentation.href}">
            <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
            <div class="card-copy">
              <p class="card-kicker">${escapeHtml(presentation.audience)}</p>
              <h3>${escapeHtml(presentation.title)}</h3>
              <p>${escapeHtml(presentation.description)}</p>
            </div>
            <span class="card-cta">Open deck</span>
          </a>`).join('')
}

function renderHtml(presentations, eventSchedule) {
  const plausibleSnippet = buildPlausibleSnippet()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oxford RSE Software Engineering Course</title>
  <meta name="description" content="Browse the Oxford Research Software Engineering course presentations." />
${plausibleSnippet}  <style>
    :root {
      --oxrse-blue: #002147;
      --oxrse-blue-strong: #00152f;
      --oxrse-ink: #122033;
      --oxrse-muted: #536277;
      --oxrse-line: rgba(0, 33, 71, 0.12);
      --oxrse-panel: rgba(255, 255, 255, 0.78);
      --oxrse-panel-strong: #ffffff;
      --oxrse-highlight: #b9d9eb;
      --oxrse-highlight-strong: #78b3cf;
      --oxrse-wash: #edf4f8;
      --oxrse-shadow: 0 24px 80px rgba(0, 33, 71, 0.14);
      --oxrse-radius: 28px;
      --oxrse-max-width: 1200px;
    }

    * { box-sizing: border-box; }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--oxrse-ink);
      background:
        radial-gradient(circle at top left, rgba(120, 179, 207, 0.38), transparent 28rem),
        radial-gradient(circle at top right, rgba(0, 33, 71, 0.1), transparent 26rem),
        linear-gradient(180deg, #f7fafc 0%, #edf4f8 42%, #ffffff 100%);
      min-height: 100vh;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(0, 33, 71, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 33, 71, 0.03) 1px, transparent 1px);
      background-size: 28px 28px;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.42), transparent 72%);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page-shell {
      width: min(calc(100% - 2rem), var(--oxrse-max-width));
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero {
      margin: 1rem auto 0;
      padding: 1rem;
    }

    .hero-panel {
      overflow: hidden;
      position: relative;
      background:
        linear-gradient(140deg, rgba(0, 33, 71, 0.98), rgba(0, 21, 47, 0.96)),
        var(--oxrse-blue);
      color: white;
      border-radius: calc(var(--oxrse-radius) + 6px);
      box-shadow: var(--oxrse-shadow);
      padding: clamp(1.25rem, 3vw, 2rem);
      isolation: isolate;
    }

    .hero-panel::before,
    .hero-panel::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(185, 217, 235, 0.16);
      z-index: -1;
    }

    .hero-panel::before {
      width: 28rem;
      height: 28rem;
      right: -8rem;
      top: -12rem;
    }

    .hero-panel::after {
      width: 16rem;
      height: 16rem;
      left: 46%;
      bottom: -9rem;
      background: rgba(255, 255, 255, 0.08);
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: clamp(2rem, 6vw, 4rem);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }

    .brand img {
      height: 3rem;
      width: auto;
      flex: 0 0 auto;
    }

    .brand span {
      display: block;
      font-size: 0.92rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.82;
    }

    .brand strong {
      display: block;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 1.15rem;
      line-height: 1.2;
      margin-top: 0.15rem;
    }

    .hero-link {
      padding: 0.8rem 1rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(10px);
      transition: background 160ms ease, transform 160ms ease;
      white-space: nowrap;
    }

    .hero-link:hover,
    .hero-link:focus-visible {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.8fr);
      gap: 1.5rem;
      align-items: stretch;
    }

    .eyebrow {
      margin: 0 0 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.78rem;
      opacity: 0.72;
    }

    .hero-copy h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(2.4rem, 5.4vw, 4.8rem);
      line-height: 0.98;
      max-width: 10ch;
    }

    .hero-copy p {
      margin: 1rem 0 0;
      max-width: 58ch;
      font-size: 1.06rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.84);
    }

    .hero-actions {
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      align-items: center;
    }

    .button-primary,
    .button-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 3rem;
      padding: 0.85rem 1.2rem;
      border-radius: 999px;
      font-weight: 600;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .button-primary {
      background: white;
      color: var(--oxrse-blue);
    }

    .button-secondary {
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }

    .button-primary:hover,
    .button-primary:focus-visible,
    .button-secondary:hover,
    .button-secondary:focus-visible {
      transform: translateY(-1px);
    }

    .stats {
      margin-top: 2rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .stat {
      border-radius: 20px;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
    }

    .stat strong {
      display: block;
      font-size: 1.4rem;
      margin-bottom: 0.25rem;
    }

    .stat span {
      font-size: 0.92rem;
      color: rgba(255, 255, 255, 0.76);
    }

    .schedule-card {
      align-self: stretch;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--oxrse-radius);
      padding: 1.25rem;
      backdrop-filter: blur(10px);
    }

    .schedule-card h2 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 1.75rem;
      line-height: 1.15;
    }

    .schedule-card p,
    .schedule-note {
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.65;
    }

    .schedule-list {
      list-style: none;
      padding: 0;
      margin: 1.25rem 0 0;
      display: grid;
      gap: 0.8rem;
    }

    .schedule-list li {
      display: grid;
      gap: 0.18rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .schedule-list li:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .schedule-list span,
    .schedule-list em {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.68);
      font-style: normal;
    }

    .schedule-list strong {
      font-size: 1rem;
      line-height: 1.35;
    }

    .content {
      padding: 1rem 1rem 3rem;
    }

    .section-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      margin: 1.5rem 0 1.25rem;
    }

    .section-header h2 {
      margin: 0.15rem 0 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(2rem, 3.2vw, 2.8rem);
      color: var(--oxrse-blue);
    }

    .section-header p {
      margin: 0;
      max-width: 42ch;
      color: var(--oxrse-muted);
      line-height: 1.65;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .deck-card {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: start;
      min-height: 100%;
      padding: 1.15rem 1.2rem;
      border-radius: var(--oxrse-radius);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92));
      border: 1px solid var(--oxrse-line);
      box-shadow: 0 10px 30px rgba(0, 33, 71, 0.07);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .deck-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 7px;
      background: linear-gradient(180deg, var(--oxrse-highlight-strong), var(--oxrse-blue));
    }

    .deck-card:hover,
    .deck-card:focus-visible {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 33, 71, 0.12);
      border-color: rgba(0, 33, 71, 0.18);
    }

    .card-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.8rem;
      height: 2.8rem;
      border-radius: 18px;
      background: var(--oxrse-wash);
      color: var(--oxrse-blue);
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .card-copy h3 {
      margin: 0.1rem 0 0.55rem;
      font-size: 1.3rem;
      line-height: 1.2;
      color: var(--oxrse-blue);
    }

    .card-copy p {
      margin: 0;
      color: var(--oxrse-muted);
      line-height: 1.6;
    }

    .card-kicker {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      color: #6b7b90;
    }

    .card-cta {
      align-self: center;
      color: var(--oxrse-blue);
      font-weight: 700;
      white-space: nowrap;
    }

    .footer {
      padding: 0 1rem 2.5rem;
      color: var(--oxrse-muted);
      font-size: 0.95rem;
    }

    .footer-panel {
      border-top: 1px solid var(--oxrse-line);
      padding-top: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    code {
      font-family: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.92em;
      background: rgba(255, 255, 255, 0.14);
      padding: 0.15rem 0.35rem;
      border-radius: 0.4rem;
    }

    @media (max-width: 980px) {
      .hero-grid,
      .cards {
        grid-template-columns: 1fr;
      }

      .section-header,
      .footer-panel,
      .topbar {
        align-items: start;
        flex-direction: column;
      }

      .deck-card {
        grid-template-columns: auto 1fr;
      }

      .card-cta {
        grid-column: 2;
      }
    }

    @media (max-width: 640px) {
      .hero,
      .content,
      .footer {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .hero-panel {
        border-radius: 24px;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .deck-card {
        grid-template-columns: 1fr;
      }

      .card-index,
      .card-cta {
        grid-column: auto;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="page-shell hero-panel">
        <div class="topbar">
          <div class="brand">
            <img src="./assets/oxrse-logo.svg" alt="Oxford Research Software Engineering Group" />
            <div>
              <span>Oxford Research Software Engineering Group</span>
              <strong>Software Engineering Course</strong>
            </div>
          </div>
          <a class="hero-link" href="https://www.rse.ox.ac.uk/">rse.ox.ac.uk</a>
        </div>

        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Slidev Course Hub</p>
            <h1>Browse the course like a programme, not a file listing.</h1>
            <p>This landing page uses the Oxford RSE theme’s core palette and a layout direction influenced by the main Oxford RSE site: strong branded hero treatment, structured cards, and clearer paths into each session.</p>
            <div class="hero-actions">
              <a class="button-primary" href="${presentations[0]?.href || '#presentations'}">Start with ${escapeHtml(presentations[0]?.title || 'the first deck')}</a>
              <a class="button-secondary" href="#presentations">View all presentations</a>
            </div>
            <div class="stats">${renderStats(presentations, eventSchedule)}
            </div>
          </div>
${renderEventPanel(eventSchedule)}
        </div>
      </div>
    </section>

    <section class="content">
      <div class="page-shell">
        <div class="section-header" id="presentations">
          <div>
            <p class="eyebrow" style="color: var(--oxrse-blue); opacity: 1;">Presentations</p>
            <h2>All course sessions</h2>
          </div>
          <p>Each card links directly to a self-contained Slidev build. The ordering follows the teaching flow rather than the directory names.</p>
        </div>

        <div class="cards">
${renderCards(presentations)}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="page-shell footer-panel">
      <span>Built from the Oxford RSE Slidev course repository.</span>
      <span>Plausible tracking is optional and enabled only when <code>PLAUSIBLE_DOMAIN</code> is set at build time.</span>
    </div>
  </footer>
</body>
</html>
`
}

async function main() {
  const presentations = await getPresentationEntries()
  const eventSchedule = await readEventSchedule()

  await fs.mkdir(logoDir, { recursive: true })
  await fs.copyFile(logoSource, logoDest)
  await fs.writeFile(path.join(distDir, 'index.html'), renderHtml(presentations, eventSchedule))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

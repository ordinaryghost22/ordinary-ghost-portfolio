/**
 * Capture Ordinary Ghost portfolio screens for the site case study.
 * Usage: node scripts/capture-site-case-study.mjs
 */
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'site-case-study')
const BASE = process.env.CASE_STUDY_URL || 'http://127.0.0.1:5175'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true, channel: 'chrome' })

async function shot(page, id) {
  const file = path.join(OUT, `${id}.png`)
  await page.waitForTimeout(600)
  await page.screenshot({ path: file, fullPage: false })
  console.log('saved', file)
}

async function scrollToId(page, id) {
  await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ block: 'start' })
  }, id)
  await page.waitForTimeout(900)
}

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(2500)

  await shot(page, '01-hero')

  await scrollToId(page, 'about')
  await shot(page, '02-about')

  await scrollToId(page, 'work')
  await shot(page, '03-work')

  await scrollToId(page, 'method')
  await shot(page, '04-method')

  await scrollToId(page, 'resume')
  await shot(page, '05-resume')

  await scrollToId(page, 'contact')
  await shot(page, '06-contact')

  await page.goto(`${BASE}/work/irepair`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })
  await page.waitForTimeout(1500)
  await shot(page, '07-project-case-study')

  await context.close()
}

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(2500)
  await shot(page, '08-mobile')
  await context.close()
}

await browser.close()
console.log('Done. Screenshots in', OUT)

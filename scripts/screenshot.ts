// Takes a timestamped screenshot of the running dev server and saves it to log/
// Usage: npx tsx scripts/screenshot.ts [port=5175] [wait=6000]

import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root      = path.resolve(__dirname, '..')
const logDir    = path.join(root, 'log')
fs.mkdirSync(logDir, { recursive: true })

const port    = parseInt(process.argv[2] ?? '5175', 10)
const waitMs  = parseInt(process.argv[3] ?? '6000', 10)
const url     = `http://localhost:${port}/`

console.log(`📸  Connecting to ${url}  (waiting ${waitMs}ms for 3D render)…`)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080 })

try {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
} catch {
  // networkidle0 may timeout on a 3D app due to animation frames — that's fine
}

// Allow 3D scene to fully render
await new Promise(r => setTimeout(r, waitMs))

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const outPath = path.join(logDir, `screenshot-${stamp}.png`)
await page.screenshot({ path: outPath, fullPage: false })
console.log(`✅  Saved → ${outPath}`)

await browser.close()

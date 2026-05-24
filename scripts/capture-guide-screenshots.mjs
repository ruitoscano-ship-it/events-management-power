/**
 * Captures PNGs for docs/GUIA-RAPIDO.md
 * Prereqs: npm run dev (or GUIDE_BASE_URL), .env with Supabase, at least one event.
 * Usage: node scripts/capture-guide-screenshots.mjs
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'docs', 'screenshots')
const BASE = process.env.GUIDE_BASE_URL ?? 'http://127.0.0.1:5173'

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    console.error(
      'Playwright não instalado. Corre: npx playwright install chromium\n' +
        'Depois: npm i -D playwright',
    )
    process.exit(1)
  }
}

async function shot(page, file, opts = {}) {
  const p = path.join(OUT, file)
  await page.screenshot({ path: p, ...opts })
  console.log('  ✓', file)
}

async function wait(page, ms = 800) {
  await page.waitForTimeout(ms)
}

async function main() {
  const { chromium } = await loadPlaywright()
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()

  console.log('Base URL:', BASE)

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await wait(page, 1200)
  await shot(page, '01-entrada.png')

  await page.getByRole('button', { name: /sou organizador/i }).click()
  await wait(page)
  await shot(page, '02-login-organizador.png')

  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await wait(page, 2500)
  await shot(page, '03-escolher-evento.png', { fullPage: true })

  const eventCard = page.locator('.rounded-xl.border button').first()
  if (await eventCard.count()) {
    await eventCard.click()
    await wait(page, 2000)
    await shot(page, '04-horario-ver.png', { fullPage: true })

    const editToggle = page.getByRole('button', { name: 'Editar', exact: true })
    if (await editToggle.isVisible().catch(() => false)) {
      await editToggle.click()
      await wait(page)
      await shot(page, '05-horario-editar.png', { fullPage: true })
      await page.getByRole('button', { name: 'Ver', exact: true }).click()
      await wait(page, 400)
    }

    await page.getByRole('button', { name: 'EQUIPA', exact: true }).click()
    await wait(page)
    await shot(page, '06-equipa.png', { fullPage: true })

    await page.getByRole('button', { name: 'ADMIN', exact: true }).click()
    await wait(page)
    await shot(page, '07-admin.png', { fullPage: true })
  } else {
    console.warn('  ⚠ Sem cartões de evento — capturas 04–07 ignoradas')
  }

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await wait(page)
  await page.getByRole('button', { name: /sou voluntário/i }).click()
  await wait(page)
  await shot(page, '08-voluntario-auth.png')

  const ctx2 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })
  const page2 = await ctx2.newPage()
  await page2.goto(BASE, { waitUntil: 'networkidle' })
  await page2.getByRole('button', { name: /sou voluntário/i }).click()
  await wait(page2)

  const phone = process.env.GUIDE_VOLUNTEER_PHONE ?? '912000001'
  const pin = process.env.GUIDE_VOLUNTEER_PIN ?? '1234'
  await page2.getByPlaceholder(/9\d{8}|telefone/i).first().fill(phone).catch(() =>
    page2.locator('input').nth(0).fill(phone),
  )
  await page2.locator('input[type="password"], input[inputmode="numeric"]').first().fill(pin)
  await page2.getByRole('button', { name: /entrar/i }).click()
  await wait(page2, 2500)

  if (!page2.url().includes('5173')) await wait(page2, 1000)
  await shot(page2, '09-voluntario-eventos.png', { fullPage: true }).catch(() =>
    console.warn('  ⚠ 09-voluntario-eventos — login voluntário falhou (ajusta GUIDE_VOLUNTEER_PHONE/PIN)'),
  )

  const volCard = page2.locator('.rounded-xl.border button').first()
  if (await volCard.count()) {
    await volCard.click()
    await wait(page2, 2000)
    await shot(page2, '10-voluntario-horario.png', { fullPage: true })
  }

  await browser.close()
  console.log('\nConcluído → docs/screenshots/')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

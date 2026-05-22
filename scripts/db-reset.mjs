/**
 * Reset completo + re-seed da base Supabase.
 * Requer SUPABASE_DB_PASSWORD ou DATABASE_URL no .env
 *
 * Uso: npm run db:reset
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  try {
    const raw = readFileSync(join(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i < 0) continue
      const k = t.slice(0, i).trim()
      const v = t.slice(i + 1).trim()
      if (!process.env[k]) process.env[k] = v
    }
  } catch {
    /* no .env */
  }
}

loadEnv()

const PROJECT_REF = 'dykmalcwpynvsuyuuuvd'
const password = process.env.SUPABASE_DB_PASSWORD
const databaseUrl =
  process.env.DATABASE_URL ||
  (password
    ? `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
    : null)

if (!databaseUrl) {
  console.error('❌ Define DATABASE_URL ou SUPABASE_DB_PASSWORD no .env')
  process.exit(1)
}

const steps = [
  { label: 'Reset (truncate)', file: 'supabase/reset.sql' },
  { label: 'Schema / colunas', file: 'supabase/migrations/001_app_columns.sql' },
  { label: 'Colunas evento', file: 'supabase/migrations/002_events_day_pairs.sql' },
  { label: 'Planta salão', file: 'supabase/migrations/003_venue_layout.sql' },
  { label: 'Sponsors e financeiro', file: 'supabase/migrations/004_sponsors_financials.sql' },
  { label: 'Contas organizador', file: 'supabase/organizer_accounts.sql' },
  { label: 'Seed evento + dados', file: 'supabase/seed.sql' },
]

async function runFile(client, relPath) {
  const path = join(root, relPath)
  const sql = readFileSync(path, 'utf8')
  console.log(`\n▶ ${relPath}`)
  await client.query(sql)
  console.log(`✅ ${relPath}`)
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('✅ Ligado ao Postgres Supabase')
  console.log('⚠️  Isto apaga TODOS os eventos, voluntários, contas e re-seed demo.')

  for (const step of steps) {
    console.log(`\n── ${step.label}`)
    await runFile(client, step.file)
  }

  const { rows } = await client.query(`
    select
      (select count(*)::int from events) as events,
      (select count(*)::int from schedule_blocks) as schedule_blocks,
      (select count(*)::int from volunteers) as volunteers,
      (select count(*)::int from volunteer_availability) as availability,
      (select count(*)::int from contributions) as contributions,
      (select count(*)::int from volunteer_tasks) as tasks,
      (select count(*)::int from volunteer_accounts) as volunteer_accounts,
      (select count(*)::int from organizer_accounts) as organizer_accounts
  `)
  console.log('\n📊 Contagens após re-seed:', rows[0])
  console.log('\n✅ Reset concluído. Admin: admin / admin')
} catch (e) {
  console.error('❌ Erro:', e instanceof Error ? e.message : e)
  process.exit(1)
} finally {
  await client.end()
}

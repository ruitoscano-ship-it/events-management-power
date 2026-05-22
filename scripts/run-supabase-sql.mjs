/**
 * Executa os scripts SQL no Postgres do Supabase.
 * Requer DATABASE_URL no .env (Settings → Database → Connection string → URI)
 *
 * Uso: npm run db:migrate
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
  console.error('❌ Define DATABASE_URL ou SUPABASE_DB_PASSWORD no ficheiro .env')
  console.error('   Supabase → Project Settings → Database → Connection string (URI)')
  process.exit(1)
}

const files = [
  'supabase/schema.sql',
  'supabase/volunteer_accounts.sql',
  'supabase/organizer_accounts.sql',
  'supabase/migrations/001_app_columns.sql',
  'supabase/migrations/002_events_day_pairs.sql',
  'supabase/migrations/003_venue_layout.sql',
  'supabase/migrations/004_sponsors_financials.sql',
  'supabase/seed.sql',
]

async function runFile(client, relPath) {
  const path = join(root, relPath)
  let sql
  try {
    sql = readFileSync(path, 'utf8')
  } catch {
    console.log(`⏭️  ${relPath} (não encontrado, ignorado)`)
    return
  }
  console.log(`\n▶ ${relPath}`)
  try {
    await client.query(sql)
    console.log(`✅ ${relPath}`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      console.log(`⚠️  ${relPath} (já aplicado parcialmente): ${msg.slice(0, 120)}`)
    } else {
      throw e
    }
  }
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('✅ Ligado ao Postgres Supabase')
  for (const f of files) {
    await runFile(client, f)
  }
  const { rows } = await client.query(`
    select
      (select count(*)::int from events) as events,
      (select count(*)::int from volunteer_accounts) as volunteer_accounts,
      (select count(*)::int from organizer_accounts) as organizer_accounts,
      (select count(*)::int from volunteers) as volunteers
  `)
  console.log('\n📊 Contagens:', rows[0])
} catch (e) {
  console.error('❌ Erro:', e instanceof Error ? e.message : e)
  process.exit(1)
} finally {
  await client.end()
}

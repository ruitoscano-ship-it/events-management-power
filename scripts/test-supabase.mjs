/**
 * Testa ligação ao Supabase usando variáveis do .env (VITE_*).
 * Uso: npm run test:supabase
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('❌ Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env')
  process.exit(1)
}

console.log('URL:', url)
console.log('Key:', key.slice(0, 12) + '…' + key.slice(-4))

const supabase = createClient(url, key)

// Health: pedido mínimo à API REST
const health = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})
console.log(health.ok ? '✅ API REST acessível' : `❌ API REST: HTTP ${health.status}`)

const tables = [
  'events',
  'schedule_blocks',
  'volunteers',
  'volunteer_availability',
  'contributions',
  'volunteer_tasks',
]

let schemaOk = true
for (const table of tables) {
  const { error, count } = await supabase.from(table).select('id', { count: 'exact' }).limit(1)
  if (error) {
    const missing = error.message?.includes('schema cache') || error.code === 'PGRST205'
    console.error(
      `❌ ${table}:`,
      error.message,
      missing ? '→ executa supabase/schema.sql no SQL Editor' : '',
    )
    schemaOk = false
  } else {
    console.log(`✅ ${table}: ${count ?? 0} registos`)
  }
}

if (!schemaOk) {
  console.log('\n📋 Próximo passo: Supabase Dashboard → SQL Editor → colar e executar:')
  console.log('   1. supabase/schema.sql')
  console.log('   2. supabase/seed.sql (opcional, dados demo)')
  process.exit(1)
}

const { data: events, error: evErr } = await supabase
  .from('events')
  .select('id, name, event_date, venue')
  .order('event_date', { ascending: false })
  .limit(3)

if (evErr) {
  console.error('❌ events:', evErr.message)
  process.exit(1)
}

console.log('\n✅ Ligação completa. Eventos:', events?.length ? events : '(vazio — corre seed.sql)')

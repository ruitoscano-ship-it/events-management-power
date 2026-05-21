/**
 * Define variáveis de build no projeto Cloudflare Pages (Production + Preview).
 * Requer: CLOUDFLARE_API_TOKEN com permissão "Cloudflare Pages — Edit"
 * Uso: node --env-file=.env scripts/configure-pages-env.mjs
 */
import { readFileSync } from 'fs'

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? 'fcb192819ff6c403c3aae47e508948be'
const project = process.env.CLOUDFLARE_PAGES_PROJECT ?? 'events-management-power'
const token = process.env.CLOUDFLARE_API_TOKEN

if (!token) {
  console.error('❌ Define CLOUDFLARE_API_TOKEN (Dashboard → My Profile → API Tokens)')
  console.error('   Permissões: Account → Cloudflare Pages → Edit')
  process.exit(1)
}

const viteUrl = process.env.VITE_SUPABASE_URL
const viteKey = process.env.VITE_SUPABASE_ANON_KEY

const envVars = {
  NODE_VERSION: { value: '20' },
}
if (viteUrl) envVars.VITE_SUPABASE_URL = { value: viteUrl }
if (viteKey) envVars.VITE_SUPABASE_ANON_KEY = { value: viteKey }

const getRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}`,
  { headers: { Authorization: `Bearer ${token}` } },
)
const getJson = await getRes.json()
if (!getJson.success) {
  console.error('❌ GET project:', getJson.errors?.[0]?.message ?? getRes.status)
  process.exit(1)
}

const current = getJson.result
const patchBody = {
  deployment_configs: {
    production: {
      ...current.deployment_configs?.production,
      env_vars: { ...current.deployment_configs?.production?.env_vars, ...envVars },
    },
    preview: {
      ...current.deployment_configs?.preview,
      env_vars: { ...current.deployment_configs?.preview?.env_vars, ...envVars },
    },
  },
}

const patchRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}`,
  {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchBody),
  },
)
const patchJson = await patchRes.json()
if (!patchJson.success) {
  console.error('❌ PATCH env:', patchJson.errors?.[0]?.message ?? patchRes.status)
  process.exit(1)
}

console.log('✅ Variáveis de build atualizadas em', project)
console.log('   ', Object.keys(envVars).join(', '))

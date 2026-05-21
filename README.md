# EventFlow — Gestão de Eventos Desportivos

Aplicação web para planear eventos desportivos: **cronogramas**, **grelha horária**, **voluntários**, **disponibilidades**, **contribuições** (quem leva o quê) e **atividades**.

Exemplo incluído: **Campeonato Regional de Dança de Salão Desportiva 2026**.

## Stack

- **React + Vite + TypeScript + Tailwind**
- **Supabase** (PostgreSQL) — persistência opcional
- **Cloudflare Pages** — deploy estático

## Desenvolvimento local

```bash
npm install
npm run dev
```

Sem `.env`, os dados usam **localStorage** (modo demo).

## Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. SQL Editor → executar `supabase/schema.sql` e `supabase/seed.sql`
3. Copiar `.env.example` → `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Reiniciar `npm run dev`

## Deploy — Cloudflare Pages

Repositório: `https://github.com/ruitoscano-ship-it/events-management-power`

O projeto inclui `wrangler.toml` (output `dist`), `public/_redirects` (SPA) e `public/_headers` (cache dos assets).

### Opção A: Git (recomendado)

1. Garantir que `main` está no GitHub (já configurado).
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Autorizar GitHub e escolher `ruitoscano-ship-it/events-management-power`.
4. **Build settings** (o `wrangler.toml` pode pré-preencher o output directory):

| Campo | Valor |
|-------|--------|
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | *(deixar vazio — não usar `wrangler deploy`)* |
| Root directory | `/` |

5. **Environment variables** → **Production** e **Preview** (obrigatório se usares Supabase; o Vite embute-as no build):

| Variável | Onde obter |
|----------|------------|
| `NODE_VERSION` | `22` (Wrangler 4.x exige Node 22+; ver `.nvmrc`) |
| `VITE_SUPABASE_URL` | Supabase → **Project Settings** → **API** → **Project URL** (`https://….supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase → **API** → **anon public** |

Sem `VITE_*`, a app funciona em modo **localStorage** (demo).

6. **Save and Deploy**. Cada push a `main` dispara um novo deploy.

**Projeto já criado:** `events-management-power` → https://events-management-power.pages.dev

Se o projeto foi criado por CLI (`npm run deploy`) e **Git Provider** aparece como *No*:

1. [Pages → events-management-power → Settings → Builds & deployments](https://dash.cloudflare.com/fcb192819ff6c403c3aae47e508948be/pages/view/events-management-power/settings/builds)
2. **Connect to Git** → GitHub → `ruitoscano-ship-it/events-management-power`
3. Build: `npm run build`, output `dist`, branch `main`
4. **Environment variables** (Production + Preview): `NODE_VERSION=22`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. **Deploy command:** vazio (esta app é estática; Cloudflare publica `dist` após o build)
6. Guardar — o próximo push a `main` faz build na Cloudflare

#### Build a falhar com `npx wrangler deploy`

| Erro | Correção |
|------|----------|
| `Executing user deploy command: npx wrangler deploy` | **Melhor:** Settings → Builds → **apagar** o *Deploy command*; build `npm run build`, output `dist`. |
| `Missing entry-point to Worker script` / pede `[assets]` | O repo já inclui `[assets] directory = "./dist"` no `wrangler.toml` — faz push e **retry**. Build tem de correr **antes** do deploy (`npm run build`). |
| `Wrangler requires at least Node.js v22` | `NODE_VERSION=22` nas env vars do projeto. |
| `Invalid _redirects` / infinite loop | `public/_redirects` removido; SPA em `wrangler.toml` → `not_found_handling`. Push e retry. |
| Deploy command não pode ficar vazio | Build `npm run build` + deploy `npx wrangler deploy` (com `wrangler.toml` atual), ou **melhor:** deploy command vazio + output `dist`. |

Com API token (opcional, define env vars por CLI):

```bash
export CLOUDFLARE_API_TOKEN=...   # Pages Edit
node --env-file=.env scripts/configure-pages-env.mjs
```

### Opção A2: GitHub Actions (já no repo)

Workflow `.github/workflows/deploy-cloudflare-pages.yml` — deploy em cada push a `main`.

Secrets em **GitHub** → repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Valor |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | API token (Pages Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | `fcb192819ff6c403c3aae47e508948be` |
| `VITE_SUPABASE_URL` | igual ao `.env` |
| `VITE_SUPABASE_ANON_KEY` | igual ao `.env` |

### Opção B: CLI (Wrangler)

```bash
npm install
npx wrangler login          # uma vez
npm run deploy              # production
# npm run deploy:preview    # branch preview no mesmo projeto
```

As variáveis `VITE_*` têm de estar definidas **antes** do build. Na CLI, exporta-as no terminal ou define-as no dashboard Cloudflare e usa deploy via Git.

### Checklist pós-deploy

- [ ] Abrir o URL `.pages.dev` e alternar ORGANIZADOR / VOLUNTÁRIO
- [ ] Se usares Supabase: confirmar que o SQL em `supabase/schema.sql` foi executado
- [ ] Domínio próprio (opcional): Pages → **Custom domains** → adicionar DNS na Cloudflare

### SPA routing

`public/_redirects` envia todas as rotas para `index.html` (útil com React Router ou URLs diretas).

## Funcionalidades

- **Cronograma** — criar, editar e apagar blocos (provas, pausas, cerimónias)
- **Grelha** — vista horária: disponibilidade vs atividades por voluntário
- **Voluntários** — CRUD + janelas de disponibilidade
- **Quem leva o quê** — contribuições materiais
- **Atividades** — tarefas com horário e estado

## Estrutura

```
supabase/schema.sql   — tabelas PostgreSQL
supabase/seed.sql     — dados do campeonato de dança
src/context/          — estado e mutações (local + Supabase)
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção (`dist/`) |
| `npm run preview` | Pré-visualizar build |
| `npm run deploy` | Build + deploy Cloudflare Pages (production) |
| `npm run deploy:preview` | Build + deploy (branch preview) |

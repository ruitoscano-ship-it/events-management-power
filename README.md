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

### Opção A: Git (recomendado)

1. Push para `github.com/<utilizador>/events-management-power`
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Repositório: `events-management-power`
4. Configuração de build:

| Campo | Valor |
|-------|--------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

5. **Environment variables** (Production + Preview):

| Variável | Valor |
|----------|--------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon (pública) |

6. Deploy — cada push à branch `main` gera novo deploy.

### Opção B: CLI

```bash
npm run build
npx wrangler pages deploy dist --project-name=events-management-power
```

Definir variáveis no dashboard: **Pages** → projeto → **Settings** → **Environment variables**.

### SPA routing

O ficheiro `public/_redirects` envia todas as rotas para `index.html` (necessário se adicionares React Router no futuro).

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

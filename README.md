# WE ARE ENGLISH

Vite + React + TypeScript + Tailwind — **Activity Engine** com Supabase (Auth, Postgres, Storage, Edge Functions). **Sem Next.js.**

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test
npm run seed:sql
```

## Frontend env

Copie `.env.example` → `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

Não use `VITE_*` para `service_role`, ElevenLabs ou Speechace.

Sem env, o app funciona em modo offline (auth local + seed em memória).

## Banco (Supabase)

### Migration

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Arquivo: `supabase/migrations/20260822140000_activity_engine.sql`

Tabelas: `profiles`, `voices`, `activities`, `activity_attempts`  
Storage bucket: `activity-audio`  
RLS: aluno lê published; professora CRUD nas próprias (`is_system = false`); system só via duplicate.

Projeto (ref): ver `supabase/migrations/20260822140000_activity_engine.sql`.

### Seed (~64 system activities)

Fonte TS: `src/data/seed-activities.ts` (20 listening com áudio ElevenLabs + 5 por skill curada + mídia curta)  
SQL: `supabase/seed.sql` (gere com `npm run seed:sql`)

Em um banco que **já tem** áudios ElevenLabs, preferir sync (preserva `id`/`audio_url` dos listening):

```bash
npm run catalog:sync -- --dry-run
npm run catalog:sync
```

Reinstall completo (wipe system + insert; inclui `audio_url` dos listening conhecidos):

```bash
npm run seed:sql
# aplicar no projeto linkado / SQL editor, ou:
psql "$DATABASE_URL" -f supabase/seed.sql
```

### Roles

Admin oficial (produção): defina `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env.local` (sem defaults no repo).

Purge + bootstrap (precisa de `SUPABASE_SERVICE_ROLE_KEY`):

```bash
node scripts/create-admin-user.mjs
```

Promover professor (somente admin autenticado, via RPC):

```sql
select public.admin_set_user_role('<user-uuid>', 'teacher');
```

Admin UI: `/admin/activities` (TeacherRoute — autorização real é RLS + role no banco).

## Edge Functions

| Function | Uso |
|----------|-----|
| `generate-audio` | ElevenLabs → Storage `activity-audio` → `activities.audio_url` |
| `score-speaking` | Speechace speaking |
| `score-writing` | Speechace writing |

Secrets: `ELEVENLABS_API_KEY`, `SPEECHACE_API_KEY` (+ service role já disponível no runtime).

```bash
npx supabase functions deploy generate-audio
npx supabase functions deploy score-speaking
npx supabase functions deploy score-writing
```

Clients: `src/lib/integrations/elevenlabs.ts`, `src/lib/integrations/speechace.ts`.

## Fluxos

1. Aluno autentica → lista published → `/activity/:id/play` → `ActivityRenderer` → `activity_attempts`.
2. Listening sem áudio → o player mostra o transcript; admin gera áudio via Edge Function.
3. Speaking/Writing → Edge Functions (placeholder se a key não estiver setada).
4. Professora cria/edita/duplica/publica em `/admin/activities`.

### Áudio em lote (ElevenLabs)

Gera `audio_url` para activities de sistema `listening`/`reading` sem áudio:

```bash
# .env.local: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
# Edge Function secret (must start with sk_ — not the key ID):
#   npx supabase secrets set ELEVENLABS_API_KEY=sk_...
npm run audio:generate
npm run audio:generate -- --limit 10 --delay 1500
```

Requer usuário teacher/admin e `ELEVENLABS_API_KEY` válida na Edge Function. Sem `audio_url`, o player usa a voz do navegador (qualidade varia por PC) — por isso uns ouvintes soam “normais” e outros “robóticos”.

## Testes críticos

```bash
npm run test
```

Valida ~55–80 seeds curados, quizzes com 8–15 questões e ≥6 opções, fill_blank/pronunciation/criteria, e helpers de difficulty.

```bash
npm run seed:sql
```

Regenera `supabase/seed.sql` a partir de `src/data/seed-activities.ts`.

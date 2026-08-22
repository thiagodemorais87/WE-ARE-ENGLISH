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

### Seed (~168 system activities)

Fonte TS: `src/data/seed-activities.ts`  
SQL: `supabase/seed.sql` (gere com `npm run seed:sql`)

```bash
npm run seed:sql
# aplicar no projeto linkado / SQL editor, ou:
psql "$DATABASE_URL" -f supabase/seed.sql
```

### Roles

Promover professora:

```sql
update public.profiles set role = 'teacher' where id = '<auth-user-uuid>';
```

Admin UI: `/admin/activities` (TeacherRoute).

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
# .env.local (ou env do shell): SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm run audio:generate
npm run audio:generate -- --limit 10 --delay 1500
```

Requer usuário teacher/admin e `ELEVENLABS_API_KEY` na Edge Function. Há rate-limit/custo por caractere — o play não bloqueia se o áudio ainda não existir (transcript fica disponível).

## Testes críticos

```bash
npm run test
```

Valida ≥120 seeds, 12 tipos de engine (+ music/video/game), quizzes com ≥10 questões, helpers de difficulty e regras de edit/duplicate.

```bash
npm run seed:sql
```

Regenera `supabase/seed.sql` a partir de `src/data/seed-activities.ts`.

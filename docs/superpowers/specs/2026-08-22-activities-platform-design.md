# We Are English — Activities Platform Redesign

**Date:** 2026-08-22  
**Status:** Approved for planning  
**Product one-liner:** A place to practice English through interactive activities — a streaming-style catalog, not a teacher portfolio.

---

## 1. Decisions locked

| Topic | Choice |
|-------|--------|
| Delivery | Phased (B): shell → players → progress/cart |
| Auth | Local mock (React context + `localStorage`); interface ready for future Supabase |
| UI language | English throughout |
| Visual identity | Evolve existing brand (cherry / cobalt / soft pink); darker catalog atmosphere |
| Teacher / portfolio content | Removed entirely — product is activity-only |

---

## 2. Current baseline

- Stack: React 19, Vite, Tailwind 4, Motion, React Router 7, TypeScript.
- Today: single public Home portfolio (`/`). No auth library. Brand colors and fonts already defined in `src/constants/theme.ts`.
- Constraint: reuse existing dependencies; do not add packages unless necessary. Keep the project compiling (TypeScript / oxlint) after each phase.

---

## 3. Architecture approach

**Single app shell + real routes** (not a state-machine SPA, not early micro-frontends).

```text
App
├── AuthProvider (mock session)
├── AppHeader / MobileDrawer
├── Routes
│   ├── / (public or authenticated Home)
│   ├── /login, /signup
│   ├── /activities (protected)
│   ├── /activity/:id (protected)
│   ├── /activity/:id/play (protected)
│   ├── /progress, /favorites, /cart, /profile (protected)
└── services/ + data/ (mocks behind typed APIs)
```

- Guests see catalog **preview** on Home only; locked cards CTA to signup.
- Protected routes redirect to `/login` (with return path when useful).
- After signup/login → authenticated Home (`/`).

---

## 4. Phased delivery

### Phase 1 — Discovery shell

- Evolved design tokens (dark catalog surfaces, keep brand accents).
- Public Home: Hero, skill types, How it works, activity carousels (locked for guests).
- Authenticated Home: greeting, Continue Learning, Create a Practice Session (UI-only mock), unlocked carousels.
- Mock auth: Name, Email, Password, Confirm Password; success message; session persistence.
- `/activities` with search + filters (Skill, Level, Difficulty, Duration).
- `/activity/:id` with difficulty selection (Basic / Intermediate / Advanced).
- Reusable `ActivityCard`, `ActivityCarousel`, `ActivityFilter`, `SearchActivities`, `CategoryCard`, `ContinueLearning`.
- Centralized mocks: `activities.ts`, `categories.ts`.
- Remove portfolio sections and teacher data files/usage.

### Phase 2 — Activity players

- `/activity/:id/play` + `ActivityPlayer` shell (Header, ProgressBar, Content, AnswerArea, Feedback, Navigation).
- One playable mock per type: Listening, Writing, Music, Video, Vocabulary, Grammar, Reading, Game.
- `InteractiveTranscript` prepared for future sync / click-to-define (structure only where needed).
- `LevelSelector`, `DifficultySelector` wired into player content selection from mocks.
- Service stubs under `src/services/activities/` returning mock data.

### Phase 3 — Progress, social discovery extras, cart prep

- `/progress` with overall + per-skill bars and stats (mock).
- `/favorites` using same card pattern.
- `/cart` visual Learning Packs cart (total Free; no Stripe).
- `/profile` minimal (name, email, sign out).
- Games area + `GameCard`; `games.ts`, `mock-progress.ts`.
- Recommended activities + Generate Challenge returning a mocked activity (no real AI).

---

## 5. Information architecture & routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Marketing + catalog preview, or authenticated dashboard Home |
| `/login` | Public | Sign in |
| `/signup` | Public | Create account |
| `/activities` | Protected | Full catalog + filters |
| `/activity/:id` | Protected | Detail + difficulty pick |
| `/activity/:id/play` | Protected | Interactive player |
| `/progress` | Protected | Progress overview |
| `/favorites` | Protected | Saved activities |
| `/cart` | Protected | Learning packs cart (prep) |
| `/profile` | Protected | Account + sign out |

**Header (desktop, authenticated):** WE ARE ENGLISH · Home · Activities · Progress · Favorites · Search · Cart · Profile  

**Header (guest):** WE ARE ENGLISH · Home · Explore · Sign In · Create Account · Cart  

**Mobile:** Logo · Search · Cart · Menu drawer  

---

## 6. Visual direction

- **Keep:** `#D20001` (cherry), `#0212EE` (cobalt), `#FEC6E9` (soft pink), Instrument Serif (brand/display), DM Sans (UI).
- **Evolve:** Catalog and authenticated surfaces use ink/graphite backgrounds (`#111` / `#1A1A1A`); cards with rounded corners, subtle shadows, hover scale + overlay (Play, short description, level, duration).
- **Tone:** Premium, modern, interactive, clean, educational — not school-brochure, not Cool English clone, not generic purple AI landing.
- **Motion:** Soft hover/transition; respect reduced motion where hooks already exist.
- **Patterns:** Skeleton loading, badges, progress bars, success/error feedback, responsive carousels with horizontal swipe on mobile.

### Public Home sections (order)

1. Hero — brand, “Practice English. Your way.”, short value prop, Explore / Create Account, background activity-card composition.
2. Everything you need to practice English — eight skill category cards.
3. How it works — four steps + Start Learning CTA.
4. Explore our activities — Netflix-style carousels (Trending, Listening, Writing, Vocabulary, Grammar, Music, Videos, Games).

### Authenticated Home additions

- “Good morning/afternoon/evening, {Name}” + Ready to practice.
- Continue Learning row (in-progress items with %).
- Create a Practice Session generator UI (Skill, Level, Topic, Difficulty, Duration → mock activity).
- Same carousels unlocked.

---

## 7. Data model

```typescript
interface Activity {
  id: string;
  title: string;
  description: string;
  type:
    | "listening"
    | "writing"
    | "reading"
    | "grammar"
    | "vocabulary"
    | "music"
    | "video"
    | "game";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  difficulty: "basic" | "intermediate" | "advanced";
  duration: number; // minutes
  thumbnail: string;
  source?: string;
  locked?: boolean;
  progress?: number; // 0–100
}
```

```typescript
interface TranscriptLine {
  start: number;
  end: number;
  text: string;
}
```

Mock content lives only under `src/data/`. Components consume data via services or thin hooks, not inline objects.

---

## 8. Auth (mock)

- Fields signup: Name, Email, Password, Confirm Password.
- Fields login: Email, Password; links to forgot (placeholder) and signup.
- Persist `{ id, name, email }` in `localStorage`.
- No real password hashing required for this stage; do not store plaintext passwords longer than needed for demo validation in-session (prefer validating then discarding password from persisted user object).
- Guest clicking locked activity → `/signup`.
- Sign out from Profile clears session.

---

## 9. Activity players (Phase 2)

Shared shell `ActivityPlayer` switches content by `Activity.type`.

| Type | Mock UX |
|------|---------|
| Listening | Audio controls mock + MCQ + correct/incorrect feedback |
| Writing | Textarea, word count, submit → mocked scores (grammar/vocab/structure) |
| Music | Media placeholder + cloze lyrics + vocabulary question |
| Video | Video placeholder + MCQ + transcript section |
| Vocabulary | Word/definition or multiple-choice practice |
| Grammar | Interactive challenge / choose correct form |
| Reading | Short text + comprehension questions |
| Game | Quiz-style rounds; Game area cards ready for future embed URLs |

`InteractiveTranscript`: display lines; optional blanks; structure for future word click (pronunciation + meaning panel) without real dictionary API.

---

## 10. Services layer (stubs)

```text
src/services/activities/
  activity.service.ts
  kahoot.service.ts
  wordwall.service.ts
  quizizz.service.ts
  youtube.service.ts
  ai.service.ts
```

Each exports typed functions that return Promises of mock data. No invented external endpoints. No scraping. No payment.

---

## 11. Component inventory

- Catalog: `ActivityCard`, `ActivityCarousel`, `ActivityFilter`, `SearchActivities`, `CategoryCard`, `RecommendedActivities`
- Detail: `LevelSelector`, `DifficultySelector`
- Player: `ActivityPlayer`, `ListeningActivity`, `WritingActivity`, `MusicActivity`, `VideoActivity`, `GameActivity` (+ vocab/grammar/reading variants as needed), `InteractiveTranscript`, `ProgressBar`
- Home auth: `ContinueLearning`, Generate Challenge panel
- Games: `GameCard`
- Layout: Header, Mobile drawer/menu, route guards, skeletons

---

## 12. Explicit non-goals (this initiative)

- Stripe / subscriptions / real checkout
- Scraping or copying third-party platform content
- Official Kahoot / Wordwall / Quizizz / YouTube API integrations
- Real AI writing correction or activity generation
- Downloading third-party media
- Restoring teacher portfolio / Meet the teacher / testimonials / institutional pricing as primary surfaces

---

## 13. Success criteria

End-to-end happy path:

Home → understand product → browse preview → signup → login → catalog → filter → detail → choose difficulty → play → feedback → progress.

**Primary review question:** Does this feel like a modern English practice platform or an institutional site? If institutional, keep refactoring until activity discovery and interaction dominate.

---

## 14. File organization (target)

```text
src/
  components/
    activities/     # cards, carousels, filters, player pieces
    layout/         # header, drawer, guards
    home/           # hero, how-it-works, skill grid, generate session
  contexts/         # AuthContext (+ later Favorites/Cart/Progress if needed)
  data/             # activities, categories, games, mock-progress
  pages/            # Home, Login, Signup, Activities, ActivityDetail, ActivityPlay, Progress, Favorites, Cart, Profile
  services/activities/
  types/            # Activity, TranscriptLine, etc.
```

Legacy portfolio section components and teacher-centric data are deleted or stopped being imported once Phase 1 lands.

# PRD: Pram — AI-Powered CPNS Test Practice Platform

## Problem Statement

Calon Pegawai Negeri Sipil (CPNS) di Indonesia kesulitan menemukan soal latihan yang:
- **Bervariasi** dan mencakup format soal spesifik (TWK, TIU, TKP)
- **Terjangkau** — platform existing biasanya berbayar dan tidak fleksibel
- **Relevan** dengan kelemahan personal — tidak ada analisis per-section yang memberi rekomendasi perbaikan
- **Terbuka** — tidak ada platform open-source "bring your own key" untuk generasi soal AI

## Solution

**Pram** adalah platform open-source yang menyediakan:
1. **AI Question Generator** — generate soal CPNS pakai OpenAI-compatible API (BYOK). Dua mode: quick (single prompt) dan agentic (multi-step validation)
2. **Question Bank** — kumpulan soal publik/privat yang bisa di-browse, di-rating, dan digunakan ulang
3. **Package Builder** — susun paket soal dari kombinasi soal existing + AI-generated
4. **Exam Interface** — antarmuka ujian simulasi CAT (Computer Assisted Test)
5. **Deep Analytics** — evaluasi per-section (TWK, TIU, TKP), identifikasi kelemahan, rekomendasi paket soal

Target pengguna: Calon Pegawai Negeri Sipil (CPNS) Indonesia.

## User Stories

### AI Generation
1. Sebagai peserta, saya ingin generate soal CPNS dengan AI menggunakan API key saya sendiri
2. Sebagai peserta, saya ingin memilih section (TWK, TIU, TKP) dan tingkat kesulitan sebelum generate
3. Sebagai peserta, saya ingin memilih topik spesifik (Pancasila, Deret Angka, Pelayanan Publik, dll.)
4. Sebagai power user, saya ingin menggunakan mode "agentic" untuk validasi kualitas soal yang lebih tinggi

## Exam Sections Supported

| Section | Type | Focus Areas |
|---------|------|-------------|
| TWK | Tes Wawasan Kebangsaan | Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Indonesia |
| TIU | Tes Intelegensia Umum | Analogi, Silogisme, Analitis, Deret Angka, Perbandingan, Soal Cerita, Figural |
| TKP | Tes Karakteristik Pribadi | Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, Anti Radikalisme |

## Question Formats

Semua soal CPNS menggunakan format **Multiple Choice** dengan 5 pilihan jawaban (A, B, C, D, E). Beberapa format tambahan untuk latihan:
- Multiple Choice (Standard)
- Benar / Salah (Latihan Konsep)
- Melengkapi Kalimat (Bahasa Indonesia)
- Analogi & Silogisme (TIU)
- Deret Angka (TIU)

## Implementation Decisions

### Tech Stack
- **Frontend**: React 19 + TanStack Router (SPA) + TanStack Query + Tailwind CSS 4 + shadcn/ui
- **Backend**: Hono + tRPC
- **Auth**: Better Auth (email/password)
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI-compatible API (generic interface, user-provided keys)
- **Monorepo**: Turborepo + Bun workspaces
- **Theme**: Light default, dark toggle (system preference aware via next-themes)

### Architecture

```
apps/web/            React SPA frontend
  routes/            File-based routes (TanStack Router)
    index.tsx        Landing / Home
    generate.tsx     AI Generator wizard
    bank.tsx         Question Bank browse
    bank/$id.tsx     Package / Question detail
    builder.tsx      Test Builder (craft package)
    builder/combo.tsx Package Combiner
    exam/$id.tsx     Exam Interface
    exam/$id/result.tsx  Exam Results
    analytics.tsx    Deep Analytics dashboard
    settings.tsx     Settings (API keys, profile)

apps/server/         Hono backend
  Mounts Better Auth + tRPC

packages/
  ai/                AI generation pipeline (new)
  api/               tRPC routers + context
    routers/
      ai.ts          generateQuestions (streaming)
      question.ts    CRUD questions, search, filter
      package.ts     CRUD packages, sections
      combo.ts       Combo package creation
      exam.ts        Attempts, grading, results
      analytics.ts   Stats, trends, recommendations
      settings.ts    API key management
  auth/              Better Auth config
  db/                Drizzle ORM schema
  ui/                shadcn/ui shared components
  env/               Environment validation
```

### Deep Modules (testable in isolation)

- **`packages/ai/`** — AI generation pipeline
  - Interface: `generateQuestions(input: GenerationInput) => GenerationResult`
  - Two pipelines: `quick` (single call) and `agentic` (multi-step)
  - Zod schemas for all question formats (type-safe generation + validation)
  - OpenAI-compatible client abstraction

- **`packages/api/src/routers/`** — tRPC routers
  - Each router encapsulates one domain with clear procedures

### Database Schema (New Tables)

```
exam_type          id, name, language, description
section_type       id, name
question           id, exam_type_id, section_type_id, format, passage_text,
                   question_text, options_json, correct_answer, explanation,
                   difficulty (1-5), skill_tags[], source (ai|manual),
                   ai_model, creator_user_id, is_public, usage_count, avg_rating
package            id, title, description, exam_type_id, creator_user_id,
                   is_public, total_questions, usage_count, avg_rating
package_section    id, package_id, section_type_id, title, order_index
section_question   id, section_id, question_id, order_index
combo_package      id, title, description, creator_user_id, is_public
combo_section      id, combo_id, source_package_id, source_section_id, order_index
test_attempt       id, user_id, package_id_or_combo_id, started_at, finished_at, total_score
section_result     id, attempt_id, section_type, score, max_score, time_spent_sec
answer             id, section_result_id, question_id, user_answer, is_correct, time_spent_sec
user_api_key       id, user_id, provider, base_url, api_key_encrypted, model_name, is_active
question_rating    id, user_id, question_id, score (1-5), created_at
```

### Agentic AI Pipeline

```
Step 1: Passage Generator   → Authentic reading passage sesuai level ujian
Step 2: Passage Validator   → Validasi akurasi, difficulty, grammar, panjang
Step 3: Question Generator  → Generate N questions dalam format yang diminta
Step 4: Self-Answer & Validate → AI menjawab sendiri, flag ambigu, hitung confidence
Step 5: Quality Scorer      → Overall score, needsHumanReview flag
```

### Weakness Analysis Algorithm

1. Group answers by `section_type` dan `skill_tag`
2. Hitung akurasi per group
3. Identifikasi skill tags dengan akurasi di bawah threshold (default 70%)
4. Sort by `total_attempts * (1 - accuracy)` — prioritize yang sering salah
5. Cari paket soal publik dengan skill tags yang match kelemahan user
6. Return top-N rekomendasi paket

---

## Implementation Phases

### Phase 1 — Foundation (Schema + Core Infrastructure)
**Goal:** Database siap, user bisa manage API key, AI pipeline dasar berjalan

| # | Task | Package |
|---|------|---------|
| 1.1 | Add application tables to Drizzle schema | `packages/db/` |
| 1.2 | Generate & run migrations | `packages/db/` |
| 1.3 | Create `packages/ai/` — OpenAI-compatible client + Zod schemas for all question formats | `packages/ai/` |
| 1.4 | AI key management tRPC router (encrypt/decrypt) | `packages/api/` |
| 1.5 | Settings page → API key CRUD UI | `apps/web/` |
| 1.6 | Quick mode AI generation pipeline (single call) | `packages/ai/` |
| 1.7 | AI Generator router + basic UI page | `packages/api/` + `apps/web/` |

**User stories delivered:** 1, 2, 3, 4, 7, 31, 32, 33

### Phase 2 — Question Bank & Packages
**Goal:** Soal bisa disimpan, dipublikasikan, di-browse, dan dibundle

| # | Task | Package |
|---|------|---------|
| 2.1 | Question CRUD tRPC router (search, filter, publish/unpublish) | `packages/api/` |
| 2.2 | Package CRUD tRPC router (create, add sections, add questions) | `packages/api/` |
| 2.3 | Question Bank browse page (grid, search, filters) | `apps/web/` |
| 2.4 | Package detail page (preview soal, rating, stats) | `apps/web/` |
| 2.5 | AI Generator → save result as question / package | `apps/web/` |
| 2.6 | Test Builder page (craft package from bank items) | `apps/web/` |
| 2.7 | Rating system for public questions/packages | `packages/api/` |

**User stories delivered:** 5, 8, 9, 10, 11, 12, 13, 14, 15, 17

### Phase 3 — Package Combiner + Agentic Mode
**Goal:** Pengguna bisa mix section dari berbagai paket; power user bisa pakai agentic generation

| # | Task | Package |
|---|------|---------|
| 3.1 | Combo package tRPC router | `packages/api/` |
| 3.2 | Package Combiner UI (select sections from different packages) | `apps/web/` |
| 3.3 | Agentic mode AI pipeline (multi-step) | `packages/ai/` |
| 3.4 | Agentic mode toggle + streaming progress in AI Generator UI | `apps/web/` |

**User stories delivered:** 6, 16

### Phase 4 — Exam Experience
**Goal:** Pengguna bisa mengerjakan ujian dengan antarmuka side-by-side, timer, auto-grade

| # | Task | Package |
|---|------|---------|
| 4.1 | Exam attempt + answer submission tRPC router | `packages/api/` |
| 4.2 | Auto-grade logic (untuk semua format objektif) | `packages/api/` |
| 4.3 | Exam Interface page (side-by-side passage + questions) | `apps/web/` |
| 4.4 | Timer component (client-side with periodic sync) | `apps/web/` |
| 4.5 | Question navigation (prev/next/jump, mark for review) | `apps/web/` |
| 4.6 | Auto-save answers | `apps/web/` |
| 4.7 | Exam Results page (per-section scores, answer review) | `apps/web/` |

**User stories delivered:** 18, 19, 20, 21, 22, 23, 24, 25

### Phase 5 — Analytics & Recommendations
**Goal:** User bisa melihat performa, kelemahan, dan rekomendasi perbaikan

| # | Task | Package |
|---|------|---------|
| 5.1 | Analytics tRPC router (stats, trends, skill breakdown) | `packages/api/` |
| 5.2 | Weakness identification + recommendation algorithm | `packages/api/` |
| 5.3 | Deep Analytics dashboard page (stats cards, line chart, radar chart) | `apps/web/` |
| 5.4 | Performance by Skill table | `apps/web/` |
| 5.5 | Recommended packages section on dashboard | `apps/web/` |

**User stories delivered:** 26, 27, 28, 29, 30

### Phase 6 — Community & Polish
**Goal:** Platform terasa hidup dengan konten komunitas, trending, PWA offline support

| # | Task | Package |
|---|------|---------|
| 6.1 | Trending / most-used packages endpoint | `packages/api/` |
| 6.2 | Staff pick / featured content | `apps/web/` |
| 6.3 | Creator stats (usage count, rating) on profile | `apps/web/` |
| 6.4 | Share link for public packages | `apps/web/` |
| 6.5 | PWA offline support for exam mode (cache questions) | `apps/web/` |
| 6.6 | UI polish, loading skeletons, empty states, error boundaries | `apps/web/` |
| 6.7 | i18n foundation (Bahasa Indonesia UI strings) | `apps/web/` |

**User stories delivered:** 34, 35, 36, 37

---

## Out of Scope

- Mobile app (React Native) — web-first, PWA covers mobile
- Writing essay auto-grading — terlalu kompleks dan unreliable untuk AI saat ini
- Speaking section generation — fokus ke reading comprehension dulu
- Listening audio generation — perlu TTS, terlalu kompleks untuk initial release
- Proctoring / anti-cheat
- Subscription / payment system — open-source, self-hosted
- Real-time multiplayer
- Social features (comments, following) beyond ratings
- Admin dashboard — semua management via DB langsung atau CLI
- Email verification & password reset flow (bisa ditambah nanti)
- OAuth login (Google, GitHub) — email/password saja untuk initial release

## Testing Strategy

- **AI package** (`packages/ai/`): Unit tests for Zod validation schemas, integration tests with mocked LLM responses
- **API routers** (`packages/api/src/routers/`): tRPC procedure tests against test database
- **Package Combiner**: Complex business logic — priority for testing
- **Auto-grade logic**: Must be correct — parametrized tests per format
- **Test structure**: `packages/*/__tests__/` (establishing fresh — codebase has no tests yet)

A good test:
- Tests external behavior (API contract), not implementation details
- Uses tRPC test client to call procedures end-to-end
- Isolates AI calls via mocking

## Further Notes

- Repo akan dijadikan open-source — semua API key di-skip dari git, dokumentasi jelas untuk self-hosting
- UI text dalam Bahasa Indonesia (target pengguna), kode dalam English
- Soal bisa bilingual (passage dalam bahasa target, instruksi dalam Bahasa Indonesia)
- Timer di exam interface harus client-side dengan periodic sync ke server
- PWA support sudah ada, perlu di-enhance untuk offline exam mode (cache soal)
- Default theme: light, dark toggle tetap ada
- Nama "Pram" dari "labs" + "bahasa"

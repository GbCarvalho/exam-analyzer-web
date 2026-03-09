# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev          # start Next.js dev server (localhost:3000)
pnpm build        # production build
pnpm lint         # ESLint via next lint

# Tests (Vitest + jsdom)
pnpm test         # run all tests once
pnpm test:watch   # watch mode
```

Run a single test file:
```bash
pnpm vitest run tests/answer-utils.test.ts
```

The backend (FastAPI, `exam-analyzer`) must be running on `http://localhost:8000` for the frontend to work. Set `NEXT_PUBLIC_API_URL` to override.

## Architecture

### Pages & routing

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Upload form; Server Component fetching `/providers` |
| `/exams/[id]` | `app/exams/[id]/page.tsx` | Single-booklet exam detail (FGV, etc.) |
| `/exams/[id]/[specificosId]` | `app/exams/[id]/[specificosId]/page.tsx` | Dual-booklet exam (Cebraspe básicos + específicos) |
| `/exams/[id]/score` | `app/exams/[id]/score/page.tsx` | Answer entry + score results |

### Data flow

Server Components (`app/…/page.tsx`) call `lib/api.ts` fetchers with `next: { revalidate: 3600 }` caching. Client Components trigger mutations (upload, patch, analyze) via the same `lib/api.ts` functions and call `router.refresh()` to revalidate the page cache. The one Server Action (`lib/actions.ts`) is `revalidateExam`.

`lib/api.ts` exports two categories:
- **Server-side fetchers**: `fetchExam`, `fetchAnswerKey`, `fetchProviders` — used in Server Components
- **Client-side mutations**: `uploadExam`, `uploadAnswerKeyPdf`, `saveAnswerKey`, `analyzeExam`, `patchQuestion`, `patchQuestions`

All API errors throw/return `ApiError` (status + message).

### Key components

- **`AnswerKeySection`** — tabbed card (upload PDF | edit grid) for managing the gabarito on the exam detail page.
- **`AnswerGrid`** — answer entry on the score page. Three modes: `all` (keyboard-driven grid), `single` (one question at a time), `multi` (list with per-question inputs). State managed by `gridReducer` in `lib/answer-grid-reducer.ts`.
- **`QuestionSection`** — wraps `QuestionList` (individual auto-save on blur) and `QuestionListBulkSave` (form submit for all at once), toggled by a mode button.

### Answer input logic

`lib/answer-utils.ts` centralises provider-specific validation:
- Cebraspe: valid keys are `C`/`E`; numeric shortcuts `1`→`C`, `2`→`E`
- FGV / unknown: `A`–`E`; numeric shortcuts `1`–`5`
- `Space` = blank answer; `X` = blank when pasting

### Local storage

`lib/local-store.ts` persists manual question edits in `localStorage` under key `exam:{examId}:questions`. Manual edits win over remote (OCR) data on merge. This is a placeholder; ElectricSQL is the planned replacement.

### shadcn/ui

Style is `base-nova`, base colour `neutral`, CSS variables enabled. Add new components with:
```bash
pnpm dlx shadcn add <component>
```

### Testing

Tests live in `tests/`. They cover pure utility modules (`answer-utils`, `answer-grid-reducer`, `local-store`, `upload-schemas`) — no component rendering tests. Vitest uses `jsdom`, globals enabled, setup file at `tests/setup.ts`.

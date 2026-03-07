# Exam UX Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign score page answer entry (2 modes), add Markdown rendering + collapsible questions, fix logo fade and Cebraspe tab bugs.

**Architecture:** Split `AnswerGrid` into two focused components (`AnswerGridOverview`, `AnswerSingleQuestion`) sharing lifted reducer state from `ScorePage`. Add `react-markdown` for question statement rendering. Fix CSS bugs in header and Base UI tabs wrapper.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind, shadcn/ui (base-nova, Base UI primitives), Vitest, react-markdown

**Test URLs (backend must be running on localhost:8000):**
- FGV with gabarito: `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406`
- Cebraspe dual-booklet: `http://localhost:3000/exams/019cc9e5-b2e4-70f7-8a3b-81a0fa1382a2/019cc9e5-c216-7b9d-8ef7-c2dc4834d766`

---

### Task 1: Fix logo text fade

**Files:**
- Modify: `components/header.tsx`
- Possibly modify: `app/globals.css`

**Step 1: Investigate the fade**

Open Chrome at `http://localhost:3000` and inspect the header. The text "Analisador de Provas" fades/becomes transparent at the right end. The header uses `bg-background/90 backdrop-blur-sm` which creates a semi-transparent backdrop. The logo text itself has no explicit gradient in `header.tsx`, so the issue is that the header background is 90% opaque and the backdrop-blur creates a visual fade effect on the text when scrolled or when the background gradient from `globals.css` shows through.

**Step 2: Fix the header background**

In `components/header.tsx`, change the header to use a fully opaque background so text is never affected by transparency:

```tsx
<header className="border-b border-border/60 bg-background sticky top-0 z-50">
```

Remove `bg-background/90` and `backdrop-blur-sm`. The text should now be crisp and solid. If the blur aesthetic is desired, an alternative is to keep backdrop-blur but add `text-foreground` explicitly to the text span and ensure the background is opaque enough.

**Step 3: Verify visually**

Use Chrome to verify the logo text "Analisador de Provas" is solid with no fading at `http://localhost:3000`.

**Step 4: Commit**

```bash
git add components/header.tsx
git commit -m "fix: remove semi-transparent header background causing logo text fade"
```

---

### Task 2: Fix Cebraspe dual-exam tabs

**Files:**
- Modify: `components/ui/tabs.tsx`

**Step 1: Understand the bug**

The `Tabs` component at `components/ui/tabs.tsx` wraps `@base-ui/react/tabs`. The root uses `data-horizontal:flex-col` but Base UI uses `data-orientation="horizontal"` on the root element. The Tailwind `data-horizontal:` selector matches the `data-orientation="horizontal"` attribute from Base UI.

The issue: `data-horizontal:flex-col` on the root (line 18) makes the Tabs root a column layout — correct. But the `TabsList` uses `group-data-horizontal/tabs:h-8` (line 27) which restricts height to `h-8`. This is fine for a simple text trigger, but the dual-exam page has longer trigger content (text + count badge) that doesn't fit.

More critically, Base UI `Panel` components use the `[hidden]` attribute to hide inactive panels. If the `[hidden]` attribute is not being respected (e.g., overridden by `flex-1`), both panels show simultaneously.

**Step 2: Fix the TabsContent hidden state**

In `components/ui/tabs.tsx`, update `TabsContent` to explicitly hide when the `[hidden]` attribute is present, since `flex-1` and other display properties can override the browser's default `[hidden]` behavior:

```tsx
function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none [&[hidden]]:hidden", className)}
      {...props}
    />
  )
}
```

**Step 3: Fix TabsList height constraint**

In `tabsListVariants` (line 27), the `group-data-horizontal/tabs:h-8` forces a rigid height. Change to `group-data-horizontal/tabs:min-h-8` to allow taller content:

In the `cva` call for `tabsListVariants`, replace:
```
group-data-horizontal/tabs:h-8
```
with:
```
group-data-horizontal/tabs:min-h-8
```

**Step 4: Verify visually**

Open Chrome at the Cebraspe URL: `http://localhost:3000/exams/019cc9e5-b2e4-70f7-8a3b-81a0fa1382a2/019cc9e5-c216-7b9d-8ef7-c2dc4834d766`. Verify:
- Tabs render horizontally at the top
- Only the active tab's content is visible
- Clicking "Questoes Especificas" switches content properly

**Step 5: Also verify the FGV exam is unaffected**

Open `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406` and confirm tabs (if any) and general layout are fine.

**Step 6: Commit**

```bash
git add components/ui/tabs.tsx
git commit -m "fix: tabs rendering vertically and showing both panels simultaneously"
```

---

### Task 3: Install react-markdown

**Files:**
- Modify: `package.json`

**Step 1: Install the dependency**

```bash
cd /Users/gabrielcarvalho/Developer/personal/concursos/exam-analyzer-web && pnpm add react-markdown
```

**Step 2: Verify it installed**

```bash
pnpm list react-markdown
```

Expected: shows `react-markdown` in the list.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add react-markdown for question statement rendering"
```

---

### Task 4: Collapsible + Markdown question list

**Files:**
- Modify: `components/question-section.tsx`
- Modify: `components/question-list.tsx`
- Modify: `components/question-list-bulk-save.tsx`

**Step 1: Update QuestionSection with collapsible wrapper**

Rewrite `components/question-section.tsx` to make the entire section collapsible, and pass collapse state control down:

```tsx
'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionList } from '@/components/question-list'
import { QuestionListBulkSave } from '@/components/question-list-bulk-save'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

export function QuestionSection({ examId, questions }: Props) {
  const [bulkMode, setBulkMode] = useState(false)
  const [expanded, setExpanded] = useState(questions.length <= 50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-lg font-semibold hover:text-foreground/80 transition-colors"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              expanded && 'rotate-90',
            )}
          />
          Questões ({questions.length})
        </button>
        {expanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode((v) => !v)}
          >
            {bulkMode ? 'Edição individual' : 'Editar todas'}
          </Button>
        )}
      </div>
      {expanded &&
        (bulkMode ? (
          <QuestionListBulkSave examId={examId} questions={questions} />
        ) : (
          <QuestionList examId={examId} questions={questions} />
        ))}
    </div>
  )
}
```

**Step 2: Rewrite QuestionList with collapsible items + Markdown rendering**

Rewrite `components/question-list.tsx`. Each question is collapsible (collapsed by default), shows number + truncated preview when collapsed, shows rendered Markdown when expanded. Click the rendered Markdown to enter edit mode with an auto-sizing textarea.

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { patchQuestion, ApiError } from '@/lib/api'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

function AutoSizeTextarea({
  defaultValue,
  onBlur,
  ariaLabel,
}: {
  defaultValue: string
  onBlur: (value: string) => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    resize()
  }, [resize])

  return (
    <textarea
      ref={ref}
      className="w-full bg-transparent resize-vertical leading-relaxed outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm"
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      onInput={resize}
      onBlur={(e) => onBlur(e.target.value.trim())}
      autoFocus
    />
  )
}

function QuestionItem({
  examId,
  question,
}: {
  examId: string
  question: Question
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(newStatement: string) {
    setEditing(false)
    if (newStatement === question.statement) return
    setSaving(true)
    try {
      await patchQuestion(examId, question.number, newStatement)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar questão')
    } finally {
      setSaving(false)
    }
  }

  const preview =
    question.statement.length > 80
      ? question.statement.slice(0, 80) + '...'
      : question.statement

  return (
    <li className="rounded-lg bg-card ring-1 ring-foreground/[0.06] transition-colors hover:ring-foreground/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full p-4 text-left text-sm"
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-90',
          )}
        />
        <span className="font-mono text-muted-foreground w-7 shrink-0 text-right">
          {question.number}.
        </span>
        {!expanded && (
          <span className="text-muted-foreground truncate flex-1">
            {preview}
          </span>
        )}
        <div className="flex gap-1 shrink-0 items-center ml-auto">
          {saving && (
            <span className="text-xs text-muted-foreground">salvando...</span>
          )}
          {question.manual && !saving && (
            <Badge variant="secondary" className="text-xs">editado</Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-[3.75rem]">
          {editing ? (
            <AutoSizeTextarea
              defaultValue={question.statement}
              onBlur={handleSave}
              ariaLabel={`Enunciado da questão ${question.number}`}
            />
          ) : (
            <div
              onClick={() => setEditing(true)}
              className="prose prose-sm dark:prose-invert max-w-none cursor-text rounded px-2 py-1 hover:bg-muted/40 transition-colors"
              title="Clique para editar"
            >
              <ReactMarkdown>{question.statement}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export function QuestionList({ examId, questions }: Props) {
  if (questions.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma questão extraída.</p>
  }

  return (
    <ol className="space-y-2">
      {questions.map((q) => (
        <QuestionItem key={q.number} examId={examId} question={q} />
      ))}
    </ol>
  )
}
```

**Step 3: Update QuestionListBulkSave with auto-sizing textareas**

In `components/question-list-bulk-save.tsx`, add auto-sizing to the textareas. Replace the existing `<textarea>` with a version that auto-sizes on mount and input:

Replace the textarea element (line 47-53) with:

```tsx
<textarea
  ref={(el) => {
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }}
  name={`q-${q.number}`}
  defaultValue={q.statement}
  className="flex-1 bg-transparent resize-vertical leading-relaxed outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1"
  aria-label={`Enunciado da questão ${q.number}`}
  onInput={(e) => {
    const el = e.target as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }}
/>
```

Note: no `rows={2}` — the auto-size handles initial height.

**Step 4: Verify visually**

Open `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406`. Verify:
- "Questoes (60)" heading is clickable and collapses/expands the section
- Individual questions are collapsed by default showing number + preview
- Expanding a question shows rendered Markdown
- Clicking the rendered text enters edit mode with an auto-sizing textarea
- Blurring saves and returns to rendered Markdown

Also check the Cebraspe dual-exam URL for both tabs.

**Step 5: Commit**

```bash
git add components/question-section.tsx components/question-list.tsx components/question-list-bulk-save.tsx
git commit -m "feat: collapsible questions with Markdown rendering and auto-sizing textareas"
```

---

### Task 5: Update gridReducer — remove multi mode

**Files:**
- Modify: `lib/answer-grid-reducer.ts`
- Modify: `tests/answer-grid-reducer.test.ts`

**Step 1: Update the type**

In `lib/answer-grid-reducer.ts`, change `GridMode`:

```ts
export type GridMode = 'all' | 'single'
```

No other changes needed to the reducer itself — `SET_MODE` already accepts any `GridMode` value, and the tests will just stop using `'multi'`.

**Step 2: Update the test**

In `tests/answer-grid-reducer.test.ts`, the test at line 118 uses `mode: 'multi'`. Change it to use `mode: 'single'`:

Replace line 118:
```ts
    const next = gridReducer(state, { type: 'SET_MODE', mode: 'multi' })
```
with:
```ts
    const next = gridReducer(state, { type: 'SET_MODE', mode: 'single' })
```

**Step 3: Run tests**

```bash
cd /Users/gabrielcarvalho/Developer/personal/concursos/exam-analyzer-web && pnpm test
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add lib/answer-grid-reducer.ts tests/answer-grid-reducer.test.ts
git commit -m "refactor: remove multi mode from grid reducer"
```

---

### Task 6: Create AnswerGridOverview component

**Files:**
- Create: `components/answer-grid-overview.tsx`

**Step 1: Create the component**

This extracts the "all" mode from the old `AnswerGrid` into a standalone component. It receives `state` and `dispatch` from the parent instead of owning the reducer.

```tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  isValidAnswerKey,
  isValidInputKey,
  mapNumericKey,
  parseAnswerString,
} from '@/lib/answer-utils'
import type { GridState, GridAction } from '@/lib/answer-grid-reducer'

interface Props {
  state: GridState
  dispatch: React.Dispatch<GridAction>
  provider: string
  count: number
}

export function AnswerGridOverview({ state, dispatch, provider, count }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const resolveKey = useCallback(
    (raw: string): string | null | 'blank' => {
      if (raw === ' ') return 'blank'
      const upper = raw.toUpperCase()
      if (isValidAnswerKey(upper, provider)) return upper
      const mapped = mapNumericKey(raw, provider)
      if (mapped) return mapped
      return null
    },
    [provider],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'CLEAR', index: state.cursor })
        dispatch({ type: 'BACK' })
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        dispatch({ type: 'BACK' })
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        dispatch({ type: 'ADVANCE' })
        return
      }

      if (e.key === 'Enter') {
        // Let parent handle submit — don't prevent default here
        return
      }

      if (
        !isValidInputKey(e.key === ' ' ? ' ' : e.key.toUpperCase(), provider) &&
        e.key !== ' '
      )
        return

      e.preventDefault()
      const resolved = resolveKey(e.key)
      if (resolved === null) return

      if (resolved === 'blank') {
        dispatch({ type: 'CLEAR', index: state.cursor })
      } else {
        dispatch({ type: 'SET_ANSWER', index: state.cursor, value: resolved })
      }
      dispatch({ type: 'ADVANCE' })
    },
    [state.cursor, provider, dispatch, resolveKey],
  )

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const raw = e.clipboardData.getData('text')
    const parsed = parseAnswerString(raw, count)
    dispatch({ type: 'PASTE', values: parsed })
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className="grid grid-cols-10 gap-1 outline-none focus:ring-2 focus:ring-ring rounded p-2"
      aria-label="Grade de respostas — digite a resposta para avançar, Ctrl+V para colar"
    >
      {state.answers.map((ans, i) => (
        <button
          key={i}
          type="button"
          onClick={() => dispatch({ type: 'SET_CURSOR', index: i })}
          className={cn(
            'h-10 w-full rounded border font-mono text-sm transition-colors',
            i === state.cursor
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border hover:border-muted-foreground',
            ans ? 'font-bold' : 'text-muted-foreground',
          )}
        >
          {ans ?? i + 1}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/answer-grid-overview.tsx
git commit -m "feat: create AnswerGridOverview component extracted from AnswerGrid"
```

---

### Task 7: Create AnswerSingleQuestion component

**Files:**
- Create: `components/answer-single-question.tsx`

**Step 1: Create the component**

This extracts and enhances the "single" mode. Adds keyboard navigation, Markdown rendering of the question statement, and a mini answer-status grid.

```tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  isValidAnswerKey,
  mapNumericKey,
} from '@/lib/answer-utils'
import type { GridState, GridAction } from '@/lib/answer-grid-reducer'
import type { Question } from '@/lib/types'

const PROVIDER_KEYS: Record<string, string[]> = {
  cebraspe: ['C', 'E'],
  fgv: ['A', 'B', 'C', 'D', 'E'],
  unknown: ['A', 'B', 'C', 'D', 'E'],
}

interface Props {
  state: GridState
  dispatch: React.Dispatch<GridAction>
  questions: Question[]
  provider: string
}

export function AnswerSingleQuestion({
  state,
  dispatch,
  questions,
  provider,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const count = questions.length
  const keys = PROVIDER_KEYS[provider] ?? PROVIDER_KEYS.unknown
  const current = questions[state.cursor]

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        dispatch({ type: 'BACK' })
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        dispatch({ type: 'ADVANCE' })
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'CLEAR', index: state.cursor })
        dispatch({ type: 'ADVANCE' })
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'CLEAR', index: state.cursor })
        dispatch({ type: 'BACK' })
        return
      }

      const upper = e.key.toUpperCase()
      const mapped = mapNumericKey(e.key, provider) ?? upper
      if (isValidAnswerKey(mapped, provider)) {
        e.preventDefault()
        dispatch({ type: 'SET_ANSWER', index: state.cursor, value: mapped })
        dispatch({ type: 'ADVANCE' })
      }
    },
    [state.cursor, provider, dispatch],
  )

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="space-y-4 outline-none"
    >
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Questão {state.cursor + 1} de {count}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={state.cursor === 0}
            onClick={() => dispatch({ type: 'BACK' })}
          >
            ← Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={state.cursor === count - 1}
            onClick={() => dispatch({ type: 'ADVANCE' })}
          >
            Próxima →
          </Button>
        </div>
      </div>

      {/* Question statement */}
      <div className="border rounded-lg p-4 bg-muted/40">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{current?.statement ?? '—'}</ReactMarkdown>
        </div>
      </div>

      {/* Answer buttons */}
      <div className="flex gap-2 flex-wrap">
        {keys.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={state.answers[state.cursor] === key ? 'default' : 'outline'}
            onClick={() => {
              dispatch({ type: 'SET_ANSWER', index: state.cursor, value: key })
              dispatch({ type: 'ADVANCE' })
            }}
          >
            {key}
          </Button>
        ))}
        <Button
          size="sm"
          variant={state.answers[state.cursor] === null ? 'secondary' : 'outline'}
          onClick={() => {
            dispatch({ type: 'CLEAR', index: state.cursor })
            dispatch({ type: 'ADVANCE' })
          }}
        >
          Em branco
        </Button>
      </div>

      {/* Mini answer-status grid */}
      <div className="grid grid-cols-20 gap-0.5">
        {state.answers.map((ans, i) => (
          <button
            key={i}
            type="button"
            onClick={() => dispatch({ type: 'SET_CURSOR', index: i })}
            className={cn(
              'h-5 w-full rounded-sm text-[10px] font-mono transition-colors',
              i === state.cursor
                ? 'bg-primary text-primary-foreground'
                : ans
                  ? 'bg-primary/20 text-foreground'
                  : 'bg-muted text-muted-foreground',
            )}
            title={`Q${i + 1}: ${ans ?? 'em branco'}`}
          >
            {ans ?? ''}
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/answer-single-question.tsx
git commit -m "feat: create AnswerSingleQuestion component with keyboard nav and Markdown"
```

---

### Task 8: Create keyboard shortcut panel

**Files:**
- Create: `components/keyboard-shortcuts-dialog.tsx`

**Step 1: Create the component**

A dialog that opens via `Ctrl+K` / `Cmd+K` or a button. Shows all available keyboard shortcuts for the current mode.

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GridMode } from '@/lib/answer-grid-reducer'

interface Props {
  mode: GridMode
}

const GRID_SHORTCUTS = [
  { keys: 'A–E / C,E', description: 'Selecionar resposta' },
  { keys: '1–5', description: 'Selecionar por número' },
  { keys: 'Espaço', description: 'Marcar em branco' },
  { keys: 'Backspace', description: 'Limpar e voltar' },
  { keys: '← →', description: 'Navegar entre questões' },
  { keys: 'Ctrl+V', description: 'Colar respostas (ex: CCEEABC)' },
]

const SINGLE_SHORTCUTS = [
  { keys: 'A–E / C,E', description: 'Selecionar resposta e avançar' },
  { keys: '1–5', description: 'Selecionar por número e avançar' },
  { keys: 'Espaço', description: 'Marcar em branco e avançar' },
  { keys: 'Backspace', description: 'Limpar e voltar' },
  { keys: '← → / ↑ ↓', description: 'Navegar entre questões' },
]

export function KeyboardShortcutsDialog({ mode }: Props) {
  const [open, setOpen] = useState(false)

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    },
    [open],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])

  const shortcuts = mode === 'all' ? GRID_SHORTCUTS : SINGLE_SHORTCUTS

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 text-muted-foreground"
      >
        <Keyboard className="h-4 w-4" />
        <span className="text-xs">Atalhos</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-sm font-semibold mb-4">
              Atalhos de teclado — {mode === 'all' ? 'Visão geral' : 'Questão individual'}
            </h3>
            <dl className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.keys} className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">{s.description}</dt>
                  <dd>
                    <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                      {s.keys}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground mt-4">
              Pressione <kbd className="rounded border bg-muted px-1 text-[10px] font-mono">Esc</kbd> ou <kbd className="rounded border bg-muted px-1 text-[10px] font-mono">⌘K</kbd> para fechar
            </p>
          </div>
        </>
      )}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add components/keyboard-shortcuts-dialog.tsx
git commit -m "feat: keyboard shortcuts dialog with Ctrl+K/Cmd+K toggle"
```

---

### Task 9: Rewrite ScorePage with lifted state + new components

**Files:**
- Modify: `app/exams/[id]/score/page.tsx`
- Delete: `components/answer-grid.tsx` (after wiring up new components)

**Step 1: Rewrite the ScorePage**

Replace the current `ScorePage` to use `useReducer` directly, pass state to the two new components, and add the mode toggle + shortcuts dialog:

```tsx
'use client'

import { useState, useEffect, useReducer } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnswerGridOverview } from '@/components/answer-grid-overview'
import { AnswerSingleQuestion } from '@/components/answer-single-question'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { ScoreCard } from '@/components/score-card'
import { BreakdownTable } from '@/components/breakdown-table'
import { gridReducer, createInitialState } from '@/lib/answer-grid-reducer'
import { analyzeExam, getResult, ApiError } from '@/lib/api'
import type { ExamResponse, ResultResponse } from '@/lib/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ScorePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [result, setResult] = useState<ResultResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/exams/${params.id}`)
      .then((r) => {
        if (r.status === 404) {
          router.replace(`/exams/${params.id}`)
          return null
        }
        return r.json()
      })
      .then((data) => data && setExam(data))
      .catch(() => toast.error('Erro ao carregar prova'))
  }, [params.id, router])

  if (!exam) {
    return <p className="text-muted-foreground">Carregando prova...</p>
  }

  return <ScorePageInner exam={exam} params={params} router={router} result={result} setResult={setResult} loading={loading} setLoading={setLoading} />
}

function ScorePageInner({
  exam,
  params,
  router,
  result,
  setResult,
  loading,
  setLoading,
}: {
  exam: ExamResponse
  params: { id: string }
  router: ReturnType<typeof useRouter>
  result: ResultResponse | null
  setResult: (r: ResultResponse | null) => void
  loading: boolean
  setLoading: (l: boolean) => void
}) {
  const count = exam.questions.length
  const [state, dispatch] = useReducer(gridReducer, createInitialState(count, 'all'))

  const answered = state.answers.filter((a) => a !== null).length
  const allFilled = answered === count

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await analyzeExam(params.id, state.answers)
      const fullResult = await getResult(params.id, res.result_id)
      setResult(fullResult)
      setTimeout(() => {
        document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Gabarito não encontrado. Cadastre o gabarito primeiro.')
        router.push(`/exams/${params.id}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao analisar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gabarito — {exam.cargo ?? 'Prova'}</CardTitle>
            <KeyboardShortcutsDialog mode={state.mode} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={state.mode === 'all' ? 'default' : 'outline'}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'all' })}
            >
              Visão geral
            </Button>
            <Button
              size="sm"
              variant={state.mode === 'single' ? 'default' : 'outline'}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'single' })}
            >
              Questão individual
            </Button>
          </div>

          {/* Active mode component */}
          {state.mode === 'all' && (
            <AnswerGridOverview
              state={state}
              dispatch={dispatch}
              provider={exam.provider}
              count={count}
            />
          )}

          {state.mode === 'single' && (
            <AnswerSingleQuestion
              state={state}
              dispatch={dispatch}
              questions={exam.questions}
              provider={exam.provider}
            />
          )}

          {/* Progress + submit */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {answered} / {count} respondidas
            </span>
            <Button onClick={handleSubmit} disabled={loading || !allFilled}>
              {loading ? 'Analisando...' : 'Ver resultado'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div id="resultado" className="space-y-6">
          <ScoreCard score={result.score} />
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownTable breakdown={result.breakdown} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Delete the old AnswerGrid component**

```bash
rm components/answer-grid.tsx
```

This file is no longer imported anywhere after the rewrite.

**Step 3: Verify visually**

Open `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406/score`. Verify:
- Mode toggle shows "Visão geral" / "Questão individual"
- Grid mode works: click cells, type letters, paste with Ctrl+V
- Single mode works: shows question text as Markdown, answer buttons, arrow key nav
- Mini grid in single mode shows answer status and allows jumping
- Keyboard shortcuts dialog opens with Ctrl+K / Cmd+K
- Progress counter and submit work
- Switching modes preserves answers

**Step 4: Commit**

```bash
git add app/exams/[id]/score/page.tsx components/answer-grid-overview.tsx components/answer-single-question.tsx components/keyboard-shortcuts-dialog.tsx
git rm components/answer-grid.tsx
git commit -m "feat: rewrite score page with 2-mode answer entry and keyboard shortcuts"
```

---

### Task 10: Final verification + cleanup

**Step 1: Run all tests**

```bash
cd /Users/gabrielcarvalho/Developer/personal/concursos/exam-analyzer-web && pnpm test
```

Expected: All tests pass.

**Step 2: Run lint**

```bash
pnpm lint
```

Fix any lint errors.

**Step 3: Run build**

```bash
pnpm build
```

Fix any type errors.

**Step 4: Full visual verification with Chrome**

Check all pages:
1. `http://localhost:3000` — logo text should be solid, no fade
2. `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406` — FGV exam: collapsible questions, Markdown rendering, click-to-edit
3. `http://localhost:3000/exams/019cc9bb-40a5-7ae1-a438-6111e4773406/score` — score page: grid mode, single mode, Ctrl+K shortcuts, paste
4. `http://localhost:3000/exams/019cc9e5-b2e4-70f7-8a3b-81a0fa1382a2/019cc9e5-c216-7b9d-8ef7-c2dc4834d766` — Cebraspe: tabs horizontal, only active tab visible, tab switching works

**Step 5: Commit any final fixes**

```bash
git add -A && git commit -m "chore: final cleanup after exam UX redesign"
```

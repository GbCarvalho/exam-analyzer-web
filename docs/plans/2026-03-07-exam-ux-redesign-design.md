# Exam UX Redesign — Design Document

Date: 2026-03-07

## Overview

Redesign the exam-analyzer-web frontend to improve question viewing, answer entry, and fix visual bugs introduced during recent refactoring. All changes are frontend-only.

## 1. Score page — 2-mode answer entry

Replace the current 3-mode `AnswerGrid` with two focused components sharing lifted reducer state.

### AnswerGridOverview (grid mode)

- 10-column grid of cells showing question number or selected answer letter.
- Click a cell to set cursor; type a letter to fill and advance.
- `Ctrl+V` / `Cmd+V` on the grid parses pasted string via `parseAnswerString` and dispatches `PASTE`.
- Backspace clears current cell and moves back.
- Progress counter and submit button at the bottom.

### AnswerSingleQuestion (individual mode)

- Displays: question number, question statement (rendered Markdown), answer buttons for the provider's keys, "Em branco" button.
- Navigation: "Anterior" / "Proxima" buttons, plus keyboard arrow keys (Left/Right).
- Typing a letter key selects the answer and auto-advances.
- Small progress indicator ("12 / 60") and a mini answer-status grid at the bottom (clickable to jump).
- Submit button when all questions are filled.

### Keyboard shortcut panel

- Opens via `Ctrl+K` / `Cmd+K` or clicking an "Atalhos" / `?` button.
- Modal/dialog listing all shortcuts for the current mode.
- Closes on Escape or click outside.

### Removed

- "Multi" mode (scrollable list with per-question input).
- Separate paste input field (paste now works natively on the grid via `onPaste`).
- `Tab` key toggling modes.

### Shared state

`ScorePage` owns the `useReducer(gridReducer, ...)` state and passes `state` + `dispatch` to both components. Mode toggle ("Visao geral" | "Questao individual") at the top switches which component renders. Answers persist across mode switches.

## 2. Question editing — Markdown + collapsible

### Collapsible sections

- The "Questoes (N)" heading is collapsible. Collapsed by default for large exams (>50 questions), expanded for smaller ones.
- Each individual question is also collapsible. Collapsed by default, showing question number and a truncated preview of the statement text.

### Markdown rendering + inline edit

- Default state: statement renders as formatted Markdown using `react-markdown`.
- Click on rendered text switches to a raw `<textarea>` for editing.
- Textarea auto-sizes to fit content (via `scrollHeight`).
- Textarea has `resize: vertical` for manual expansion.
- On blur: saves via `patchQuestion`, returns to rendered Markdown.

### Bulk edit mode

Stays as-is but textareas also get auto-sizing.

## 3. Logo fix

The "Analisador de Provas" header text fades/becomes transparent at the right end. Fix by ensuring the text uses solid `text-foreground` with no gradient, mask, or opacity effect. Investigate `header.tsx` and `globals.css` for the source of the fade.

## 4. Cebraspe dual-exam tab fix

The `Tabs` component on `/exams/[id]/[specificosId]` renders `TabsList` vertically on the left side, and both `TabsContent` areas show simultaneously. Fix the CSS/component structure so tabs render horizontally at the top and only the active tab's content is visible.

## New dependencies

- `react-markdown` — lightweight Markdown renderer for question statements.

## Testing

- Manual verification using existing uploaded exams:
  - `/exams/019cc9bb-40a5-7ae1-a438-6111e4773406` (FGV with gabarito)
  - `/exams/019cc9e5-b2e4-70f7-8a3b-81a0fa1382a2/019cc9e5-c216-7b9d-8ef7-c2dc4834d766` (Cebraspe dual-booklet)
- Chrome DevTools / screenshot skill for visual verification.
- Unit tests for `gridReducer` updates (remove multi mode references, verify existing actions still work).

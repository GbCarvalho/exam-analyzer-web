'use client'

import { useReducer, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { gridReducer, createInitialState } from '@/lib/answer-grid-reducer'
import {
  isValidAnswerKey,
  isValidInputKey,
  mapNumericKey,
  parseAnswerString,
} from '@/lib/answer-utils'
import type { Question } from '@/lib/types'

interface Props {
  questions: Question[]
  provider: string
  onSubmit: (answers: (string | null)[]) => void
  loading?: boolean
}

const PROVIDER_KEYS: Record<string, string[]> = {
  cebraspe: ['C', 'E'],
  fgv: ['A', 'B', 'C', 'D', 'E'],
  unknown: ['A', 'B', 'C', 'D', 'E'],
}

export function AnswerGrid({ questions, provider, onSubmit, loading }: Props) {
  const count = questions.length
  const [state, dispatch] = useReducer(gridReducer, createInitialState(count, 'all'))
  const containerRef = useRef<HTMLDivElement>(null)
  const pasteInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.mode === 'all') containerRef.current?.focus()
  }, [state.mode])

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
      if (state.mode !== 'all') return

      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'CLEAR', index: state.cursor })
        dispatch({ type: 'BACK' })
        return
      }

      if (e.key === 'Tab' || e.key.toUpperCase() === 'T') {
        e.preventDefault()
        dispatch({ type: 'SET_MODE', mode: 'single' })
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit(state.answers)
        return
      }

      if (!isValidInputKey(e.key === ' ' ? ' ' : e.key.toUpperCase(), provider) &&
          e.key !== ' ') return

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
    [state, provider, onSubmit, resolveKey],
  )

  function handlePasteSubmit(raw: string) {
    const parsed = parseAnswerString(raw, count)
    dispatch({ type: 'PASTE', values: parsed })
    if (pasteInputRef.current) pasteInputRef.current.value = ''
  }

  const keys = PROVIDER_KEYS[provider] ?? PROVIDER_KEYS.unknown
  const answered = state.answers.filter((a) => a !== null).length
  const allFilled = answered === count

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          size="sm"
          variant={state.mode === 'all' ? 'default' : 'outline'}
          onClick={() => dispatch({ type: 'SET_MODE', mode: 'all' })}
        >
          Todas as questões
        </Button>
        <Button
          size="sm"
          variant={state.mode === 'single' ? 'default' : 'outline'}
          onClick={() => dispatch({ type: 'SET_MODE', mode: 'single' })}
        >
          Questão única
        </Button>
        <Button
          size="sm"
          variant={state.mode === 'multi' ? 'default' : 'outline'}
          onClick={() => dispatch({ type: 'SET_MODE', mode: 'multi' })}
        >
          Edição múltipla
        </Button>
        <span className="text-muted-foreground text-xs">
          Tab alterna modo · Espaço = em branco · X = em branco ao colar
        </span>
      </div>

      {/* Paste field */}
      <div className="flex gap-2">
        <Input
          ref={pasteInputRef}
          placeholder="Cole suas respostas aqui (ex: CCEECC... · X = em branco)"
          className="font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasteSubmit((e.target as HTMLInputElement).value)
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (pasteInputRef.current) handlePasteSubmit(pasteInputRef.current.value)
          }}
        >
          Colar
        </Button>
      </div>

      {/* ── All questions mode ── */}
      {state.mode === 'all' && (
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="grid grid-cols-10 gap-1 outline-none focus:ring-2 focus:ring-ring rounded p-2"
          aria-label="Grade de respostas — digite a resposta para avançar"
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
      )}

      {/* ── Single question mode ── */}
      {state.mode === 'single' && (
        <div className="space-y-4">
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

          <p className="text-sm leading-relaxed border rounded p-3 bg-muted/40">
            {questions[state.cursor]?.statement ?? '—'}
          </p>

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
        </div>
      )}

      {/* ── Multi-edit mode ── */}
      {state.mode === 'multi' && (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div key={q.number} className="flex gap-3 items-start text-sm">
              <span className="font-mono text-muted-foreground w-8 shrink-0 pt-1">
                {q.number}.
              </span>
              <span className="flex-1 leading-relaxed">{q.statement}</span>
              <Input
                className="w-14 text-center font-mono uppercase h-8 shrink-0"
                maxLength={1}
                value={state.answers[i] ?? ''}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    dispatch({ type: 'CLEAR', index: i })
                    return
                  }
                  const upper = raw.toUpperCase()
                  if (upper === 'X') {
                    dispatch({ type: 'CLEAR', index: i })
                    return
                  }
                  const mapped = mapNumericKey(raw, provider) ?? upper
                  if (isValidAnswerKey(mapped, provider)) {
                    dispatch({ type: 'SET_ANSWER', index: i, value: mapped })
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Progress + submit */}
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm text-muted-foreground">
          {answered} / {count} respondidas
        </span>
        <Button onClick={() => onSubmit(state.answers)} disabled={loading || !allFilled}>
          {loading ? 'Analisando...' : 'Ver resultado'}
        </Button>
      </div>
    </div>
  )
}

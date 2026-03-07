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
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-0.5">
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

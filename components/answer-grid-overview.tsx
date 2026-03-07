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

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

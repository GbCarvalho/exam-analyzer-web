'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { patchQuestion, ApiError } from '@/lib/api'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

export function QuestionList({ examId, questions }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState<number | null>(null)

  if (questions.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma questão extraída.</p>
  }

  async function handleBlur(q: Question, newStatement: string) {
    if (newStatement === q.statement) return
    setSaving(q.number)
    try {
      await patchQuestion(examId, q.number, newStatement)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar questão')
    } finally {
      setSaving(null)
    }
  }

  return (
    <ol className="space-y-3">
      {questions.map((q) => (
        <li
          key={q.number}
          className="flex gap-3 text-sm rounded-lg bg-card ring-1 ring-foreground/[0.06] p-4 transition-colors hover:ring-foreground/10"
        >
          <span className="font-mono text-muted-foreground w-7 shrink-0 pt-0.5 text-right">
            {q.number}.
          </span>
          <textarea
            className="flex-1 bg-transparent resize-none leading-relaxed outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1"
            defaultValue={q.statement}
            rows={2}
            aria-label={`Enunciado da questão ${q.number}`}
            onBlur={(e) => handleBlur(q, e.target.value.trim())}
          />
          <div className="flex gap-1 shrink-0 items-start pt-1">
            {saving === q.number && (
              <span className="text-xs text-muted-foreground">salvando...</span>
            )}
            {q.manual && saving !== q.number && (
              <Badge variant="secondary" className="text-xs">editado</Badge>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

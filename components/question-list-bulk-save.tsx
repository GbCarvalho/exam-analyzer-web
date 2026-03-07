'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { patchQuestions, ApiError } from '@/lib/api'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

export function QuestionListBulkSave({ examId, questions }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSaveAll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const updates = questions.map((q) => ({
      number: q.number,
      statement: ((fd.get(`q-${q.number}`) as string) ?? q.statement).trim(),
    }))

    setSaving(true)
    try {
      await patchQuestions(examId, updates)
      toast.success('Questões salvas')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar questões')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSaveAll} className="space-y-3">
      {questions.map((q) => (
        <div key={q.number} className="flex gap-3 text-sm">
          <span className="font-mono text-muted-foreground w-6 shrink-0 pt-1">
            {q.number}.
          </span>
          <textarea
            name={`q-${q.number}`}
            defaultValue={q.statement}
            rows={2}
            className="flex-1 bg-transparent resize-none leading-relaxed outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1"
            aria-label={`Enunciado da questão ${q.number}`}
          />
        </div>
      ))}
      <Button type="submit" disabled={saving} variant="outline" size="sm">
        {saving ? 'Salvando...' : 'Salvar todas as edições'}
      </Button>
    </form>
  )
}
